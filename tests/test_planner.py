"""Unit tests for the schedule planner. Run with: python3 -m unittest discover tests"""

import importlib.util
import sys
import unittest
from datetime import datetime
from pathlib import Path

# Load planner.py directly so the test doesn't need Home Assistant installed.
_PATH = Path(__file__).parent.parent / "custom_components" / "zappistant" / "planner.py"
_spec = importlib.util.spec_from_file_location("planner", _PATH)
planner = importlib.util.module_from_spec(_spec)
sys.modules["planner"] = planner  # dataclasses look their module up here
_spec.loader.exec_module(planner)

# 2026-11-10 is a Tuesday (weekday 1).
TUESDAY = 1


def schedule_with(day_index, intervals, kwh=10.0, enabled=True):
    schedule = planner.empty_schedule()
    schedule["enabled"] = enabled
    schedule["days"][day_index] = {
        **planner.empty_day(),
        "enabled": True,
        "kwh": kwh,
        "intervals": intervals,
    }
    return planner.validate_schedule(schedule)


def at(day, hour, minute=0):
    return datetime(2026, 11, day, hour, minute)


class ValidateTest(unittest.TestCase):
    def test_sorts_and_normalizes(self):
        schedule = schedule_with(
            TUESDAY,
            [{"start": "22:00", "end": "24:00"}, {"start": "01:00", "end": "02:30", "overrun": True}],
        )
        self.assertEqual(
            schedule["days"][TUESDAY]["intervals"],
            [
                {"start": "01:00", "end": "02:30", "overrun": True},
                {"start": "22:00", "end": "24:00", "overrun": False},
            ],
        )

    def test_rejects_bad_input(self):
        cases = {
            "not half hour": [{"start": "01:15", "end": "02:00"}],
            "end before start": [{"start": "03:00", "end": "02:00"}],
            "overlap": [{"start": "01:00", "end": "03:00"}, {"start": "02:00", "end": "04:00"}],
            "too many": [{"start": f"{h:02d}:00", "end": f"{h:02d}:30"} for h in range(6)],
        }
        for name, intervals in cases.items():
            with self.subTest(name), self.assertRaises(ValueError):
                schedule_with(TUESDAY, intervals)


class AdvanceTest(unittest.TestCase):
    def setUp(self):
        self.schedule = schedule_with(
            TUESDAY, [{"start": "01:00", "end": "03:00"}, {"start": "22:00", "end": "24:00"}]
        )

    def test_idle_before_first_interval(self):
        run, decision = planner.advance(self.schedule, None, at(10, 0, 30), 0.0)
        self.assertIsNone(run)
        self.assertEqual(decision.state, planner.STATE_IDLE)

    def test_disabled_schedule(self):
        self.schedule["enabled"] = False
        _, decision = planner.advance(self.schedule, None, at(10, 1), 0.0)
        self.assertEqual(decision.state, planner.STATE_DISABLED)

    def test_charges_in_slot_and_waits_between(self):
        run, decision = planner.advance(self.schedule, None, at(10, 1), 2.0)
        self.assertTrue(decision.run_started)
        self.assertTrue(decision.charge)
        self.assertEqual(decision.remaining, 10.0)

        run, decision = planner.advance(self.schedule, run, at(10, 3), 6.0)
        self.assertEqual(decision.state, planner.STATE_WAITING)
        self.assertFalse(decision.charge)
        self.assertEqual(decision.remaining, 6.0)  # 4 kWh delivered since the run began

        run, decision = planner.advance(self.schedule, run, at(10, 22), 6.0)
        self.assertEqual(decision.state, planner.STATE_CHARGING)
        self.assertFalse(decision.run_started)

    def test_session_reset_counts_new_energy(self):
        run, _ = planner.advance(self.schedule, None, at(10, 1), 8.0)
        run, decision = planner.advance(self.schedule, run, at(10, 1, 30), 3.0)  # car re-plugged
        self.assertEqual(run.delivered, 3.0)
        self.assertEqual(decision.remaining, 7.0)

    def test_done_when_target_reached(self):
        run, _ = planner.advance(self.schedule, None, at(10, 1), 0.0)
        run, decision = planner.advance(self.schedule, run, at(10, 2), 9.7)
        self.assertEqual(decision.state, planner.STATE_DONE)
        self.assertFalse(decision.charge)

    def test_ends_after_last_slot_without_overrun(self):
        run, _ = planner.advance(self.schedule, None, at(10, 22), 0.0)
        run, decision = planner.advance(self.schedule, run, at(11, 0, 30), 5.0)
        self.assertEqual(decision.state, planner.STATE_ENDED)
        self.assertFalse(decision.charge)

    def test_overrun_continues_past_midnight_until_kwh(self):
        schedule = schedule_with(TUESDAY, [{"start": "22:00", "end": "24:00", "overrun": True}])
        run, _ = planner.advance(schedule, None, at(10, 22), 0.0)
        run, decision = planner.advance(schedule, run, at(11, 0, 30), 5.0)
        self.assertEqual(decision.state, planner.STATE_OVERRUN)
        self.assertTrue(decision.charge)
        self.assertEqual(decision.remaining, 5.0)
        run, decision = planner.advance(schedule, run, at(11, 2), 10.0)
        self.assertEqual(decision.state, planner.STATE_DONE)

    def test_overrun_expires_after_a_day(self):
        schedule = schedule_with(TUESDAY, [{"start": "22:00", "end": "24:00", "overrun": True}])
        run, _ = planner.advance(schedule, None, at(10, 22), 0.0)
        run, decision = planner.advance(schedule, run, at(12, 9), 0.0)
        self.assertIsNone(run)
        self.assertEqual(decision.state, planner.STATE_IDLE)

    def test_next_day_plan_replaces_overrun(self):
        schedule = schedule_with(TUESDAY, [{"start": "22:00", "end": "24:00", "overrun": True}])
        schedule["days"][TUESDAY + 1] = {**schedule["days"][TUESDAY], "kwh": 4.0}
        run, _ = planner.advance(schedule, None, at(10, 22), 0.0)
        run, decision = planner.advance(schedule, run, at(11, 22), 3.0)
        self.assertTrue(decision.run_started)
        self.assertEqual(run.date, "2026-11-11")
        self.assertEqual(decision.remaining, 4.0)


if __name__ == "__main__":
    unittest.main()
