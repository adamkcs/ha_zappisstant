import type { HomeAssistant } from "./types";

// Mirrors planner.py in the Zappistant integration (adamkcs/ha-zappistant-integration).

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
  /** Octopus mode only: when the evening's charge must be done, the next morning ("HH:MM"). */
  ready_by: string | null;
}

/** Zappistant boosting the zappi in the slots, or Intelligent Octopus Go doing the charging. */
export type ControlMode = "zappi" | "octopus";

export interface Schedule {
  enabled: boolean;
  days: DayPlan[];
}

export interface UpcomingCharge {
  date: string;
  /** Merged windows: an overnight one like 22:00–05:00 has ends_next_day set. */
  intervals: (ScheduleInterval & { ends_next_day: boolean })[];
  start_percent: number | null;
  target_percent: number | null;
  /** kWh this charge will use, including a one-off override. */
  kwh: number;
  /** kWh from the weekly plan. */
  planned_kwh: number | null;
  overridden: boolean;
  /** Skipped for this date with a 0 kWh override; shown so it can be undone. */
  skipped?: boolean;
  /** Octopus mode: the ready-by time the next morning, in place of slots. */
  ready_by?: string;
}

export interface ScheduleStatus {
  state: string;
  mode?: ControlMode;
  upcoming: UpcomingCharge | null;
  // Zappi mode
  run_date?: string | null;
  planned_kwh?: number | null;
  delivered_kwh?: number | null;
  remaining_kwh?: number;
  current_interval?: ScheduleInterval | null;
  next_interval?: ScheduleInterval | null;
  // Octopus mode: what Octopus is being set to, and the battery size it converts % with.
  octopus?: { date: string; percent: number; ready_by: string } | null;
  octopus_battery_kwh?: number;
}

/** Octopus's charge target is the % of the battery to add, between 5 and 100. Mirrors planner.octopus_percent. */
export function octopusPercent(kwh: number, batteryKwh: number): number {
  return Math.min(100, Math.max(5, Math.ceil((kwh / batteryKwh) * 100 - 1e-9)));
}

interface ScheduleResponse {
  schedule: Schedule;
  status: ScheduleStatus;
}

export const fetchSchedule = (hass: HomeAssistant) =>
  hass.callWS<ScheduleResponse>({ type: "zappistant/schedule/get" });

export const saveSchedule = (hass: HomeAssistant, schedule: Schedule) =>
  hass.callWS<ScheduleResponse>({ type: "zappistant/schedule/save", schedule });

/** Adjust one date's charge without changing the weekly plan; kwh 0 skips it, null goes back to the plan. */
export const setOverride = (
  hass: HomeAssistant,
  date: string,
  override: { kwh: number; start_percent: number | null; target_percent: number | null } | null,
) => hass.callWS<{ status: ScheduleStatus }>({ type: "zappistant/override/set", date, ...override });

/** Start a boost through Zappistant, which adds it to the charging plan it publishes. */
export const zappistantBoost = (
  hass: HomeAssistant,
  boost: { kind: "manual" | "smart"; kwh: number; ready_by?: string; switch_to_stopped: boolean },
) => hass.callWS<{ status: ScheduleStatus }>({ type: "zappistant/boost", ...boost });

export const zappistantStopBoost = (hass: HomeAssistant) =>
  hass.callWS<{ status: ScheduleStatus }>({ type: "zappistant/boost/stop" });

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
  return {
    enabled: false,
    start_percent: null,
    target_percent: null,
    kwh: null,
    kwh_manual: false,
    intervals: [],
    ready_by: null,
  };
}

export function emptySchedule(): Schedule {
  return { enabled: false, days: DAY_NAMES.map(() => emptyDay()) };
}

/** A day the integration will act on: enabled, with slots and an amount. */
export function isActive(day: DayPlan, mode: ControlMode = "zappi"): boolean {
  // Octopus picks the slots itself, so there it's a ready-by time instead.
  const when = mode === "octopus" ? !!day.ready_by : day.intervals.length > 0;
  return day.enabled && when && !!day.kwh;
}

// Overnight charges, mirroring planner.py: a day whose last interval runs to 24:00 continues
// into the next day's 00:00 interval, as one charge using the first day's kWh.

/** Whether the day's charge continues into the next day's 00:00 interval. */
export function runsOvernight(day: DayPlan): boolean {
  const last = day.intervals[day.intervals.length - 1];
  return isActive(day) && last.end === "24:00" && last.start !== "00:00";
}

/** Whether a day's 00:00 interval is the end of the previous day's overnight charge. */
export function continuesPrevious(schedule: Schedule, index: number): boolean {
  const day = schedule.days[index];
  const previous = schedule.days[(index + DAY_NAMES.length - 1) % DAY_NAMES.length];
  return day.enabled && day.intervals[0]?.start === "00:00" && runsOvernight(previous);
}

/** Monday-first index of today, matching Python's weekday(). */
export function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}
