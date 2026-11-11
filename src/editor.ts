import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, ZappiCardConfig } from "./types";

const sensor = (name: string, deviceClass?: string) => ({
  name,
  selector: {
    entity: { filter: { domain: "sensor", integration: "myenergi", ...(deviceClass && { device_class: deviceClass }) } },
  },
});

const SCHEMA = [
  {
    name: "entity",
    required: true,
    selector: { entity: { filter: { domain: "select", integration: "myenergi" } } },
  },
  { name: "name", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_power_flow", selector: { boolean: {} } },
      { name: "show_boost", selector: { boolean: {} } },
    ],
  },
  {
    name: "default_boost_kwh",
    selector: { number: { min: 1, max: 99, mode: "box", unit_of_measurement: "kWh" } },
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

const LABELS: Record<string, string> = {
  entity: "Charge mode entity",
  name: "Name",
  show_power_flow: "Show solar / grid / home power",
  show_boost: "Show boost controls",
  default_boost_kwh: "Default boost amount",
  status_entity: "Status",
  plug_status_entity: "Plug status",
  charge_power_entity: "Charge power",
  session_energy_entity: "Session energy",
  grid_power_entity: "Grid power",
  solar_power_entity: "Solar power",
  home_power_entity: "Home power",
};

@customElement("zappi-card-editor")
export class ZappiCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: ZappiCardConfig;

  public setConfig(config: ZappiCardConfig): void {
    this._config = { show_power_flow: true, show_boost: true, ...config };
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s: { name: string; title?: string }) => LABELS[s.name] ?? s.title ?? s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = { ...ev.detail.value } as Record<string, unknown>;
    // Drop cleared optional fields so the YAML stays tidy.
    for (const [key, value] of Object.entries(config)) {
      if (value === "" || value === undefined) delete config[key];
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }
}
