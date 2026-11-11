"""Websocket commands the dashboard card uses to read and save the schedule."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .controller import ScheduleController


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_schedule)
    websocket_api.async_register_command(hass, ws_save_schedule)


def _controller(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> ScheduleController | None:
    controller: ScheduleController | None = hass.data.get(DOMAIN)
    if controller is None:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, "Zappistant is not set up")
    return controller


@websocket_api.websocket_command({vol.Required("type"): "zappistant/schedule/get"})
@callback
def ws_get_schedule(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if controller := _controller(hass, connection, msg):
        connection.send_result(msg["id"], {"schedule": controller.schedule, "status": controller.status()})


@websocket_api.websocket_command(
    {vol.Required("type"): "zappistant/schedule/save", vol.Required("schedule"): dict}
)
@websocket_api.async_response
async def ws_save_schedule(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if not (controller := _controller(hass, connection, msg)):
        return
    try:
        schedule = await controller.async_set_schedule(msg["schedule"])
    except (ValueError, KeyError, TypeError) as err:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, str(err))
        return
    connection.send_result(msg["id"], {"schedule": schedule, "status": controller.status()})
