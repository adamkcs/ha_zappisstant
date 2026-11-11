import type { HomeAssistant } from "./types";

// Mirrors custom_components/zappistant/planner.py.

export const SLOTS_PER_DAY = 48;
export const MAX_INTERVALS = 5;
export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface ScheduleInterval {
  start: string;
  end: string;
  /** Keep charging after this interval ends until the day's kWh is delivered. */
  overrun: boolean;
}

export interface DayPlan {
  enabled: boolean;
  start_percent: number | null;
  target_percent: number | null;
  kwh: number | null;
  /** True when kWh was typed in rather than calculated from the percentages. */
  kwh_manual: boolean;
  intervals: ScheduleInterval[];
}

export interface Schedule {
  enabled: boolean;
  days: DayPlan[];
}

export interface ScheduleStatus {
  state: string;
  run_date: string | null;
  planned_kwh: number | null;
  delivered_kwh: number | null;
  remaining_kwh: number;
  current_interval: ScheduleInterval | null;
  next_interval: ScheduleInterval | null;
}

interface ScheduleResponse {
  schedule: Schedule;
  status: ScheduleStatus;
}

export const fetchSchedule = (hass: HomeAssistant) =>
  hass.callWS<ScheduleResponse>({ type: "zappistant/schedule/get" });

export const saveSchedule = (hass: HomeAssistant, schedule: Schedule) =>
  hass.callWS<ScheduleResponse>({ type: "zappistant/schedule/save", schedule });

/** "HH:MM" for a half-hour slot index, with 48 meaning "24:00". */
export function slotTime(slot: number): string {
  const minutes = slot * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 ? "30" : "00"}`;
}

export function timeSlot(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 2 + (minutes >= 30 ? 1 : 0);
}

export function intervalsToSlots(intervals: ScheduleInterval[]): boolean[] {
  const slots = Array<boolean>(SLOTS_PER_DAY).fill(false);
  for (const interval of intervals) {
    for (let i = timeSlot(interval.start); i < timeSlot(interval.end); i++) slots[i] = true;
  }
  return slots;
}

/** Turn selected slots back into intervals, keeping the overrun flag of any interval they overlap. */
export function slotsToIntervals(slots: boolean[], previous: ScheduleInterval[]): ScheduleInterval[] {
  const intervals: ScheduleInterval[] = [];
  let start: number | undefined;
  for (let i = 0; i <= SLOTS_PER_DAY; i++) {
    if (slots[i] && start === undefined) start = i;
    if (!slots[i] && start !== undefined) {
      const end = i;
      const overlapping = previous.find((p) => timeSlot(p.start) < end && timeSlot(p.end) > start!);
      intervals.push({ start: slotTime(start), end: slotTime(end), overrun: overlapping?.overrun ?? false });
      start = undefined;
    }
  }
  return intervals;
}

export function countIntervals(slots: boolean[]): number {
  return slots.filter((on, i) => on && !slots[i - 1]).length;
}

export function emptyDay(): DayPlan {
  return { enabled: false, start_percent: null, target_percent: null, kwh: null, kwh_manual: false, intervals: [] };
}

export function emptySchedule(): Schedule {
  return { enabled: false, days: DAY_NAMES.map(() => emptyDay()) };
}

/** A day the integration will act on: enabled, with slots and an amount. */
export function isActive(day: DayPlan): boolean {
  return day.enabled && day.intervals.length > 0 && !!day.kwh;
}

/** Monday-first index of today, matching Python's weekday(). */
export function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}
