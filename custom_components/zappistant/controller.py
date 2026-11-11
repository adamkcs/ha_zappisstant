"""Runs the weekly charge plan against the myenergi zappi entities."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
import math
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_CHARGE_RATE,
    CONF_MODE_ENTITY,
    CONF_PLUG_ENTITY,
    CONF_SESSION_ENTITY,
    CONF_STATUS_ENTITY,
    CONF_SWITCH_TO_STOPPED,
    DEFAULT_CHARGE_RATE,
    DISPATCH_SOURCE,
    DOMAIN,
    MYENERGI_DOMAIN,
)
from .planner import (
    BOOST_MANUAL,
    BOOST_SMART,
    STATE_DISABLED,
    Boost,
    Decision,
    Run,
    advance,
    empty_schedule,
    next_interval,
    planned_slots,
    ready_by_time,
    upcoming,
    validate_override,
    validate_schedule,
)

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
TICK = timedelta(minutes=1)
# The myenergi integration polls the cloud, so "Boosting" can take a while to show up.
BOOST_RETRY = timedelta(minutes=5)
MIN_BOOST_KWH = 1
MAX_BOOST_KWH = 99
UNPLUGGED = {"", "EV Disconnected"}
# A boost now that the zappi hasn't been running for this long has finished or been stopped.
MANUAL_BOOST_GRACE = timedelta(minutes=10)


class ScheduleController:
    """Keeps the schedule, tracks progress and starts or stops boosts."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.mode_entity: str = entry.data[CONF_MODE_ENTITY]
        self.session_entity: str = entry.data[CONF_SESSION_ENTITY]
        self.plug_entity: str = entry.data[CONF_PLUG_ENTITY]
        self.status_entity: str = entry.data[CONF_STATUS_ENTITY]
        self.switch_to_stopped: bool = entry.options.get(
            CONF_SWITCH_TO_STOPPED, entry.data.get(CONF_SWITCH_TO_STOPPED, True)
        )
        self.charge_rate: float = entry.options.get(
            CONF_CHARGE_RATE, entry.data.get(CONF_CHARGE_RATE, DEFAULT_CHARGE_RATE)
        )
        self.schedule: dict[str, Any] = empty_schedule()
        # Boosts started from the card, kept so the charging plan includes them.
        self.boosts: list[Boost] = []
        # One-off adjustments keyed by ISO date, e.g. a different start % for one evening.
        self.overrides: dict[str, dict[str, Any]] = {}
        self.run: Run | None = None
        self.decision = Decision(STATE_DISABLED)
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        # Only stop boosts this controller started, never one the user started by hand.
        self._boost_started = False
        self._last_boost_call: datetime | None = None
        self._lock = asyncio.Lock()
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []

    async def async_start(self) -> None:
        data = await self._store.async_load() or {}
        if data.get("schedule"):
            try:
                self.schedule = validate_schedule(data["schedule"])
            except (ValueError, KeyError, TypeError):
                _LOGGER.warning("Stored schedule is invalid, starting with an empty one")
        self.overrides = data.get("overrides") or {}
        self.boosts = [Boost.from_dict(boost) for boost in data.get("boosts") or []]
        self.run = Run.from_dict(data.get("run"))
        self._boost_started = data.get("boost_started", False)

        self._unsubs.append(async_track_time_interval(self.hass, self._async_tick, TICK))
        self._unsubs.append(
            async_track_state_change_event(
                self.hass,
                [self.session_entity, self.plug_entity, self.status_entity],
                self._async_state_changed,
            )
        )
        await self.async_update()

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        await self._store.async_save(self._data())

    @callback
    def async_add_listener(self, update_callback: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.append(update_callback)
        return lambda: self._listeners.remove(update_callback)

    async def async_set_schedule(self, schedule: dict[str, Any]) -> dict[str, Any]:
        """Replace the schedule. Raises ValueError (or KeyError/TypeError) for invalid input."""
        self.schedule = validate_schedule(schedule)
        await self.async_update()
        return self.schedule

    async def async_set_override(self, day: str, override: dict[str, Any] | None) -> None:
        """Adjust one date's charge, or clear the adjustment with None. Raises ValueError."""
        day = date.fromisoformat(day).isoformat()
        if override is None:
            self.overrides.pop(day, None)
        else:
            self.overrides[day] = validate_override(override)
        await self.async_update()

    async def async_boost(
        self, kind: str, kwh: float, ready_by: str | None = None, switch_to_stopped: bool = False
    ) -> None:
        """Start a boost now or a smart boost, and add it to the charging plan."""
        now = dt_util.now()
        if switch_to_stopped and self._state(self.mode_entity) not in (None, "Stopped"):
            await self._async_call("select", "select_option", {"option": "Stopped"})
        if kind == BOOST_SMART:
            if not ready_by:
                raise ValueError("Smart boost needs a ready-by time")
            deadline = ready_by_time(now, ready_by)
            await self._async_call(
                MYENERGI_DOMAIN, "myenergi_smart_boost", {"amount": kwh, "when": deadline.strftime("%H:%M")}
            )
        else:
            deadline = None
            await self._async_call(MYENERGI_DOMAIN, "myenergi_boost", {"amount": kwh})
        # A new boost replaces the zappi's previous one.
        self.boosts = [
            Boost(
                kind=kind,
                kwh=kwh,
                started=now.isoformat(),
                ready_by=deadline.isoformat() if deadline else None,
                last_session=self._float_state(self.session_entity),
            )
        ]
        await self.async_update()

    async def async_stop_boost(self) -> None:
        await self._async_call(MYENERGI_DOMAIN, "myenergi_stop_boost", {})
        self.boosts = []
        await self.async_update()

    def planned_dispatches(self) -> list[dict[str, Any]]:
        """Expected charging in the format Predbat reads from a car charging slot sensor."""
        slots = planned_slots(
            self.schedule, self.run, dt_util.now(), self.charge_rate, self.overrides, self.boosts
        )
        return [
            {
                "start": start.isoformat(timespec="seconds"),
                "end": end.isoformat(timespec="seconds"),
                "charge_in_kwh": round(kwh, 2),
                "source": DISPATCH_SOURCE,
                "location": "AT_HOME",
            }
            for start, end, kwh in slots
        ]

    def _update_boosts(self, now: datetime) -> None:
        session = self._float_state(self.session_entity)
        unplugged = self._state(self.plug_entity) in UNPLUGGED
        boosting = self._state(self.status_entity) == "Boosting"
        kept = []
        for boost in self.boosts:
            boost.track(session)
            idle_manual = (
                boost.kind == BOOST_MANUAL
                and not boosting
                and now - datetime.fromisoformat(boost.started) > MANUAL_BOOST_GRACE
            )
            if not (boost.finished(now) or unplugged or idle_manual):
                kept.append(boost)
        self.boosts = kept

    async def async_set_enabled(self, enabled: bool) -> None:
        self.schedule = {**self.schedule, "enabled": enabled}
        await self.async_update()

    def status(self) -> dict[str, Any]:
        now = dt_util.now()
        return {
            "state": self.decision.state,
            "run_date": self.run.date if self.run else None,
            "planned_kwh": self.run.kwh if self.run else None,
            "delivered_kwh": round(self.run.delivered, 2) if self.run else None,
            "remaining_kwh": round(self.decision.remaining, 2),
            "current_interval": self.decision.interval,
            "next_interval": next_interval(self.schedule, now, self.overrides),
            "upcoming": upcoming(self.schedule, now, self.overrides),
        }

    async def _async_tick(self, _now: datetime) -> None:
        await self.async_update()

    async def _async_state_changed(self, _event: Event) -> None:
        await self.async_update()

    async def async_update(self) -> None:
        async with self._lock:
            now = dt_util.now()
            # Yesterday's override can still matter while its charge overruns past midnight.
            oldest = (now.date() - timedelta(days=1)).isoformat()
            self.overrides = {day: o for day, o in self.overrides.items() if day >= oldest}
            self._update_boosts(now)
            self.run, self.decision = advance(
                self.schedule, self.run, now, self._float_state(self.session_entity), self.overrides
            )
            try:
                await self._async_apply(now)
            except HomeAssistantError:
                # Try again on the next tick rather than stopping the schedule.
                _LOGGER.exception("Failed to control the zappi")
            self._store.async_delay_save(self._data, 5)
            for listener in list(self._listeners):
                listener()

    async def _async_apply(self, now: datetime) -> None:
        decision = self.decision
        boosting = self._state(self.status_entity) == "Boosting"
        plug = self._state(self.plug_entity)
        plugged = plug is not None and plug not in UNPLUGGED

        if decision.run_started and self.switch_to_stopped and self._state(self.mode_entity) not in (
            None,
            "Stopped",
        ):
            # Without this the zappi keeps charging in its own mode outside the slots.
            await self._async_call("select", "select_option", {"option": "Stopped"})

        if decision.charge:
            retry_due = self._last_boost_call is None or now - self._last_boost_call >= BOOST_RETRY
            if plugged and not boosting and retry_due:
                amount = min(MAX_BOOST_KWH, max(MIN_BOOST_KWH, math.ceil(decision.remaining)))
                self._last_boost_call = now
                self._boost_started = True
                _LOGGER.info("Starting scheduled boost of %s kWh", amount)
                await self._async_call(MYENERGI_DOMAIN, "myenergi_boost", {"amount": amount})
        elif self._boost_started:
            self._boost_started = False
            self._last_boost_call = None
            if boosting:
                _LOGGER.info("Stopping scheduled boost (%s)", decision.state)
                await self._async_call(MYENERGI_DOMAIN, "myenergi_stop_boost", {})

    async def _async_call(self, domain: str, service: str, data: dict[str, Any]) -> None:
        await self.hass.services.async_call(
            domain, service, data, target={"entity_id": self.mode_entity}, blocking=True
        )

    def _state(self, entity_id: str) -> str | None:
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE):
            return None
        return state.state

    def _float_state(self, entity_id: str) -> float | None:
        try:
            return float(self._state(entity_id))  # type: ignore[arg-type]
        except (TypeError, ValueError):
            return None

    def _data(self) -> dict[str, Any]:
        return {
            "schedule": self.schedule,
            "overrides": self.overrides,
            "boosts": [boost.as_dict() for boost in self.boosts],
            "run": self.run.as_dict() if self.run else None,
            "boost_started": self._boost_started,
        }
