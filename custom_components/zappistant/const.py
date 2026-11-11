"""Constants for Zappistant."""

DOMAIN = "zappistant"
MYENERGI_DOMAIN = "myenergi"

CONF_MODE_ENTITY = "mode_entity"
CONF_SESSION_ENTITY = "session_entity"
CONF_PLUG_ENTITY = "plug_entity"
CONF_STATUS_ENTITY = "status_entity"
CONF_SWITCH_TO_STOPPED = "switch_to_stopped"

# Entity id suffixes the myenergi integration gives the zappi's sensors.
SENSOR_SUFFIXES = {
    CONF_SESSION_ENTITY: "_charge_added_session",
    CONF_PLUG_ENTITY: "_plug_status",
    CONF_STATUS_ENTITY: "_status",
}
