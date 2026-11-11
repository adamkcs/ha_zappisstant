import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  DAY_NAMES,
  MAX_INTERVALS,
  SLOTS_PER_DAY,
  continuesPrevious,
  countIntervals,
  emptySchedule,
  fetchSchedule,
  intervalsToSlots,
  isActive,
  runsOvernight,
  saveSchedule,
  slotsToIntervals,
  todayIndex,
  type DayPlan,
  type Schedule,
} from "./schedule";
import type { HomeAssistant } from "./types";

const HOURS_PER_ROW = 6;

@customElement("zappi-schedule-editor")
export class ZappiScheduleEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  /** From the card's calibration; used to turn start/target % into kWh. */
  @property({ attribute: false }) public kwhPerPercent?: number;

  @state() private _schedule?: Schedule;
  @state() private _day = todayIndex();
  @state() private _error?: string;
  @state() private _saving = false;

  private _savedJson = "";
  private _loadRequested = false;
  /** Value being painted while dragging across the grid, if a drag is in progress. */
  private _paint?: boolean;

  protected updated(): void {
    if (this.hass && !this._loadRequested) {
      this._loadRequested = true;
      void this._load();
    }
  }

  private async _load(): Promise<void> {
    try {
      this._setSaved((await fetchSchedule(this.hass)).schedule);
    } catch (err: any) {
      this._error = `Couldn't load the schedule: ${err?.message ?? err}`;
      this._schedule = emptySchedule();
    }
  }

  private _setSaved(schedule: Schedule): void {
    this._schedule = schedule;
    this._savedJson = JSON.stringify(schedule);
  }

  private get _dirty(): boolean {
    return JSON.stringify(this._schedule) !== this._savedJson;
  }

  private async _save(): Promise<void> {
    this._saving = true;
    this._error = undefined;
    try {
      this._setSaved((await saveSchedule(this.hass, this._schedule!)).schedule);
    } catch (err: any) {
      this._error = `Couldn't save: ${err?.message ?? err}`;
    } finally {
      this._saving = false;
    }
  }

  private _revert(): void {
    this._schedule = JSON.parse(this._savedJson);
    this._error = undefined;
  }

  private _autoKwh(day: DayPlan): number | null {
    const { start_percent: start, target_percent: target } = day;
    if (this.kwhPerPercent === undefined || start === null || target === null || target <= start) return null;
    return Math.ceil((target - start) * this.kwhPerPercent);
  }

  private _updateDay(index: number, patch: Partial<DayPlan>): void {
    const days = [...this._schedule!.days];
    const day = { ...days[index], ...patch };
    if (!day.kwh_manual && ("start_percent" in patch || "target_percent" in patch || "kwh_manual" in patch)) {
      day.kwh = this._autoKwh(day);
    }
    days[index] = day;
    this._schedule = { ...this._schedule!, days };
  }

  private _copyTo(target: number): void {
    const days = [...this._schedule!.days];
    days[target] = structuredClone(days[this._day]);
    this._schedule = { ...this._schedule!, days };
  }

  // Painting: press on a slot to toggle it, then drag to give other slots the same value.

  private _slotAt(ev: PointerEvent): number | undefined {
    const el = (this.renderRoot as ShadowRoot).elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null;
    const slot = el?.dataset.slot;
    return slot === undefined ? undefined : Number(slot);
  }

  private _paintSlot(slot: number): void {
    const day = this._schedule!.days[this._day];
    const slots = intervalsToSlots(day.intervals);
    if (slots[slot] === this._paint) return;
    slots[slot] = this._paint!;
    if (countIntervals(slots) > MAX_INTERVALS) {
      this._error = `At most ${MAX_INTERVALS} charging intervals per day.`;
      return;
    }
    this._error = undefined;
    this._updateDay(this._day, { intervals: slotsToIntervals(slots, day.intervals) });
  }

  private _pointerDown(ev: PointerEvent): void {
    const slot = this._slotAt(ev);
    if (slot === undefined) return;
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    this._paint = !intervalsToSlots(this._schedule!.days[this._day].intervals)[slot];
    this._paintSlot(slot);
  }

  private _pointerMove(ev: PointerEvent): void {
    if (this._paint === undefined) return;
    const slot = this._slotAt(ev);
    if (slot !== undefined) this._paintSlot(slot);
  }

  private _pointerUp(): void {
    this._paint = undefined;
  }

  protected render(): TemplateResult {
    if (!this._schedule) return html`<div class="hint">Loading schedule…</div>`;
    return html`
      <div class="head">
        <label class="check">
          <input
            type="checkbox"
            .checked=${this._schedule.enabled}
            @change=${(ev: Event) =>
              (this._schedule = { ...this._schedule!, enabled: (ev.target as HTMLInputElement).checked })}
          />
          Schedule on
        </label>
        <span class="spacer"></span>
        ${this._dirty
          ? html`
              <button ?disabled=${this._saving} @click=${this._revert}>Revert</button>
              <button class="primary" ?disabled=${this._saving} @click=${this._save}>
                ${this._saving ? "Saving…" : "Save"}
              </button>
            `
          : html`<span class="hint">Saved</span>`}
      </div>
      <div class="week">${this._schedule.days.map((day, i) => this._renderWeekRow(day, i))}</div>
      ${this._renderDay(this._schedule.days[this._day])}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
    `;
  }

  private _renderWeekRow(day: DayPlan, index: number): TemplateResult {
    const slots = intervalsToSlots(day.intervals);
    return html`
      <button class="week-row ${index === this._day ? "selected" : ""}" @click=${() => (this._day = index)}>
        <span class="week-day">${DAY_NAMES[index].slice(0, 3)}</span>
        <span class="strip ${day.enabled ? "" : "off"}">
          ${slots.map((on) => html`<span class=${on ? "on" : ""}></span>`)}
        </span>
        <span class="week-kwh">${isActive(day) ? `${day.kwh} kWh` : "–"}</span>
      </button>
    `;
  }

  /** Explain intervals that join with the previous or next day into one overnight charge. */
  private _overnightNote(day: DayPlan, index: number): string | undefined {
    const schedule = this._schedule!;
    const previous = (this._day + DAY_NAMES.length - 1) % DAY_NAMES.length;
    const next = (this._day + 1) % DAY_NAMES.length;
    if (index === 0 && continuesPrevious(schedule, this._day)) {
      return `Ends ${DAY_NAMES[previous]}'s overnight charge, using ${DAY_NAMES[previous]}'s kWh`;
    }
    if (index === day.intervals.length - 1 && runsOvernight(day) && continuesPrevious(schedule, next)) {
      return `Continues until ${schedule.days[next].intervals[0].end} on ${DAY_NAMES[next]} as one charge`;
    }
    return undefined;
  }

  private _renderDay(day: DayPlan): TemplateResult {
    const name = DAY_NAMES[this._day];
    const slots = intervalsToSlots(day.intervals);
    const numberInput = (value: number | null, max: number, step: string, onChange: (v: number | null) => void) => html`
      <input
        type="number"
        inputmode="decimal"
        min="0"
        max=${max}
        step=${step}
        .value=${value === null ? "" : String(value)}
        @change=${(ev: Event) => {
          const raw = (ev.target as HTMLInputElement).value;
          const parsed = raw === "" ? null : Number(raw);
          onChange(parsed !== null && Number.isFinite(parsed) ? parsed : null);
        }}
      />
    `;
    return html`
      <div class="day">
        <label class="check">
          <input
            type="checkbox"
            .checked=${day.enabled}
            @change=${(ev: Event) => this._updateDay(this._day, { enabled: (ev.target as HTMLInputElement).checked })}
          />
          Charge on ${name}s
        </label>

        <div
          class="grid"
          @pointerdown=${this._pointerDown}
          @pointermove=${this._pointerMove}
          @pointerup=${this._pointerUp}
          @pointercancel=${this._pointerUp}
        >
          ${Array.from({ length: SLOTS_PER_DAY / 2 / HOURS_PER_ROW }, (_, row) => html`
            <div class="grid-row">
              ${Array.from({ length: HOURS_PER_ROW }, (_, h) => {
                const hour = row * HOURS_PER_ROW + h;
                return html`
                  <div class="hour">
                    <span class="hour-label">${String(hour).padStart(2, "0")}</span>
                    <div class="cells">
                      ${[0, 1].map((half) => {
                        const slot = hour * 2 + half;
                        return html`<div
                          class="cell ${slots[slot] ? "on" : ""}"
                          data-slot=${slot}
                          title=${`${String(hour).padStart(2, "0")}:${half ? "30" : "00"}`}
                        ></div>`;
                      })}
                    </div>
                  </div>
                `;
              })}
            </div>
          `)}
        </div>

        ${day.intervals.length
          ? html`<div class="intervals">
              ${day.intervals.map(
                (interval, i) => html`
                  <div class="interval">
                    <span class="interval-time">${interval.start}–${interval.end}</span>
                    <label class="check small">
                      <input
                        type="checkbox"
                        .checked=${interval.overrun}
                        @change=${(ev: Event) => {
                          const intervals = day.intervals.map((iv, j) =>
                            j === i ? { ...iv, overrun: (ev.target as HTMLInputElement).checked } : iv,
                          );
                          this._updateDay(this._day, { intervals });
                        }}
                      />
                      Keep charging after until the kWh is reached
                    </label>
                    ${this._overnightNote(day, i)
                      ? html`<span class="overnight">
                          <ha-icon icon="mdi:weather-night"></ha-icon>${this._overnightNote(day, i)}
                        </span>`
                      : nothing}
                  </div>
                `,
              )}
            </div>`
          : html`<div class="hint">Tap or drag on the grid to pick charging slots (up to ${MAX_INTERVALS} intervals).</div>`}

        <div class="amounts">
          <label class="field">
            Expected start ${numberInput(day.start_percent, 100, "1", (v) => this._updateDay(this._day, { start_percent: v }))} %
          </label>
          <label class="field">
            Target ${numberInput(day.target_percent, 100, "1", (v) => this._updateDay(this._day, { target_percent: v }))} %
          </label>
          <label class="field">
            ${numberInput(day.kwh, 200, "0.1", (v) => this._updateDay(this._day, { kwh: v, kwh_manual: v !== null }))} kWh
          </label>
          ${day.kwh_manual
            ? html`<button class="small" @click=${() => this._updateDay(this._day, { kwh_manual: false })}>
                Calculate
              </button>`
            : html`<span class="hint">calculated</span>`}
        </div>
        ${!day.kwh_manual && this.kwhPerPercent === undefined
          ? html`<div class="hint">Add calibration charges in the card settings to calculate kWh, or type it in.</div>`
          : nothing}

        <div class="copy">
          <span class="hint">Copy ${name} to</span>
          ${DAY_NAMES.map((dayName, i) =>
            i === this._day
              ? nothing
              : html`<button class="small" @click=${() => this._copyTo(i)}>${dayName.slice(0, 3)}</button>`,
          )}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    button {
      font: inherit;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    button.primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    button.small {
      padding: 4px 10px;
      font-size: 0.85rem;
    }
    input[type="number"] {
      font: inherit;
      width: 56px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .spacer {
      flex: 1;
    }
    .check {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-text-color);
    }
    .check.small {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .hint {
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .error {
      font-size: 0.85rem;
      color: var(--error-color);
    }
    .week {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .week-row {
      display: grid;
      grid-template-columns: 36px 1fr 56px;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: none;
      border-radius: 8px;
    }
    .week-row.selected {
      background: var(--secondary-background-color);
    }
    .week-day {
      font-size: 0.85rem;
      text-align: left;
    }
    .week-kwh {
      font-size: 0.85rem;
      text-align: right;
      color: var(--secondary-text-color);
    }
    .strip {
      display: grid;
      grid-template-columns: repeat(${SLOTS_PER_DAY}, 1fr);
      gap: 1px;
      height: 10px;
    }
    .strip span {
      background: var(--divider-color);
      border-radius: 1px;
    }
    .strip span.on {
      background: var(--primary-color);
    }
    .strip.off span.on {
      opacity: 0.35;
    }
    .day {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
      touch-action: none;
      user-select: none;
    }
    .grid-row {
      display: grid;
      grid-template-columns: repeat(${HOURS_PER_ROW}, 1fr);
      gap: 4px;
    }
    .hour {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hour-label {
      font-size: 0.7rem;
      color: var(--secondary-text-color);
    }
    .cells {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
    }
    .cell {
      height: 28px;
      border-radius: 4px;
      background: var(--secondary-background-color);
      cursor: pointer;
    }
    .cell.on {
      background: var(--primary-color);
    }
    .intervals {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .interval {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
    }
    .interval-time {
      font-variant-numeric: tabular-nums;
      min-width: 96px;
    }
    .overnight {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-basis: 100%;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .overnight ha-icon {
      --mdc-icon-size: 16px;
    }
    .amounts,
    .copy {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .field {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: var(--secondary-text-color);
    }
  `;
}
