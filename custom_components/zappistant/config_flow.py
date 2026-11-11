"""Config flow for Zappistant."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
)

from .const import (
    CONF_MODE_ENTITY,
    CONF_PLUG_ENTITY,
    CONF_SESSION_ENTITY,
    CONF_STATUS_ENTITY,
    CONF_SWITCH_TO_STOPPED,
    DOMAIN,
    MYENERGI_DOMAIN,
    SENSOR_SUFFIXES,
)


def _discover_sensors(hass: HomeAssistant, mode_entity: str) -> dict[str, str]:
    """Find the zappi's sensors on the same device as its charge mode select."""
    registry = er.async_get(hass)
    mode = registry.async_get(mode_entity)
    if mode is None or mode.device_id is None:
        return {}
    sensors = [
        entry.entity_id
        for entry in er.async_entries_for_device(registry, mode.device_id)
        if entry.domain == "sensor"
    ]
    found = {}
    for key, suffix in SENSOR_SUFFIXES.items():
        match = next(
            (
                entity_id
                for entity_id in sensors
                # "_plug_status" also ends with "_status".
                if entity_id.endswith(suffix)
                and not (key == CONF_STATUS_ENTITY and entity_id.endswith("_plug_status"))
            ),
            None,
        )
        if match:
            found[key] = match
    return found


def _sensor_selector() -> EntitySelector:
    return EntitySelector(EntitySelectorConfig(domain="sensor", integration=MYENERGI_DOMAIN))


class ZappistantConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            data = {**_discover_sensors(self.hass, user_input[CONF_MODE_ENTITY]), **user_input}
            if all(data.get(key) for key in SENSOR_SUFFIXES):
                return self.async_create_entry(title="Zappi schedule", data=data)
            errors["base"] = "sensors_not_found"

        schema = vol.Schema(
            {
                vol.Required(CONF_MODE_ENTITY): EntitySelector(
                    EntitySelectorConfig(domain="select", integration=MYENERGI_DOMAIN)
                ),
                vol.Optional(CONF_SESSION_ENTITY): _sensor_selector(),
                vol.Optional(CONF_PLUG_ENTITY): _sensor_selector(),
                vol.Optional(CONF_STATUS_ENTITY): _sensor_selector(),
                vol.Optional(CONF_SWITCH_TO_STOPPED, default=True): BooleanSelector(),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input or {}),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return ZappistantOptionsFlow()


class ZappistantOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        current = self.config_entry.options.get(
            CONF_SWITCH_TO_STOPPED, self.config_entry.data.get(CONF_SWITCH_TO_STOPPED, True)
        )
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Optional(CONF_SWITCH_TO_STOPPED, default=current): BooleanSelector()}
            ),
        )
