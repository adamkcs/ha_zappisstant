// Minimal subset of the Home Assistant frontend types used by the card.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HassEntityRegistryEntry {
  entity_id: string;
  device_id?: string;
  platform?: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities: Record<string, HassEntityRegistryEntry>;
  language: string;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: { entity_id?: string | string[] },
  ): Promise<unknown>;
  callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
}

export interface ZappiCardConfig {
  type: string;
  /** The myenergi charge mode select entity; everything else is discovered from it. */
  entity: string;
  name?: string;
  status_entity?: string;
  plug_status_entity?: string;
  charge_power_entity?: string;
  session_energy_entity?: string;
  grid_power_entity?: string;
  solar_power_entity?: string;
  home_power_entity?: string;
  show_power_flow?: boolean;
  show_boost?: boolean;
  /** Show the next scheduled charge when the Zappistant integration is installed. */
  show_upcoming?: boolean;
  /** Last read battery state of health, for future range/capacity calculations. */
  battery_soh_percent?: number;
  /** Highest charge % the card targets unless 100% is chosen explicitly. */
  max_charge_percent?: number;
  /** Pre-filled "Ready by" time for smart boost, as HH:MM. */
  default_ready_by?: string;
  /** Switch to Stopped before a target boost so charging ends at the target. Defaults to true. */
  switch_to_stopped?: boolean;
  /** Past charging sessions used to convert battery percentage to kWh. */
  calibration?: CalibrationSlot[];
}

export interface CalibrationSlot {
  start_percent?: number;
  kwh?: number;
  end_percent?: number;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: ZappiCardConfig): void;
}
