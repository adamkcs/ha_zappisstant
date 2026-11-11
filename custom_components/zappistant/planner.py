"""Scheduling logic for the weekly charge plan.

Kept free of Home Assistant imports so it can be unit tested on its own.

A schedule has one plan per weekday (Monday first). Each plan has up to five
half-hour aligned intervals inside that calendar day and the kWh to deliver.
A "run" tracks one day's plan while it executes: how much energy has been
delivered since its first interval began.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime
from typing import Any

DAYS = 7
SLOT_MINUTES = 30
MAX_INTERVALS = 5
MAX_KWH = 200
# Stop treating a run as unfinished once it is this close to its target,
# since the session sensor and the zappi's own boost counter drift a little.
DONE_TOLERANCE_KWH = 0.5

STATE_DISABLED = "disabled"
STATE_IDLE = "idle"
STATE_WAITING = "waiting"
STATE_CHARGING = "charging"
STATE_OVERRUN = "overrun"
STATE_DONE = "done"
STATE_ENDED = "ended"


def parse_time(value: str) -> int:
    """Convert "HH:MM" to minutes since midnight, allowing "24:00" as the end of day."""
    try:
        hours, minutes = (int(part) for part in value.split(":"))
    except (AttributeError, ValueError) as err:
        raise ValueError(f"Invalid time {value!r}, expected HH:MM") from err
    total = hours * 60 + minutes
    if minutes not in (0, 30) or not 0 <= total <= 24 * 60:
        raise ValueError(f"Time {value!r} must be on the hour or half hour")
    return total


def format_time(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def _percent(value: Any, field: str) -> float | None:
    if value is None:
        return None
    number = float(value)
    if not 0 <= number <= 100:
        raise ValueError(f"{field} must be between 0 and 100")
    return number


def empty_day() -> dict[str, Any]:
    return {
        "enabled": False,
        "start_percent": None,
        "target_percent": None,
        "kwh": None,
        "kwh_manual": False,
        "intervals": [],
    }


def empty_schedule() -> dict[str, Any]:
    return {"enabled": False, "days": [empty_day() for _ in range(DAYS)]}


def validate_schedule(data: Any) -> dict[str, Any]:
    """Check a schedule and return it in normalized form. Raises ValueError."""
    if not isinstance(data, dict) or not isinstance(data.get("days"), list):
        raise ValueError("Schedule must have a list of days")
    if len(data["days"]) != DAYS:
        raise ValueError(f"Schedule must have {DAYS} days")

    days = []
    for index, day in enumerate(data["days"]):
        if not isinstance(day, dict):
            raise ValueError(f"Day {index} must be an object")
        kwh = day.get("kwh")
        if kwh is not None:
            kwh = float(kwh)
            if not 0 <= kwh <= MAX_KWH:
                raise ValueError(f"kWh must be between 0 and {MAX_KWH}")

        intervals = []
        for interval in day.get("intervals") or []:
            start, end = parse_time(interval["start"]), parse_time(interval["end"])
            if end <= start:
                raise ValueError(f"Interval {interval['start']}–{interval['end']} must end after it starts")
            intervals.append((start, end, bool(interval.get("overrun", False))))
        intervals.sort()
        if len(intervals) > MAX_INTERVALS:
            raise ValueError(f"At most {MAX_INTERVALS} intervals per day")
        for (_, prev_end, _), (start, _, _) in zip(intervals, intervals[1:]):
            if start < prev_end:
                raise ValueError("Intervals must not overlap")

        days.append(
            {
                "enabled": bool(day.get("enabled", False)),
                "start_percent": _percent(day.get("start_percent"), "Start %"),
                "target_percent": _percent(day.get("target_percent"), "Target %"),
                "kwh": kwh,
                "kwh_manual": bool(day.get("kwh_manual", False)),
                "intervals": [
                    {"start": format_time(start), "end": format_time(end), "overrun": overrun}
                    for start, end, overrun in intervals
                ],
            }
        )
    return {"enabled": bool(data.get("enabled", False)), "days": days}


def active_plan(schedule: dict[str, Any], day: date) -> dict[str, Any] | None:
    """The plan for a date, if it is enabled and has something to do."""
    plan = schedule["days"][day.weekday()]
    if not plan["enabled"] or not plan["intervals"] or not plan["kwh"]:
        return None
    return plan


def interval_at(plan: dict[str, Any], minute: int) -> dict[str, Any] | None:
    for interval in plan["intervals"]:
        if parse_time(interval["start"]) <= minute < parse_time(interval["end"]):
            return interval
    return None


def next_interval(plan: dict[str, Any], minute: int) -> dict[str, Any] | None:
    for interval in plan["intervals"]:
        if parse_time(interval["start"]) > minute:
            return interval
    return None


@dataclass
class Run:
    """Progress of one day's plan."""

    date: str
    kwh: float
    delivered: float = 0.0
    last_session: float | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> Run | None:
        return cls(**data) if data else None

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Decision:
    """What the charger should be doing right now."""

    state: str
    charge: bool = False
    remaining: float = 0.0
    interval: dict[str, Any] | None = None
    run_started: bool = False


def advance(
    schedule: dict[str, Any],
    run: Run | None,
    now: datetime,
    session_kwh: float | None,
) -> tuple[Run | None, Decision]:
    """Update the run for the current time and session energy, and decide whether to charge."""
    if not schedule["enabled"]:
        return None, Decision(STATE_DISABLED)

    minute = now.hour * 60 + now.minute
    today = now.date()
    plan = active_plan(schedule, today)
    current = interval_at(plan, minute) if plan else None

    run_started = False
    if current and (run is None or run.date != today.isoformat()):
        # Today's first interval has begun; it takes over from any earlier run.
        run = Run(date=today.isoformat(), kwh=plan["kwh"], last_session=session_kwh)
        run_started = True
    if run is None:
        return None, Decision(STATE_IDLE)

    # Count energy added since the run began. The session counter resets when the car is
    # plugged in again, in which case everything it shows is new.
    if session_kwh is not None:
        if run.last_session is not None:
            run.delivered += (
                session_kwh - run.last_session if session_kwh >= run.last_session else session_kwh
            )
        run.last_session = session_kwh

    run_date = date.fromisoformat(run.date)
    run_plan = active_plan(schedule, run_date)
    # Drop runs whose plan was switched off, and overruns that have gone on for over a day.
    if run_plan is None or (today - run_date).days > 1:
        return None, Decision(STATE_IDLE)
    run.kwh = run_plan["kwh"]  # follow edits made while the run is in progress
    remaining = max(0.0, run.kwh - run.delivered)

    if remaining <= DONE_TOLERANCE_KWH:
        return run, Decision(STATE_DONE, run_started=run_started)

    same_day = run_date == today
    in_slot = interval_at(run_plan, minute) if same_day else None
    # Once an overrun interval has ended, kWh rather than time decides when to stop.
    overrun = any(
        interval["overrun"] and (not same_day or parse_time(interval["end"]) <= minute)
        for interval in run_plan["intervals"]
    )

    if in_slot:
        return run, Decision(STATE_CHARGING, True, remaining, in_slot, run_started)
    if overrun:
        return run, Decision(STATE_OVERRUN, True, remaining, None, run_started)
    if same_day and next_interval(run_plan, minute):
        return run, Decision(STATE_WAITING, False, remaining, None, run_started)
    return run, Decision(STATE_ENDED, False, remaining, None, run_started)
