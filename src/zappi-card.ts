import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { kwhForTarget, summarizeCalibration } from "./calibration";
import { findChargeModeSelect, resolveEntities, type ZappiEntities } from "./entities";
import { cardStyles } from "./styles";
import type { HomeAssistant, LovelaceCardEditor, ZappiCardConfig } from "./types";
import "./editor";

const CARD_VERSION = "0.1.0";

const MODE_ICONS: Record<string, string> = {
  Fast: "mdi:lightning-bolt",
  Eco: "mdi:leaf",
  "Eco+": "mdi:solar-power",
  Stopped: "mdi:stop-circle-outline",
};

const UNAVAILABLE = ["unavailable", "unknown"];

// Boost amounts the myenergi integration accepts.
const MIN_BOOST_KWH = 1;
const MAX_BOOST_KWH = 99;

/** "custom" uses the typed target; the others pin the target to a preset. */
type TargetPreset = "custom" | "max" | "full";

type BoostPlan = { kwh: number; from: number; to: number } | { problem: string };

console.info(`%c ZAPPI-CARD %c ${CARD_VERSION} `, "color: white; background: #43a047", "");

@customElement("zappi-card")
export class ZappiCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ZappiCardConfig;
  @state() private _currentPercent = "";
  @state() private _targetPercent = "";
  @state() private _preset: TargetPreset = "custom";
  @state() private _boostBy = "07:00";
  @state() private _pending?: string;
  @state() private _error?: string;

  private _entities?: ZappiEntities;
  private _registry?: HomeAssistant["entities"];
  private _kwhPerPercent?: number;

  static styles = cardStyles;

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement("zappi-card-editor") as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): Partial<ZappiCardConfig> {
    return { entity: findChargeModeSelect(hass) ?? "" };
  }

  public setConfig(config: ZappiCardConfig): void {
    if (!config.entity) {
      throw new Error("Set 'entity' to the myenergi zappi charge mode select entity");
    }
    this._config = { show_power_flow: true, show_boost: true, ...config };
    this._kwhPerPercent = summarizeCalibration(config.calibration).kwhPerPercent;
    if (this._preset === "max" && config.max_charge_percent === undefined) this._preset = "custom";
    this._entities = undefined;
  }

  public getCardSize(): number {
    return 6;
  }

  protected willUpdate(changed: PropertyValues): void {
    // Discovery only depends on the config and the entity registry, so skip it on state updates.
    if (!this.hass || !(changed.has("hass") || changed.has("_config"))) return;
    if (!this._entities || this.hass.entities !== this._registry) {
      this._registry = this.hass.entities;
      this._entities = resolveEntities(this.hass, this._config);
    }
  }

  private _state(entityId?: string): string | undefined {
    if (!entityId) return undefined;
    const value = this.hass.states[entityId]?.state;
    return value === undefined || UNAVAILABLE.includes(value) ? undefined : value;
  }

  private _number(entityId?: string): number | undefined {
    const value = Number(this._state(entityId));
    return Number.isFinite(value) ? value : undefined;
  }

  private async _call(key: string, action: () => Promise<unknown>): Promise<void> {
    this._pending = key;
    this._error = undefined;
    try {
      await action();
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    } finally {
      this._pending = undefined;
    }
  }

  private _setMode(option: string): void {
    void this._call(`mode-${option}`, () =>
      this.hass.callService("select", "select_option", { option }, { entity_id: this._config.entity }),
    );
  }

  private _parsePercent(raw: string): number | undefined {
    if (raw.trim() === "") return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }

  private _targetValue(): number | undefined {
    const max = this._config.max_charge_percent;
    if (this._preset === "max") return max;
    if (this._preset === "full") return 100;
    // An empty target means "charge to the max allowed", or full if no max is set.
    return this._parsePercent(this._targetPercent) ?? max ?? 100;
  }

  /** Work out the kWh to boost, or why it can't be worked out. */
  private _boostPlan(): BoostPlan {
    const max = this._config.max_charge_percent;
    const from = this._parsePercent(this._currentPercent);
    const to = this._targetValue();
    if (this._kwhPerPercent === undefined) {
      return { problem: "Add calibration charges in the card settings to estimate kWh." };
    }
    if (from === undefined) return { problem: "Enter the current battery %." };
    if (from < 0 || from > 100 || to === undefined || to < 0 || to > 100) {
      return { problem: "Percentages must be between 0 and 100." };
    }
    // The 100% button is an explicit override of the max allowed.
    if (this._preset === "custom" && max !== undefined && to > max) {
      return { problem: `Target is above the max allowed (${max}%).` };
    }
    if (to <= from) return { problem: "Target must be higher than the current %." };
    const kwh = Math.ceil(kwhForTarget(this._kwhPerPercent, from, to));
    return { kwh: Math.min(MAX_BOOST_KWH, Math.max(MIN_BOOST_KWH, kwh)), from, to };
  }

  private _togglePreset(preset: TargetPreset): void {
    this._preset = this._preset === preset ? "custom" : preset;
  }

  private _boost(kwh: number): void {
    void this._call("boost", () =>
      this.hass.callService("myenergi", "myenergi_boost", { amount: kwh }, { entity_id: this._config.entity }),
    );
  }

  private _smartBoost(kwh: number): void {
    void this._call("smart-boost", () =>
      this.hass.callService(
        "myenergi",
        "myenergi_smart_boost",
        // The integration strips ":" and expects HHMM, so drop any seconds.
        { amount: kwh, when: this._boostBy.slice(0, 5) },
        { entity_id: this._config.entity },
      ),
    );
  }

  private _stopBoost(): void {
    void this._call("stop-boost", () =>
      this.hass.callService("myenergi", "myenergi_stop_boost", {}, { entity_id: this._config.entity }),
    );
  }

  private _moreInfo(entityId?: string): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }),
    );
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass || !this._entities) return nothing;
    const modeEntity = this.hass.states[this._config.entity];
    if (!modeEntity) {
      return html`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;
    }
    const name =
      this._config.name ??
      (modeEntity.attributes.friendly_name as string | undefined)?.replace(/ charge mode$/i, "") ??
      "Zappi";

    return html`
      <ha-card>
        <div class="header">
          <span class="title">${name}</span>
          ${this._renderStatusChip()}
        </div>
        ${this._renderStats()}
        ${this._renderModes(modeEntity.state, modeEntity.attributes.options as string[] | undefined)}
        ${this._config.show_boost ? this._renderBoost() : nothing}
        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      </ha-card>
    `;
  }

  private _renderStatusChip(): TemplateResult {
    const e = this._entities!;
    const status = this._state(e.status);
    const plug = this._state(e.plug_status);
    const charging = status === "Charging" || status === "Boosting";
    const fault = plug === "Fault";
    const disconnected = plug === "EV Disconnected";
    const icon = fault
      ? "mdi:alert-circle"
      : status === "Boosting"
        ? "mdi:rocket-launch"
        : charging
          ? "mdi:ev-station"
          : disconnected
            ? "mdi:power-plug-off"
            : "mdi:power-plug";
    // Plug status says more than "Paused" when the car is unplugged or waiting.
    const label = charging || !plug ? (status ?? "Unknown") : plug;
    return html`
      <span
        class="chip ${charging ? "active" : ""} ${fault ? "fault" : ""}"
        @click=${() => this._moreInfo(e.plug_status ?? e.status)}
      >
        <ha-icon .icon=${icon}></ha-icon>${label}
      </span>
    `;
  }

  private _formatPower(watts: number): string {
    return Math.abs(watts) >= 1000 ? `${(watts / 1000).toFixed(2)} kW` : `${Math.round(watts)} W`;
  }

  private _renderStat(
    entityId: string | undefined,
    icon: string,
    label: string,
    value: string,
    color: string,
  ): TemplateResult {
    return html`
      <div class="stat" @click=${() => this._moreInfo(entityId)}>
        <ha-icon .icon=${icon} style="color: ${color}"></ha-icon>
        <span class="value">${value}</span>
        <span class="label">${label}</span>
      </div>
    `;
  }

  private _renderStats(): TemplateResult {
    const e = this._entities!;
    const chargePower = this._number(e.charge_power);
    const session = this._number(e.session_energy);
    const grid = this._number(e.grid_power);
    const solar = this._number(e.solar_power);
    const home = this._number(e.home_power);
    const flow = this._config.show_power_flow;

    return html`
      <div class="stats">
        ${chargePower !== undefined
          ? this._renderStat(e.charge_power, "mdi:car-electric", "Charging", this._formatPower(chargePower), "var(--zappi-car)")
          : nothing}
        ${session !== undefined
          ? this._renderStat(e.session_energy, "mdi:battery-charging", "Session", `${session.toFixed(1)} kWh`, "var(--zappi-car)")
          : nothing}
        ${flow && solar !== undefined
          ? this._renderStat(e.solar_power, "mdi:solar-power-variant", "Solar", this._formatPower(solar), "var(--zappi-solar)")
          : nothing}
        ${flow && grid !== undefined
          ? this._renderStat(
              e.grid_power,
              grid < 0 ? "mdi:transmission-tower-import" : "mdi:transmission-tower-export",
              // myenergi reports grid import as positive and export as negative.
              grid < 0 ? "Exporting" : "Importing",
              this._formatPower(Math.abs(grid)),
              grid < 0 ? "var(--zappi-export)" : "var(--zappi-grid)",
            )
          : nothing}
        ${flow && home !== undefined
          ? this._renderStat(e.home_power, "mdi:home-lightning-bolt", "Home", this._formatPower(home), "var(--zappi-home)")
          : nothing}
      </div>
    `;
  }

  private _renderModes(current: string, options: string[] = Object.keys(MODE_ICONS)): TemplateResult {
    return html`
      <div>
        <div class="section-label">Charge mode</div>
        <div class="modes">
          ${options.map(
            (option) => html`
              <button
                class=${option === current ? "selected" : ""}
                ?disabled=${this._pending !== undefined}
                @click=${() => option !== current && this._setMode(option)}
              >
                <ha-icon .icon=${MODE_ICONS[option] ?? "mdi:ev-station"}></ha-icon>
                ${option}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  }

  private _renderBoost(): TemplateResult {
    const busy = this._pending !== undefined;
    const max = this._config.max_charge_percent;
    const plan = this._boostPlan();
    const kwh = "kwh" in plan ? plan.kwh : undefined;
    const presetTarget = this._preset === "custom" ? undefined : this._targetValue();
    const percentInput = (value: string, onInput: (v: string) => void, placeholder = "", disabled = false) => html`
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="100"
        step="1"
        placeholder=${placeholder}
        ?disabled=${disabled}
        .value=${value}
        @input=${(ev: Event) => onInput((ev.target as HTMLInputElement).value)}
      />
    `;
    return html`
      <div class="boost">
        <div class="section-label">Boost</div>
        <div class="boost-row">
          <label class="field">
            Now ${percentInput(this._currentPercent, (v) => (this._currentPercent = v))} %
          </label>
          <label class="field">
            Target
            ${percentInput(
              presetTarget !== undefined ? String(presetTarget) : this._targetPercent,
              (v) => (this._targetPercent = v),
              String(max ?? 100),
              presetTarget !== undefined,
            )}
            %
          </label>
          <button
            class=${this._preset === "max" ? "selected" : ""}
            ?disabled=${max === undefined}
            title=${max === undefined ? "Set the max charge % in the card settings" : `Charge to ${max}%`}
            @click=${() => this._togglePreset("max")}
          >
            Max allowed${max !== undefined ? ` (${max}%)` : ""}
          </button>
          <button class=${this._preset === "full" ? "selected" : ""} @click=${() => this._togglePreset("full")}>
            100%
          </button>
        </div>
        <div class="estimate ${"problem" in plan ? "problem" : ""}">
          ${"problem" in plan
            ? plan.problem
            : html`≈ <strong>${plan.kwh} kWh</strong> to charge from ${plan.from}% to ${plan.to}%`}
        </div>
        <div class="boost-row">
          <button ?disabled=${busy || kwh === undefined} @click=${() => kwh && this._boost(kwh)}>
            <ha-icon icon="mdi:rocket-launch"></ha-icon>Boost now
          </button>
        </div>
        <div class="boost-row">
          <label class="field">
            Ready by
            <input
              type="time"
              step="900"
              .value=${this._boostBy}
              @change=${(ev: Event) => (this._boostBy = (ev.target as HTMLInputElement).value)}
            />
          </label>
          <button
            ?disabled=${busy || kwh === undefined || !this._boostBy}
            @click=${() => kwh && this._smartBoost(kwh)}
          >
            <ha-icon icon="mdi:clock-fast"></ha-icon>Smart boost
          </button>
          <!-- Always offered: a scheduled smart boost reports "Paused", not "Boosting". -->
          <button class="danger" ?disabled=${busy} @click=${this._stopBoost}>
            <ha-icon icon="mdi:stop"></ha-icon>Stop boost
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "zappi-card",
  name: "Zappi Card",
  description: "Control a myenergi zappi EV charger: charge mode, boost and live status.",
  preview: true,
});
