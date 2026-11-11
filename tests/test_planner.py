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


class OvernightTest(unittest.TestCase):
    """Tuesday 22:00–24:00 plus Wednesday 00:00–05:00 is one charge, using Tuesday's kWh."""

    def setUp(self):
        self.schedule = schedule_with(TUESDAY, [{"start": "22:00", "end": "24:00"}], kwh=10)
        self.schedule["days"][TUESDAY + 1] = {
            **planner.empty_day(),
            "enabled": True,
            "kwh": 30,
            "intervals": [
                {"start": "00:00", "end": "05:00", "overrun": False},
                {"start": "22:00", "end": "24:00", "overrun": False},
            ],
        }

    def test_merges_adjacent_intervals_when_validating(self):
        schedule = schedule_with(
            TUESDAY, [{"start": "20:00", "end": "22:00"}, {"start": "22:00", "end": "24:00", "overrun": True}]
        )
        self.assertEqual(
            schedule["days"][TUESDAY]["intervals"], [{"start": "20:00", "end": "24:00", "overrun": True}]
        )

    def test_upcoming_shows_one_overnight_slot(self):
        upcoming = planner.upcoming(self.schedule, at(10, 18))
        self.assertEqual(upcoming["date"], "2026-11-10")
        self.assertEqual(
            upcoming["intervals"],
            [{"start": "22:00", "end": "05:00", "overrun": False, "ends_next_day": True}],
        )
        self.assertEqual(upcoming["kwh"], 10)
        # Still Tuesday's charge at 01:00 on Wednesday; then Wednesday's own evening charge.
        self.assertEqual(planner.upcoming(self.schedule, at(11, 1))["date"], "2026-11-10")
        wednesday = planner.upcoming(self.schedule, at(11, 6))
        self.assertEqual(wednesday["date"], "2026-11-11")
        self.assertEqual(wednesday["kwh"], 30)
        self.assertEqual(wednesday["intervals"][0]["start"], "22:00")

    def test_one_run_across_midnight(self):
        run, decision = planner.advance(self.schedule, None, at(10, 22), 0.0)
        self.assertTrue(decision.run_started)
        run, decision = planner.advance(self.schedule, run, at(11, 1), 4.0)
        self.assertEqual(run.date, "2026-11-10")
        self.assertFalse(decision.run_started)
        self.assertEqual(decision.state, planner.STATE_CHARGING)
        self.assertEqual(decision.remaining, 6.0)  # Tuesday's 10 kWh, not Wednesday's 30
        run, decision = planner.advance(self.schedule, run, at(11, 5), 7.0)
        self.assertEqual(decision.state, planner.STATE_ENDED)
        run, decision = planner.advance(self.schedule, run, at(11, 22), 7.0)
        self.assertTrue(decision.run_started)
        self.assertEqual(decision.remaining, 30.0)

    def test_starts_overnight_run_after_midnight(self):
        # E.g. Home Assistant restarted, or the schedule was saved at 01:00.
        run, decision = planner.advance(self.schedule, None, at(11, 1), 0.0)
        self.assertEqual(run.date, "2026-11-10")
        self.assertEqual(decision.remaining, 10.0)

    def test_no_merge_when_evening_day_is_off(self):
        self.schedule["days"][TUESDAY]["enabled"] = False
        run, decision = planner.advance(self.schedule, None, at(11, 1), 0.0)
        self.assertEqual(run.date, "2026-11-11")
        self.assertEqual(decision.remaining, 30.0)

    def test_overrun_on_merged_slot_applies_at_its_end(self):
        self.schedule["days"][TUESDAY + 1]["intervals"][0]["overrun"] = True
        run, _ = planner.advance(self.schedule, None, at(10, 22), 0.0)
        run, decision = planner.advance(self.schedule, run, at(11, 5, 30), 4.0)
        self.assertEqual(decision.state, planner.STATE_OVERRUN)


class OverrideTest(unittest.TestCase):
    def setUp(self):
        self.schedule = schedule_with(TUESDAY, [{"start": "22:00", "end": "24:00"}], kwh=20)
        self.schedule["days"][TUESDAY]["start_percent"] = 45
        self.schedule["days"][TUESDAY]["target_percent"] = 80

    def test_override_replaces_kwh_for_that_date_only(self):
        overrides = {"2026-11-10": planner.validate_override({"kwh": 16, "start_percent": 52})}
        _, decision = planner.advance(self.schedule, None, at(10, 22), 0.0, overrides)
        self.assertEqual(decision.remaining, 16)
        # A week later the weekly plan applies again.
        _, decision = planner.advance(self.schedule, None, at(17, 22), 0.0, overrides)
        self.assertEqual(decision.remaining, 20)

    def test_zero_kwh_override_skips_the_charge(self):
        overrides = {"2026-11-10": planner.validate_override({"kwh": 0})}
        run, decision = planner.advance(self.schedule, None, at(10, 22), 0.0, overrides)
        self.assertIsNone(run)
        self.assertEqual(decision.state, planner.STATE_IDLE)

    def test_upcoming_today_then_next_week(self):
        upcoming = planner.upcoming(self.schedule, at(10, 18))
        self.assertEqual(upcoming["date"], "2026-11-10")
        self.assertEqual(upcoming["start_percent"], 45)
        self.assertEqual(upcoming["target_percent"], 80)
        self.assertEqual(upcoming["kwh"], 20)
        self.assertFalse(upcoming["overridden"])
        # While tonight's slot runs it's still the upcoming charge; afterwards it's next Tuesday.
        self.assertEqual(planner.upcoming(self.schedule, at(10, 23))["date"], "2026-11-10")
        self.assertEqual(planner.upcoming(self.schedule, at(11, 0, 30))["date"], "2026-11-17")

    def test_upcoming_shows_override(self):
        overrides = {"2026-11-10": planner.validate_override({"kwh": 16, "start_percent": 52})}
        upcoming = planner.upcoming(self.schedule, at(10, 18), overrides)
        self.assertEqual(upcoming["kwh"], 16)
        self.assertEqual(upcoming["planned_kwh"], 20)
        self.assertEqual(upcoming["start_percent"], 52)
        self.assertTrue(upcoming["overridden"])

    def test_no_upcoming_when_disabled(self):
        self.schedule["enabled"] = False
        self.assertIsNone(planner.upcoming(self.schedule, at(10, 18)))


if __name__ == "__main__":
    unittest.main()
