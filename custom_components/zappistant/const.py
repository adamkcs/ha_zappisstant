"""Constants for Zappistant."""

DOMAIN = "zappistant"
MYENERGI_DOMAIN = "myenergi"

CONF_MODE_ENTITY = "mode_entity"
CONF_SESSION_ENTITY = "session_entity"
CONF_PLUG_ENTITY = "plug_entity"
CONF_STATUS_ENTITY = "status_entity"
CONF_SWITCH_TO_STOPPED = "switch_to_stopped"
CONF_CHARGE_RATE = "charge_rate"

DEFAULT_CHARGE_RATE = 7.0

# Predbat counts dispatches with this source as car load only, never as a cheap tariff slot.
DISPATCH_SOURCE = "charger-schedule"

# Entity id suffixes the myenergi integration gives the zappi's sensors.
SENSOR_SUFFIXES = {
    CONF_SESSION_ENTITY: "_charge_added_session",
    CONF_PLUG_ENTITY: "_plug_status",
    CONF_STATUS_ENTITY: "_status",
}
