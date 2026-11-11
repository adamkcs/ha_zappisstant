"""Scheduling logic for the weekly charge plan.

Kept free of Home Assistant imports so it can be unit tested on its own.

A schedule has one plan per weekday (Monday first). Each plan has up to five
half-hour aligned intervals inside that calendar day and the kWh to deliver.

A day's "charge" is its intervals turned into windows, in minutes from that
day's midnight. When a day's last interval runs to 24:00 and the next day
starts with a 00:00 interval, the two form one overnight window (e.g. 22:00
to 05:00 is 1320–1740) belonging to the first day: it uses that day's kWh, and
the next day's own charge starts after it.

A "run" tracks one charge while it executes: how much energy has been
delivered since its first window began.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta
from typing import Any

DAYS = 7
DAY_MINUTES = 24 * 60
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

Overrides = dict[str, dict[str, Any]]


def parse_time(value: str) -> int:
    """Convert "HH:MM" to minutes since midnight, allowing "24:00" as the end of day."""
    try:
        hours, minutes = (int(part) for part in value.split(":"))
    except (AttributeError, ValueError) as err:
        raise ValueError(f"Invalid time {value!r}, expected HH:MM") from err
    total = hours * 60 + minutes
    if minutes not in (0, 30) or not 0 <= total <= DAY_MINUTES:
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

        intervals: list[tuple[int, int, bool]] = []
        for interval in day.get("intervals") or []:
            start, end = parse_time(interval["start"]), parse_time(interval["end"])
            if end <= start:
                raise ValueError(f"Interval {interval['start']}–{interval['end']} must end after it starts")
            intervals.append((start, end, bool(interval.get("overrun", False))))
        intervals.sort()
        merged: list[tuple[int, int, bool]] = []
        for start, end, overrun in intervals:
            if merged and start < merged[-1][1]:
                raise ValueError("Intervals must not overlap")
            if merged and start == merged[-1][1]:
                # Back-to-back intervals are one interval.
                prev_start, _, prev_overrun = merged.pop()
                start, overrun = prev_start, prev_overrun or overrun
            merged.append((start, end, overrun))
        if len(merged) > MAX_INTERVALS:
            raise ValueError(f"At most {MAX_INTERVALS} intervals per day")

        days.append(
            {
                "enabled": bool(day.get("enabled", False)),
                "start_percent": _percent(day.get("start_percent"), "Start %"),
                "target_percent": _percent(day.get("target_percent"), "Target %"),
                "kwh": kwh,
                "kwh_manual": bool(day.get("kwh_manual", False)),
                "intervals": [
                    {"start": format_time(start), "end": format_time(end), "overrun": overrun}
                    for start, end, overrun in merged
                ],
            }
        )
    return {"enabled": bool(data.get("enabled", False)), "days": days}


def validate_override(data: dict[str, Any]) -> dict[str, Any]:
    """Check a one-off adjustment for a single date. Raises ValueError."""
    kwh = float(data["kwh"])
    if not 0 <= kwh <= MAX_KWH:
        raise ValueError(f"kWh must be between 0 and {MAX_KWH}")
    return {"start_percent": _percent(data.get("start_percent"), "Start %"), "kwh": kwh}


@dataclass
class Window:
    """A charging window in minutes from its day's midnight; may run past 1440 into the next day."""

    start: int
    end: int
    overrun: bool

    def as_interval(self) -> dict[str, Any]:
        return {
            "start": format_time(self.start),
            "end": format_time(self.end if self.end <= DAY_MINUTES else self.end - DAY_MINUTES),
            "overrun": self.overrun,
            "ends_next_day": self.end > DAY_MINUTES,
        }


def _plan(schedule: dict[str, Any], day: date, overrides: Overrides | None) -> dict[str, Any]:
    """The weekly plan for a date, with any one-off kWh override applied."""
    plan = schedule["days"][day.weekday()]
    override = (overrides or {}).get(day.isoformat())
    return {**plan, "kwh": override["kwh"]} if override is not None else plan


def _intervals(plan: dict[str, Any]) -> list[Window]:
    return [
        Window(parse_time(iv["start"]), parse_time(iv["end"]), iv["overrun"]) for iv in plan["intervals"]
    ]


def _runs_overnight(schedule: dict[str, Any], day: date, overrides: Overrides | None) -> bool:
    """Whether the day's charge continues into the next day's 00:00 interval.

    The day's last interval must end at 24:00 and start after 00:00, so it is the day's own
    interval rather than the tail of the previous night's charge.
    """
    plan = _plan(schedule, day, overrides)
    if not plan["enabled"] or not plan["kwh"] or not plan["intervals"]:
        return False
    last = _intervals(plan)[-1]
    return last.end == DAY_MINUTES and last.start > 0


def day_charge(schedule: dict[str, Any], day: date, overrides: Overrides | None = None) -> dict[str, Any] | None:
    """The charge a date's plan runs, as {"kwh", "windows"}, or None if there's nothing to do."""
    plan = _plan(schedule, day, overrides)
    if not plan["enabled"] or not plan["kwh"]:
        return None
    windows = _intervals(plan)
    yesterday, tomorrow = day - timedelta(days=1), day + timedelta(days=1)
    if windows and windows[0].start == 0 and _runs_overnight(schedule, yesterday, overrides):
        windows = windows[1:]  # the end of last night's charge
    if not windows:
        return None
    if _runs_overnight(schedule, day, overrides):
        next_plan = _plan(schedule, tomorrow, overrides)
        next_windows = _intervals(next_plan) if next_plan["enabled"] else []
        if next_windows and next_windows[0].start == 0:
            first = next_windows[0]
            last = windows[-1]
            windows[-1] = Window(last.start, DAY_MINUTES + first.end, last.overrun or first.overrun)
    return {"kwh": plan["kwh"], "windows": windows}


def _window_at(windows: list[Window], minute: int) -> Window | None:
    return next((w for w in windows if w.start <= minute < w.end), None)


def _minute_of(now: datetime, day: date) -> int:
    """Minutes from the given day's midnight to now."""
    return (now.date() - day).days * DAY_MINUTES + now.hour * 60 + now.minute


def upcoming(schedule: dict[str, Any], now: datetime, overrides: Overrides | None = None) -> dict[str, Any] | None:
    """The next charge the schedule will run, including one already in progress."""
    if not schedule["enabled"]:
        return None
    # From yesterday, whose overnight charge may still be running, to a week ahead.
    for offset in range(-1, DAYS + 1):
        day = now.date() + timedelta(days=offset)
        charge = day_charge(schedule, day, overrides)
        if charge is None:
            continue
        minute = _minute_of(now, day)
        if all(w.end <= minute for w in charge["windows"]):
            continue
        weekly = schedule["days"][day.weekday()]
        override = (overrides or {}).get(day.isoformat())
        return {
            "date": day.isoformat(),
            "intervals": [w.as_interval() for w in charge["windows"] if w.end > minute],
            "start_percent": override["start_percent"] if override else weekly["start_percent"],
            "target_percent": weekly["target_percent"],
            "kwh": charge["kwh"],
            "planned_kwh": weekly["kwh"],
            "overridden": override is not None,
        }
    return None


def next_interval(schedule: dict[str, Any], now: datetime, overrides: Overrides | None = None) -> dict[str, Any] | None:
    """The next window that hasn't started yet, today or in a charge that's under way."""
    charge = upcoming(schedule, now, overrides)
    if charge is None:
        return None
    day = date.fromisoformat(charge["date"])
    windows = day_charge(schedule, day, overrides)["windows"]  # type: ignore[index]
    minute = _minute_of(now, day)
    return next((w.as_interval() for w in windows if w.start > minute), None)


@dataclass
class Run:
    """Progress of one day's charge."""

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
    overrides: Overrides | None = None,
) -> tuple[Run | None, Decision]:
    """Update the run for the current time and session energy, and decide whether to charge."""
    if not schedule["enabled"]:
        return None, Decision(STATE_DISABLED)

    today = now.date()
    run_started = False
    # A window is open now: today's, or yesterday's overnight one. Its charge takes over
    # from any earlier run.
    for day in (today, today - timedelta(days=1)):
        charge = day_charge(schedule, day, overrides)
        if charge is None or not _window_at(charge["windows"], _minute_of(now, day)):
            continue
        if run is None or run.date < day.isoformat():
            run = Run(date=day.isoformat(), kwh=charge["kwh"], last_session=session_kwh)
            run_started = True
        break
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
    charge = day_charge(schedule, run_date, overrides)
    # Drop runs whose plan was switched off, and overruns that have gone on for over a day.
    if charge is None or (today - run_date).days > 1:
        return None, Decision(STATE_IDLE)
    run.kwh = charge["kwh"]  # follow edits made while the run is in progress
    remaining = max(0.0, run.kwh - run.delivered)

    if remaining <= DONE_TOLERANCE_KWH:
        return run, Decision(STATE_DONE, run_started=run_started)

    minute = _minute_of(now, run_date)
    windows = charge["windows"]
    if in_slot := _window_at(windows, minute):
        return run, Decision(STATE_CHARGING, True, remaining, in_slot.as_interval(), run_started)
    # Once an overrun window has ended, kWh rather than time decides when to stop.
    if any(w.overrun and w.end <= minute for w in windows):
        return run, Decision(STATE_OVERRUN, True, remaining, None, run_started)
    if any(w.start > minute for w in windows):
        return run, Decision(STATE_WAITING, False, remaining, None, run_started)
    return run, Decision(STATE_ENDED, False, remaining, None, run_started)
