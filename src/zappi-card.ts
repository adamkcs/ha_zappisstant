import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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

console.info(`%c ZAPPI-CARD %c ${CARD_VERSION} `, "color: white; background: #43a047", "");

@customElement("zappi-card")
export class ZappiCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ZappiCardConfig;
  @state() private _boostKwh = 10;
  @state() private _boostBy = "07:00";
  @state() private _pending?: string;
  @state() private _error?: string;

  private _entities?: ZappiEntities;
  private _registry?: HomeAssistant["entities"];

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
    this._boostKwh = config.default_boost_kwh ?? this._boostKwh;
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

  private _boost(): void {
    void this._call("boost", () =>
      this.hass.callService(
        "myenergi",
        "myenergi_boost",
        { amount: this._boostKwh },
        { entity_id: this._config.entity },
      ),
    );
  }

  private _smartBoost(): void {
    void this._call("smart-boost", () =>
      this.hass.callService(
        "myenergi",
        "myenergi_smart_boost",
        // The integration strips ":" and expects HHMM, so drop any seconds.
        { amount: this._boostKwh, when: this._boostBy.slice(0, 5) },
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
    const validKwh = this._boostKwh >= 1 && this._boostKwh <= 99;
    return html`
      <div class="boost">
        <div class="section-label">Boost</div>
        <div class="boost-row">
          <label class="field">
            <input
              type="number"
              min="1"
              max="99"
              step="1"
              .value=${String(this._boostKwh)}
              @change=${(ev: Event) => (this._boostKwh = Number((ev.target as HTMLInputElement).value))}
            />
            kWh
          </label>
          <button ?disabled=${busy || !validKwh} @click=${this._boost}>
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
          <button ?disabled=${busy || !validKwh || !this._boostBy} @click=${this._smartBoost}>
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
