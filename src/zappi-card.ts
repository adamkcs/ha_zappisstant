import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { kwhForTarget, summarizeCalibration } from "./calibration";
import { findChargeModeSelect, findScheduleStatus, resolveEntities, type ZappiEntities } from "./entities";
import {
  DAY_NAMES,
  octopusPercent,
  setOverride,
  zappistantBoost,
  zappistantStopBoost,
  type ScheduleStatus,
  type UpcomingCharge,
} from "./schedule";
import { cardStyles } from "./styles";
import type { HomeAssistant, LovelaceCardEditor, ZappiCardConfig } from "./types";
import "./editor";

const CARD_VERSION = "0.1.1";

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

const DEFAULT_READY_BY = "07:00";

/** "custom" uses the typed target; the others pin the target to a preset. */
type TargetPreset = "custom" | "max" | "full";

const SCHEDULE_STATES: Record<string, string> = {
  waiting: "Waiting for next slot",
  charging: "Charging",
  overrun: "Charging past slot",
};

type BoostPlan = { kwh: number; from?: number; to: number } | { problem: string };

console.info(`%c ZAPPI-CARD %c ${CARD_VERSION} `, "color: white; background: #43a047", "");

@customElement("zappi-card")
export class ZappiCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: ZappiCardConfig;
  @state() private _currentPercent = "";
  @state() private _targetPercent = "";
  @state() private _preset: TargetPreset = "custom";
  @state() private _boostBy = DEFAULT_READY_BY;
  @state() private _pending?: string;
  @state() private _error?: string;
  @state() private _upcomingStart = "";
  @state() private _upcomingTarget = "";

  /** Which upcoming charge the start % input was filled from, so it refills when that changes. */
  private _upcomingKey?: string;

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
    // Only reset the time picker when the configured default changes, not on every config update.
    if (config.default_ready_by !== this._config?.default_ready_by) {
      this._boostBy = config.default_ready_by ?? DEFAULT_READY_BY;
    }
    this._config = {
      show_stats: true,
      show_power_flow: true,
      show_boost: true,
      show_upcoming: true,
      switch_to_stopped: true,
      ...config,
    };
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
    // Refill the upcoming start and target % from the schedule when the upcoming charge or its
    // saved percentages change.
    const upcoming = this._scheduleStatus()?.upcoming;
    const key = upcoming ? `${upcoming.date}|${upcoming.start_percent}|${upcoming.target_percent}` : undefined;
    if (upcoming && key !== this._upcomingKey) {
      this._upcomingStart = upcoming.start_percent === null ? "" : String(upcoming.start_percent);
      this._upcomingTarget = upcoming.target_percent === null ? "" : String(upcoming.target_percent);
    }
    this._upcomingKey = key;
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
    // A full charge needs no estimate: boost the most we can and let the car stop when full.
    if (this._preset === "full") return { kwh: MAX_BOOST_KWH, to: 100 };
    if (this._kwhPerPercent === undefined) {
      return { problem: "Add calibration charges in the card settings to estimate kWh." };
    }
    // Nothing to explain yet: the empty "Now" field says it all.
    if (from === undefined) return { problem: "" };
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

  private _mode(): string | undefined {
    return this._state(this._config.entity);
  }

  /** A target boost only ends at the target if the zappi falls back to Stopped afterwards. */
  private _willSwitchToStopped(): boolean {
    return (
      !!this._config.switch_to_stopped &&
      !this._octopusMode() &&
      this._preset !== "full" &&
      this._mode() !== "Stopped"
    );
  }

  /** Intelligent Octopus Go controls the zappi, which must then stay in Eco+. */
  private _octopusMode(): boolean {
    return this._scheduleStatus()?.mode === "octopus";
  }

  private _startBoost(kind: "boost" | "smart-boost", kwh: number): void {
    const target = { entity_id: this._config.entity };
    void this._call(kind, async () => {
      // With Zappistant installed it starts the boost, so the boost is part of the charging plan
      // it publishes (e.g. for Predbat).
      if (findScheduleStatus(this.hass)) {
        await zappistantBoost(this.hass, {
          kind: kind === "boost" ? "manual" : "smart",
          kwh,
          ready_by: kind === "boost" ? undefined : this._boostBy.slice(0, 5),
          switch_to_stopped: this._willSwitchToStopped(),
        });
        return;
      }
      // Set the mode first: changing mode afterwards could cancel the boost.
      if (this._willSwitchToStopped()) {
        await this.hass.callService("select", "select_option", { option: "Stopped" }, target);
      }
      if (kind === "boost") {
        await this.hass.callService("myenergi", "myenergi_boost", { amount: kwh }, target);
      } else {
        await this.hass.callService(
          "myenergi",
          "myenergi_smart_boost",
          // The integration strips ":" and expects HHMM, so drop any seconds.
          { amount: kwh, when: this._boostBy.slice(0, 5) },
          target,
        );
      }
    });
  }

  private _stopBoost(): void {
    void this._call("stop-boost", () =>
      findScheduleStatus(this.hass)
        ? zappistantStopBoost(this.hass)
        : this.hass.callService("myenergi", "myenergi_stop_boost", {}, { entity_id: this._config.entity }),
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
          <div class="heading">
            <span class="title">${name}</span>
            <span class="subtitle">${modeEntity.state} mode</span>
          </div>
          ${this._renderStatusChip()}
        </div>
        ${this._renderStats()}
        ${this._renderModes(modeEntity.state, modeEntity.attributes.options as string[] | undefined)}
        ${this._config.show_boost ? this._renderBoost() : nothing}
        ${this._config.show_upcoming ? this._renderUpcoming() : nothing}
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
        ${charging ? html`<span class="dot"></span>` : html`<ha-icon .icon=${icon}></ha-icon>`}${label}
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
    live = false,
  ): TemplateResult {
    return html`
      <div class="stat ${live ? "live" : ""}" style="--tile-color: ${color}" @click=${() => this._moreInfo(entityId)}>
        <span class="icon-wrap"><ha-icon .icon=${icon}></ha-icon></span>
        <span class="value">${value}</span>
        <span class="label">${label}</span>
      </div>
    `;
  }

  private _renderStats(): TemplateResult | typeof nothing {
    const e = this._entities!;
    const chargePower = this._number(e.charge_power);
    const session = this._number(e.session_energy);
    const grid = this._number(e.grid_power);
    const solar = this._number(e.solar_power);
    const home = this._number(e.home_power);
    const charge = this._config.show_stats;
    const flow = this._config.show_power_flow;
    if (!charge && !flow) return nothing;

    return html`
      <div class="stats">
        ${charge && chargePower !== undefined
          ? this._renderStat(
              e.charge_power,
              "mdi:car-electric",
              "Charging",
              this._formatPower(chargePower),
              "var(--zappi-car)",
              chargePower > 50,
            )
          : nothing}
        ${charge && session !== undefined
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
      <div class="block">
        <div class="block-title"><ha-icon icon="mdi:rocket-launch-outline"></ha-icon>Boost</div>
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
            class="pill ${this._preset === "max" ? "selected" : ""}"
            ?disabled=${max === undefined}
            title=${max === undefined ? "Set the max charge % in the card settings" : `Charge to ${max}%`}
            @click=${() => this._togglePreset("max")}
          >
            Max allowed${max !== undefined ? ` (${max}%)` : ""}
          </button>
          <button class="pill ${this._preset === "full" ? "selected" : ""}" @click=${() => this._togglePreset("full")}>
            100%
          </button>
        </div>
        ${"problem" in plan
          ? plan.problem
            ? html`<div class="estimate problem">${plan.problem}</div>`
            : nothing
          : html`<div class="estimate">
              ${plan.from === undefined
                ? html`Full charge: <strong>${plan.kwh} kWh</strong>, the car stops when it's full`
                : html`≈ <strong>${plan.kwh} kWh</strong> to charge from ${plan.from}% to ${plan.to}%`}
            </div>`}
        ${kwh !== undefined ? this._renderModeNote() : nothing}
        <div class="boost-row actions">
          <label class="field" title="Ready by (smart boost)">
            <span class="label">Ready by</span>
            <input
              type="time"
              step="900"
              .value=${this._boostBy}
              @change=${(ev: Event) => (this._boostBy = (ev.target as HTMLInputElement).value)}
            />
          </label>
          <button
            class="primary"
            title="Smart boost"
            ?disabled=${busy || kwh === undefined || !this._boostBy}
            @click=${() => kwh && this._startBoost("smart-boost", kwh)}
          >
            <ha-icon icon="mdi:clock-fast"></ha-icon><span class="label">Smart boost</span>
          </button>
          <button
            title="Boost now"
            ?disabled=${busy || kwh === undefined}
            @click=${() => kwh && this._startBoost("boost", kwh)}
          >
            <ha-icon icon="mdi:rocket-launch"></ha-icon><span class="label">Boost now</span>
          </button>
          <!-- Always offered: a scheduled smart boost reports "Paused", not "Boosting". -->
          <button class="danger" title="Stop boost" ?disabled=${busy} @click=${this._stopBoost}>
            <ha-icon icon="mdi:stop"></ha-icon><span class="label">Stop</span>
          </button>
        </div>
      </div>
    `;
  }

  private _scheduleStatus(): ScheduleStatus | undefined {
    const entityId = findScheduleStatus(this.hass);
    const entity = entityId ? this.hass.states[entityId] : undefined;
    return entity ? ({ ...entity.attributes, state: entity.state } as ScheduleStatus) : undefined;
  }

  private _dayLabel(isoDate: string): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
    // An overnight charge that started yesterday evening is still running.
    if (days === -1) return "Last night";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${DAY_NAMES[(date.getDay() + 6) % 7]} ${d}/${m}`;
  }

  /** kWh for the upcoming charge from the typed start and target %, or why it can't be worked out. */
  private _upcomingPlan(): { kwh: number; start: number; target: number } | { problem: string } {
    const start = this._parsePercent(this._upcomingStart);
    const target = this._parsePercent(this._upcomingTarget);
    // Kept short: these show inline on the one-line upcoming charge. Empty fields need no words.
    if (this._kwhPerPercent === undefined) return { problem: "needs calibration" };
    if (start === undefined || target === undefined) return { problem: "" };
    if (start < 0 || start > 100 || target < 0 || target > 100) return { problem: "0–100%" };
    if (target <= start) return { problem: "target ≤ start, use Skip" };
    return { kwh: Math.ceil(kwhForTarget(this._kwhPerPercent, start, target)), start, target };
  }

  private _applyUpcoming(
    upcoming: UpcomingCharge,
    override: { kwh: number; start_percent: number | null; target_percent: number | null } | null,
  ): void {
    void this._call("upcoming", () => setOverride(this.hass, upcoming.date, override));
  }

  private _skipUpcoming(upcoming: UpcomingCharge): void {
    this._applyUpcoming(upcoming, {
      kwh: 0,
      start_percent: upcoming.start_percent,
      target_percent: upcoming.target_percent,
    });
  }

  private _renderUpcoming(): TemplateResult | typeof nothing {
    const status = this._scheduleStatus();
    if (!status) return nothing;
    const upcoming = status.upcoming;
    if (!upcoming) {
      return html`<div class="block upcoming">
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <span class="estimate problem">
          ${status.state === "disabled" ? "Schedule is off" : "Nothing scheduled in the next week"}
        </span>
      </div>`;
    }

    const busy = this._pending !== undefined;
    const when = upcoming.ready_by
      ? `by ${upcoming.ready_by}`
      : upcoming.intervals.map((iv) => `${iv.start}–${iv.end}`).join(", ");
    // Octopus mode: Octopus charges, Zappistant sets how much (% of its battery to add) and by when.
    const octopusBattery = status.mode === "octopus" ? status.octopus_battery_kwh : undefined;

    if (upcoming.skipped) {
      return html`
        <div class="block upcoming skipped">
          <ha-icon icon="mdi:calendar-remove"></ha-icon>
          <span><strong>${this._dayLabel(upcoming.date)}</strong> ${when}</span>
          <span class="estimate problem">Skipped</span>
          <span class="spacer"></span>
          <button ?disabled=${busy} @click=${() => this._applyUpcoming(upcoming, null)}>Undo</button>
        </div>
      `;
    }

    const plan = this._upcomingPlan();
    const changed =
      "kwh" in plan &&
      (plan.kwh !== upcoming.kwh || plan.start !== upcoming.start_percent || plan.target !== upcoming.target_percent);
    const running = status.run_date === upcoming.date && ["charging", "overrun", "waiting"].includes(status.state);
    const octopusSet = status.octopus?.date === upcoming.date ? status.octopus : undefined;
    const percentInput = (value: string, onInput: (v: string) => void) => html`
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="100"
        step="1"
        .value=${value}
        @input=${(ev: Event) => onInput((ev.target as HTMLInputElement).value)}
      />
    `;

    // The longer explanation goes in the tooltip so the block stays on one line.
    const detail = octopusSet
      ? `Octopus is set to add ${octopusSet.percent}% by ${octopusSet.ready_by}.`
      : upcoming.overridden
        ? `Adjusted for this charge: ${upcoming.kwh} kWh instead of ${upcoming.planned_kwh} kWh.`
        : `Planned: ${upcoming.kwh} kWh. Change the percentages to adjust just this charge.`;

    return html`
      <div class="block upcoming" title=${detail}>
        <ha-icon icon="mdi:calendar-clock"></ha-icon>
        <span><strong>${this._dayLabel(upcoming.date)}</strong> ${when}</span>
        <label class="field">from ${percentInput(this._upcomingStart, (v) => (this._upcomingStart = v))} %</label>
        <label class="field">to ${percentInput(this._upcomingTarget, (v) => (this._upcomingTarget = v))} %</label>
        <span class="estimate ${"problem" in plan ? "problem" : ""}">
          ${"problem" in plan
            ? plan.problem
            : html`→ <strong>${plan.kwh} kWh</strong>${octopusBattery
                ? html` ·
                    <span title="Octopus is asked to add this % of its ${octopusBattery} kWh battery">
                      +${octopusPercent(plan.kwh, octopusBattery)}%
                    </span>`
                : ""}`}
        </span>
        ${running
          ? html`<span class="estimate problem">
              ${SCHEDULE_STATES[status.state]} ${(status.delivered_kwh ?? 0).toFixed(1)}/${upcoming.kwh} kWh
            </span>`
          : nothing}
        <span class="spacer"></span>
        ${changed
          ? html`<button
              class="primary"
              ?disabled=${busy}
              @click=${() =>
                "kwh" in plan &&
                this._applyUpcoming(upcoming, { kwh: plan.kwh, start_percent: plan.start, target_percent: plan.target })}
            >
              Apply
            </button>`
          : nothing}
        ${upcoming.overridden
          ? html`<button
              ?disabled=${busy}
              title="Use the weekly plan again"
              @click=${() => this._applyUpcoming(upcoming, null)}
            >
              Reset
            </button>`
          : nothing}
        <button
          class="skip"
          ?disabled=${busy}
          title=${octopusBattery
            ? "Skip this charge. Octopus can't be set below 5%, so it may still add a little; turn smart charging off in the Octopus app to skip completely."
            : "Skip this charge"}
          @click=${() => this._skipUpcoming(upcoming)}
        >
          <ha-icon icon="mdi:debug-step-over"></ha-icon>Skip
        </button>
      </div>
    `;
  }

  /** Explain what happens after the boost, since the zappi falls back to the selected mode. */
  private _renderModeNote(): TemplateResult | typeof nothing {
    const mode = this._mode();
    if (this._octopusMode()) {
      return html`<div class="note">
        <ha-icon icon="mdi:information-outline"></ha-icon>Intelligent Octopus Go is in control: a boost from here charges
        at the normal rate, and the zappi stays in ${mode ?? "Eco+"}.
      </div>`;
    }
    if (this._preset === "full" || mode === "Stopped" || mode === undefined) return nothing;
    if (this._willSwitchToStopped()) {
      return html`<div class="note">
        <ha-icon icon="mdi:information-outline"></ha-icon>Switches from ${mode} to Stopped first, so charging ends at the target.
      </div>`;
    }
    return html`<div class="note warn">
      <ha-icon icon="mdi:alert-outline"></ha-icon>
      ${mode === "Eco+"
        ? "After the boost the zappi carries on in Eco+ and may charge past the target from surplus solar."
        : `After the boost the zappi carries on charging in ${mode}, so it won't stop at the target.`}
    </div>`;
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
