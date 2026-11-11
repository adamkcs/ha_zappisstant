import type { CalibrationSlot } from "./types";

export const CALIBRATION_SLOTS = 5;

export type SlotResult =
  | { status: "empty" }
  | { status: "incomplete" }
  | { status: "invalid"; reason: string }
  | { status: "ok"; kwhPerPercent: number };

function isSet(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function evaluateSlot(slot: CalibrationSlot | undefined): SlotResult {
  const { start_percent: start, kwh, end_percent: end } = slot ?? {};
  const filled = [start, kwh, end].filter(isSet).length;
  if (filled === 0) return { status: "empty" };
  if (filled < 3) return { status: "incomplete" };
  if (start! < 0 || end! > 100) return { status: "invalid", reason: "Percentages must be 0–100" };
  if (end! <= start!) return { status: "invalid", reason: "After must be higher than before" };
  if (kwh! <= 0) return { status: "invalid", reason: "kWh must be positive" };
  return { status: "ok", kwhPerPercent: kwh! / (end! - start!) };
}

export interface CalibrationSummary {
  /** Average kWh needed per battery percent, including charging losses. */
  kwhPerPercent?: number;
  /** Number of valid slots the average is based on. */
  samples: number;
}

/** Average the kWh-per-percent ratio of every valid calibration slot. */
export function summarizeCalibration(slots: CalibrationSlot[] = []): CalibrationSummary {
  const ratios = slots
    .map(evaluateSlot)
    .flatMap((r) => (r.status === "ok" ? [r.kwhPerPercent] : []));
  if (!ratios.length) return { samples: 0 };
  return {
    kwhPerPercent: ratios.reduce((sum, r) => sum + r, 0) / ratios.length,
    samples: ratios.length,
  };
}

/** Energy to add to go from the current to the target percentage. */
export function kwhForTarget(kwhPerPercent: number, currentPercent: number, targetPercent: number): number {
  return Math.max(0, targetPercent - currentPercent) * kwhPerPercent;
}
