import type { HomeAssistant, ZappiCardConfig } from "./types";

// Entity id suffixes created by the myenergi integration (CJNE/ha-myenergi).
// Zappi device entities are named "myenergi <zappi name> <sensor>", hub entities
// "myenergi <site name> <sensor>".
const ZAPPI_SUFFIXES = {
  status: ["_status"],
  plug_status: ["_plug_status"],
  charge_power: ["_power_ct_internal_load"],
  session_energy: ["_charge_added_session"],
  grid_power: ["_power_ct_grid"],
  solar_power: ["_power_ct_generation"],
} as const;

const HUB_SUFFIXES = {
  grid_power: ["_power_grid"],
  solar_power: ["_power_generation"],
  home_power: ["_home_consumption"],
} as const;

export interface ZappiEntities {
  mode: string;
  status?: string;
  plug_status?: string;
  charge_power?: string;
  session_energy?: string;
  grid_power?: string;
  solar_power?: string;
  home_power?: string;
}

type Key = Exclude<keyof ZappiEntities, "mode">;

function findBySuffix(
  candidates: string[],
  suffixes: readonly string[],
  exclude: string[] = [],
): string | undefined {
  for (const suffix of suffixes) {
    // "_plug_status" also ends with "_status", so skip explicitly excluded suffixes.
    const match = candidates.find(
      (id) => id.endsWith(suffix) && !exclude.some((ex) => id.endsWith(ex)),
    );
    if (match) return match;
  }
  return undefined;
}

/** Resolve the entities the card needs, preferring explicit config over discovery. */
export function resolveEntities(hass: HomeAssistant, config: ZappiCardConfig): ZappiEntities {
  const registry = hass.entities ?? {};
  const deviceId = registry[config.entity]?.device_id;
  const myenergiSensors = Object.values(registry)
    .filter((e) => e.platform === "myenergi" && e.entity_id.startsWith("sensor."))
    .filter((e) => e.entity_id in hass.states);
  const deviceSensors = myenergiSensors
    .filter((e) => deviceId && e.device_id === deviceId)
    .map((e) => e.entity_id);
  const hubSensors = myenergiSensors
    .filter((e) => !deviceId || e.device_id !== deviceId)
    .map((e) => e.entity_id);

  const discovered: Partial<Record<Key, string>> = {
    status: findBySuffix(deviceSensors, ZAPPI_SUFFIXES.status, ["_plug_status"]),
    plug_status: findBySuffix(deviceSensors, ZAPPI_SUFFIXES.plug_status),
    charge_power: findBySuffix(deviceSensors, ZAPPI_SUFFIXES.charge_power),
    session_energy: findBySuffix(deviceSensors, ZAPPI_SUFFIXES.session_energy),
    grid_power:
      findBySuffix(hubSensors, HUB_SUFFIXES.grid_power) ??
      findBySuffix(deviceSensors, ZAPPI_SUFFIXES.grid_power),
    solar_power:
      findBySuffix(hubSensors, HUB_SUFFIXES.solar_power) ??
      findBySuffix(deviceSensors, ZAPPI_SUFFIXES.solar_power),
    home_power: findBySuffix(hubSensors, HUB_SUFFIXES.home_power),
  };

  return {
    mode: config.entity,
    status: config.status_entity ?? discovered.status,
    plug_status: config.plug_status_entity ?? discovered.plug_status,
    charge_power: config.charge_power_entity ?? discovered.charge_power,
    session_energy: config.session_energy_entity ?? discovered.session_energy,
    grid_power: config.grid_power_entity ?? discovered.grid_power,
    solar_power: config.solar_power_entity ?? discovered.solar_power,
    home_power: config.home_power_entity ?? discovered.home_power,
  };
}

/** The Zappistant schedule status sensor, if the companion integration is installed. */
export function findScheduleStatus(hass: HomeAssistant): string | undefined {
  return Object.values(hass.entities ?? {}).find(
    (e) => e.platform === "zappistant" && e.entity_id.startsWith("sensor."),
  )?.entity_id;
}

/** Find the first myenergi zappi charge mode select, used for the card stub. */
export function findChargeModeSelect(hass: HomeAssistant): string | undefined {
  return Object.keys(hass.states).find(
    (id) =>
      id.startsWith("select.") &&
      id.endsWith("_charge_mode") &&
      hass.entities?.[id]?.platform === "myenergi",
  );
}
