import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { CALIBRATION_SLOTS, evaluateSlot, summarizeCalibration } from "./calibration";
import { findScheduleStatus } from "./entities";
import type { CalibrationSlot, HomeAssistant, ZappiCardConfig } from "./types";
import "./schedule-editor";

const sensor = (name: string, deviceClass?: string) => ({
  name,
  selector: {
    entity: { filter: { domain: "sensor", integration: "myenergi", ...(deviceClass && { device_class: deviceClass }) } },
  },
});

const CHARGER_SCHEMA = [
  {
    name: "entity",
    required: true,
    selector: { entity: { filter: { domain: "select", integration: "myenergi" } } },
  },
  {
    type: "expandable",
    name: "",
    flatten: true,
    title: "Entity overrides (auto-detected when empty)",
    schema: [
      sensor("status_entity"),
      sensor("plug_status_entity"),
      sensor("charge_power_entity", "power"),
      sensor("session_energy_entity", "energy"),
      sensor("grid_power_entity", "power"),
      sensor("solar_power_entity", "power"),
      sensor("home_power_entity", "power"),
    ],
  },
];

const DISPLAY_SCHEMA = [
  { name: "name", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_stats", selector: { boolean: {} } },
      { name: "show_power_flow", selector: { boolean: {} } },
      { name: "show_boost", selector: { boolean: {} } },
      { name: "show_upcoming", selector: { boolean: {} } },
    ],
  },
];

const LABELS: Record<string, string> = {
  entity: "Charge mode entity",
  name: "Name",
  show_stats: "Show charging figures (power, session)",
  show_power_flow: "Show solar / grid / home power",
  show_boost: "Show boost controls",
  show_upcoming: "Show upcoming scheduled charge",
  status_entity: "Status",
  plug_status_entity: "Plug status",
  charge_power_entity: "Charge power",
  session_energy_entity: "Session energy",
  grid_power_entity: "Grid power",
  solar_power_entity: "Solar power",
  home_power_entity: "Home power",
};

type SlotField = keyof CalibrationSlot;

@customElement("zappi-card-editor")
export class ZappiCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: ZappiCardConfig;

  public setConfig(config: ZappiCardConfig): void {
    this._config = { show_stats: true, show_power_flow: true, show_boost: true, show_upcoming: true, ...config };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="section">
        <h3>Charger</h3>
        ${this._renderForm(CHARGER_SCHEMA)}
      </div>
      <div class="section">
        <h3>Display</h3>
        ${this._renderForm(DISPLAY_SCHEMA)}
      </div>
      ${this._renderBatteryHealth()} ${this._renderTargetCharging()} ${this._renderCalibration()}
      ${this._renderSchedule()}
    `;
  }

  private _renderSchedule(): TemplateResult {
    // The schedule lives in the Zappistant integration, not in this card's config.
    const installed = findScheduleStatus(this.hass!) !== undefined;
    return html`
      <div class="section">
        <h3>Weekly schedule</h3>
        ${installed
          ? html`
              <p class="hint">
                Saved straight to Home Assistant with the schedule's own Save button, separately from this card's
                settings. kWh is calculated from the battery calibration above.
              </p>
              <zappi-schedule-editor
                .hass=${this.hass}
                .kwhPerPercent=${summarizeCalibration(this._config!.calibration).kwhPerPercent}
              ></zappi-schedule-editor>
            `
          : html`<p class="hint">
              Install the
              <a href="https://github.com/adamkcs/ha-zappistant-integration" target="_blank" rel="noreferrer"
                >Zappistant integration</a
              >
              (through HACS) to plan charging for each day of the week.
            </p>`}
      </div>
    `;
  }

  private _renderTargetCharging(): TemplateResult {
    const config = this._config!;
    return html`
      <div class="section">
        <h3>Target charging</h3>
        <div class="health">
          <label class="health-field">
            <span>Default "Ready by" time</span>
            <span class="with-unit">
              <input
                type="time"
                step="900"
                .value=${config.default_ready_by ?? "07:00"}
                @change=${(ev: Event) =>
                  this._emit({ ...config, default_ready_by: (ev.target as HTMLInputElement).value || undefined })}
              />
            </span>
            <span class="hint">Pre-filled for smart boost on the card.</span>
          </label>
          <label class="health-field">
            <span class="with-unit">
              <input
                type="checkbox"
                .checked=${config.switch_to_stopped !== false}
                @change=${(ev: Event) =>
                  this._emit({
                    ...config,
                    // On is the default, so only store it when turned off.
                    switch_to_stopped: (ev.target as HTMLInputElement).checked ? undefined : false,
                  })}
              />
              Switch to Stopped before boosting
            </span>
            <span class="hint">
              After a boost the zappi returns to its charge mode. Stopped makes charging end at the target.
              Not applied to 100% charges.
            </span>
          </label>
        </div>
      </div>
    `;
  }

  private _renderBatteryHealth(): TemplateResult {
    const field = (key: "battery_soh_percent" | "max_charge_percent", label: string, hint: string) => html`
      <label class="health-field">
        <span>${label}</span>
        <span class="with-unit">
          <input
            type="number"
            inputmode="numeric"
            min="1"
            max="100"
            step="1"
            .value=${this._config![key] === undefined ? "" : String(this._config![key])}
            @change=${(ev: Event) => this._percentChanged(key, (ev.target as HTMLInputElement).value)}
          />
          %
        </span>
        <span class="hint">${hint}</span>
      </label>
    `;
    return html`
      <div class="section">
        <h3>Battery health</h3>
        <div class="health">
          ${field("battery_soh_percent", "Last read SOH", "From the car or an OBD reader. Stored for later calculations.")}
          ${field("max_charge_percent", "Max charge allowed", "Charges stop here unless you pick 100% on the card.")}
        </div>
      </div>
    `;
  }

  private _percentChanged(key: "battery_soh_percent" | "max_charge_percent", raw: string): void {
    const value = raw === "" ? undefined : Number(raw);
    const valid = value !== undefined && Number.isFinite(value) && value >= 1 && value <= 100;
    this._emit({ ...this._config, [key]: valid ? value : undefined });
  }

  private _renderForm(schema: unknown[]): TemplateResult {
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(s: { name: string; title?: string }) => LABELS[s.name] ?? s.title ?? s.name}
        @value-changed=${(ev: CustomEvent) => this._emit(ev.detail.value)}
      ></ha-form>
    `;
  }

  private _renderCalibration(): TemplateResult {
    const slots = this._config!.calibration ?? [];
    const summary = summarizeCalibration(slots);
    return html`
      <div class="section">
        <h3>Battery calibration</h3>
        <p class="hint">
          Enter past charges: battery % when you plugged in, kWh the zappi added, and battery % afterwards.
          The card averages them to estimate how many kWh one percent takes, including charging losses.
        </p>
        <div class="slots">
          <span class="head">#</span>
          <span class="head">Before %</span>
          <span class="head">kWh charged</span>
          <span class="head">After %</span>
          <span class="head">kWh / %</span>
          ${Array.from({ length: CALIBRATION_SLOTS }, (_, i) => this._renderSlot(i, slots[i]))}
        </div>
        <div class="summary">
          ${summary.kwhPerPercent !== undefined
            ? html`
                <strong>${summary.kwhPerPercent.toFixed(3)} kWh per %</strong>
                from ${summary.samples} ${summary.samples === 1 ? "charge" : "charges"}
                · ≈ ${(summary.kwhPerPercent * 100).toFixed(1)} kWh for 0–100%
              `
            : html`Fill in at least one complete row to calibrate.`}
        </div>
      </div>
    `;
  }

  private _renderSlot(index: number, slot: CalibrationSlot = {}): TemplateResult {
    const result = evaluateSlot(slot);
    const input = (field: SlotField, step: string, max: string) => html`
      <input
        type="number"
        inputmode="decimal"
        min="0"
        max=${max}
        step=${step}
        .value=${slot[field] === undefined ? "" : String(slot[field])}
        @change=${(ev: Event) => this._slotChanged(index, field, (ev.target as HTMLInputElement).value)}
      />
    `;
    return html`
      <span class="index">${index + 1}</span>
      ${input("start_percent", "1", "100")} ${input("kwh", "0.1", "200")} ${input("end_percent", "1", "100")}
      <span class="result ${result.status}" title=${result.status === "invalid" ? result.reason : ""}>
        ${result.status === "ok"
          ? result.kwhPerPercent.toFixed(3)
          : result.status === "invalid"
            ? "⚠"
            : "–"}
      </span>
    `;
  }

  private _slotChanged(index: number, field: SlotField, raw: string): void {
    const slots: CalibrationSlot[] = Array.from(
      { length: CALIBRATION_SLOTS },
      (_, i) => ({ ...this._config!.calibration?.[i] }),
    );
    const value = raw === "" ? undefined : Number(raw);
    if (value === undefined || !Number.isFinite(value)) delete slots[index][field];
    else slots[index][field] = value;
    // Only keep rows that have something in them; later rows move up when one is cleared.
    const calibration = slots.filter((s) => Object.keys(s).length > 0);
    this._emit({ ...this._config, calibration: calibration.length ? calibration : undefined });
  }

  private _emit(value: Record<string, unknown>): void {
    const config = { ...value };
    // Drop cleared optional fields so the YAML stays tidy.
    for (const [key, v] of Object.entries(config)) {
      if (v === "" || v === undefined) delete config[key];
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  static styles = css`
    .section {
      margin-bottom: 24px;
    }
    h3 {
      margin: 0 0 8px;
      font-size: 1rem;
      font-weight: 500;
    }
    .hint {
      margin: 0 0 12px;
      font-size: 0.875rem;
      color: var(--secondary-text-color);
    }
    .health {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }
    .health-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .health-field .hint {
      margin: 0;
      font-size: 0.8rem;
      color: var(--secondary-text-color);
    }
    .with-unit {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .with-unit input {
      width: 80px;
    }
    .with-unit input[type="time"] {
      width: auto;
    }
    .with-unit input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
    .slots {
      display: grid;
      grid-template-columns: 24px repeat(3, minmax(0, 1fr)) 64px;
      gap: 8px;
      align-items: center;
    }
    .head {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
    }
    .index {
      color: var(--secondary-text-color);
      text-align: center;
    }
    input {
      font: inherit;
      width: 100%;
      box-sizing: border-box;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }
    .result {
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
    .result.invalid {
      color: var(--error-color);
      cursor: help;
    }
    .result.empty,
    .result.incomplete {
      color: var(--secondary-text-color);
    }
    .summary {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 0.9rem;
    }
  `;
}
