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
  default_boost_kwh?: number;
}

export interface LovelaceCardEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: ZappiCardConfig): void;
}
