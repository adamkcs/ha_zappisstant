"""Run the integration in Home Assistant against fake myenergi entities."""

from datetime import datetime

from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
)

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util

from custom_components.zappistant.const import (
    CONF_MODE_ENTITY,
    CONF_PLUG_ENTITY,
    CONF_SESSION_ENTITY,
    CONF_STATUS_ENTITY,
    DOMAIN,
)

MODE = "select.myenergi_zappi_charge_mode"
SESSION = "sensor.myenergi_zappi_charge_added_session"
PLUG = "sensor.myenergi_zappi_plug_status"
STATUS = "sensor.myenergi_zappi_status"
SCHEDULE_STATUS = "sensor.zappi_schedule_status"
CHARGE_SLOT = "binary_sensor.zappi_schedule_charge_slot"

# 2026-11-10 is a Tuesday.
TUESDAY = 1


def _schedule(intervals, kwh=10):
    days = [
        {"enabled": False, "start_percent": None, "target_percent": None, "kwh": None, "kwh_manual": False, "intervals": []}
        for _ in range(7)
    ]
    days[TUESDAY] = {**days[TUESDAY], "enabled": True, "kwh": kwh, "kwh_manual": True, "intervals": intervals}
    return {"enabled": True, "days": days}


def _set_charger(hass, mode="Eco+", status="Paused", plug="EV Connected", session=0.0):
    hass.states.async_set(MODE, mode)
    hass.states.async_set(STATUS, status)
    hass.states.async_set(PLUG, plug)
    hass.states.async_set(SESSION, str(session))


async def _move_to(hass: HomeAssistant, freezer: FrozenDateTimeFactory, when: datetime) -> None:
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


@pytest.fixture
async def setup(hass: HomeAssistant, freezer: FrozenDateTimeFactory, hass_ws_client):
    await hass.config.async_set_time_zone("UTC")
    # Connect before moving the clock back, or the client's auth token looks like it's from the future.
    client = await hass_ws_client(hass)
    freezer.move_to(datetime(2026, 11, 10, 21, 50, tzinfo=dt_util.UTC))
    _set_charger(hass)
    calls = {
        "select": async_mock_service(hass, "select", "select_option"),
        "boost": async_mock_service(hass, "myenergi", "myenergi_boost"),
        "stop": async_mock_service(hass, "myenergi", "myenergi_stop_boost"),
        "smart": async_mock_service(hass, "myenergi", "myenergi_smart_boost"),
    }
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_MODE_ENTITY: MODE, CONF_SESSION_ENTITY: SESSION, CONF_PLUG_ENTITY: PLUG, CONF_STATUS_ENTITY: STATUS},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    async def save(schedule):
        await client.send_json_auto_id({"type": "zappistant/schedule/save", "schedule": schedule})
        return await client.receive_json()

    return calls, save, client


async def test_websocket_round_trip_and_validation(hass: HomeAssistant, setup) -> None:
    _calls, save, client = setup
    result = await save(_schedule([{"start": "22:00", "end": "24:00"}]))
    assert result["success"]
    assert result["result"]["schedule"]["days"][TUESDAY]["intervals"] == [
        {"start": "22:00", "end": "24:00", "overrun": False}
    ]

    await client.send_json_auto_id({"type": "zappistant/schedule/get"})
    got = await client.receive_json()
    assert got["result"]["schedule"]["enabled"] is True

    bad = await save(_schedule([{"start": "22:15", "end": "23:00"}]))
    assert not bad["success"]
    assert bad["error"]["code"] == "invalid_format"


async def test_boosts_in_slot_and_stops_at_slot_end(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup
) -> None:
    calls, save, _client = setup
    await save(_schedule([{"start": "22:00", "end": "23:00"}]))
    assert hass.states.get(SCHEDULE_STATUS).state == "idle"
    assert not calls["boost"]

    await _move_to(hass, freezer, datetime(2026, 11, 10, 22, 0, 30, tzinfo=dt_util.UTC))
    assert [c.data["option"] for c in calls["select"]] == ["Stopped"]
    assert [c.data["amount"] for c in calls["boost"]] == [10]
    assert calls["boost"][0].data["entity_id"] == MODE
    assert hass.states.get(SCHEDULE_STATUS).state == "charging"

    # The zappi reports the boost; 4 kWh go in before the slot ends.
    _set_charger(hass, mode="Stopped", status="Boosting", plug="Charging", session=4.0)
    await hass.async_block_till_done()
    assert hass.states.get(SCHEDULE_STATUS).attributes["delivered_kwh"] == 4.0

    await _move_to(hass, freezer, datetime(2026, 11, 10, 23, 0, 30, tzinfo=dt_util.UTC))
    assert len(calls["stop"]) == 1
    assert hass.states.get(SCHEDULE_STATUS).state == "ended"


async def test_overrun_keeps_charging_until_kwh(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup
) -> None:
    calls, save, _client = setup
    await save(_schedule([{"start": "22:00", "end": "23:00", "overrun": True}]))
    await _move_to(hass, freezer, datetime(2026, 11, 10, 22, 0, 30, tzinfo=dt_util.UTC))
    _set_charger(hass, mode="Stopped", status="Boosting", plug="Charging", session=6.0)
    await hass.async_block_till_done()

    await _move_to(hass, freezer, datetime(2026, 11, 10, 23, 30, tzinfo=dt_util.UTC))
    assert not calls["stop"]
    assert hass.states.get(SCHEDULE_STATUS).state == "overrun"

    # The zappi finishes the boost by itself once the kWh are in.
    _set_charger(hass, mode="Stopped", status="Paused", plug="EV Connected", session=10.0)
    await hass.async_block_till_done()
    assert hass.states.get(SCHEDULE_STATUS).state == "done"
    assert not calls["stop"]  # nothing to stop: the zappi isn't boosting
    assert len(calls["boost"]) == 1


async def test_waits_while_unplugged(hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup) -> None:
    calls, save, _client = setup
    _set_charger(hass, plug="EV Disconnected")
    await save(_schedule([{"start": "22:00", "end": "23:00"}]))
    await _move_to(hass, freezer, datetime(2026, 11, 10, 22, 0, 30, tzinfo=dt_util.UTC))
    assert not calls["boost"]

    _set_charger(hass, mode="Stopped", plug="EV Connected")
    await hass.async_block_till_done()
    assert [c.data["amount"] for c in calls["boost"]] == [10]


async def test_override_adjusts_upcoming_charge(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup
) -> None:
    calls, save, client = setup
    await save(_schedule([{"start": "22:00", "end": "23:00"}], kwh=20))
    assert hass.states.get(SCHEDULE_STATUS).attributes["upcoming"]["kwh"] == 20

    await client.send_json_auto_id(
        {"type": "zappistant/override/set", "date": "2026-11-10", "kwh": 12, "start_percent": 60}
    )
    result = await client.receive_json()
    assert result["success"]
    upcoming = hass.states.get(SCHEDULE_STATUS).attributes["upcoming"]
    assert (upcoming["kwh"], upcoming["start_percent"], upcoming["overridden"]) == (12, 60, True)

    await _move_to(hass, freezer, datetime(2026, 11, 10, 22, 0, 30, tzinfo=dt_util.UTC))
    assert [c.data["amount"] for c in calls["boost"]] == [12]

    # Clearing the override goes back to the weekly plan.
    await client.send_json_auto_id({"type": "zappistant/override/set", "date": "2026-11-10"})
    assert (await client.receive_json())["success"]
    assert hass.states.get(SCHEDULE_STATUS).attributes["upcoming"]["kwh"] == 20

    await client.send_json_auto_id({"type": "zappistant/override/set", "date": "not-a-date", "kwh": 5})
    assert not (await client.receive_json())["success"]


async def test_charge_slot_sensor_for_predbat(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup
) -> None:
    _calls, save, _client = setup
    await save(_schedule([{"start": "22:00", "end": "24:00"}], kwh=10))
    state = hass.states.get(CHARGE_SLOT)
    assert state.state == "off"
    assert state.attributes["planned_dispatches"] == [
        {
            "start": "2026-11-10T22:00:00+00:00",
            "end": "2026-11-10T23:25:42+00:00",
            "charge_in_kwh": 10.0,
            "source": "charger-schedule",
            "location": "AT_HOME",
        }
    ]
    assert state.attributes["charge_point_power_in_kw"] == 7.0

    await _move_to(hass, freezer, datetime(2026, 11, 10, 22, 0, 30, tzinfo=dt_util.UTC))
    assert hass.states.get(CHARGE_SLOT).state == "on"


async def test_boosts_through_zappistant_join_the_plan(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory, setup
) -> None:
    calls, _save, client = setup
    await client.send_json_auto_id(
        {"type": "zappistant/boost", "kind": "smart", "kwh": 14, "ready_by": "07:00", "switch_to_stopped": True}
    )
    assert (await client.receive_json())["success"]
    assert [c.data["option"] for c in calls["select"]] == ["Stopped"]
    assert calls["smart"][0].data["amount"] == 14
    assert calls["smart"][0].data["when"] == "07:00"
    dispatches = hass.states.get(CHARGE_SLOT).attributes["planned_dispatches"]
    assert [(d["start"], d["end"], d["charge_in_kwh"]) for d in dispatches] == [
        ("2026-11-11T05:00:00+00:00", "2026-11-11T07:00:00+00:00", 14.0)
    ]

    # Boost now replaces it and plans from now; stopping clears the plan.
    await client.send_json_auto_id({"type": "zappistant/boost", "kind": "manual", "kwh": 7})
    assert (await client.receive_json())["success"]
    assert calls["boost"][0].data["amount"] == 7
    dispatches = hass.states.get(CHARGE_SLOT).attributes["planned_dispatches"]
    assert [(d["start"], d["end"]) for d in dispatches] == [("2026-11-10T21:50:00+00:00", "2026-11-10T22:50:00+00:00")]
    assert hass.states.get(CHARGE_SLOT).state == "on"

    await client.send_json_auto_id({"type": "zappistant/boost/stop"})
    assert (await client.receive_json())["success"]
    assert len(calls["stop"]) == 1
    assert hass.states.get(CHARGE_SLOT).attributes["planned_dispatches"] == []


async def test_boost_dropped_when_unplugged(hass: HomeAssistant, setup) -> None:
    _calls, _save, client = setup
    await client.send_json_auto_id({"type": "zappistant/boost", "kind": "manual", "kwh": 7})
    assert (await client.receive_json())["success"]
    _set_charger(hass, plug="EV Disconnected")
    await hass.async_block_till_done()
    assert hass.states.get(CHARGE_SLOT).attributes["planned_dispatches"] == []


async def test_schedule_switch(hass: HomeAssistant, setup) -> None:
    _calls, save, _client = setup
    await save(_schedule([{"start": "22:00", "end": "23:00"}]))
    switch = next(
        e.entity_id for e in er.async_get(hass).entities.values() if e.platform == DOMAIN and e.domain == "switch"
    )
    assert hass.states.get(switch).state == "on"
    await hass.services.async_call("switch", "turn_off", {"entity_id": switch}, blocking=True)
    assert hass.states.get(switch).state == "off"
    assert hass.states.get(SCHEDULE_STATUS).state == "disabled"


async def test_config_flow_discovers_sensors(hass: HomeAssistant) -> None:
    myenergi = MockConfigEntry(domain="myenergi")
    myenergi.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=myenergi.entry_id, identifiers={("myenergi", "zappi-1")}
    )
    registry = er.async_get(hass)
    for entity_id in (MODE, SESSION, PLUG, STATUS):
        domain, object_id = entity_id.split(".")
        registry.async_get_or_create(
            domain, "myenergi", object_id, suggested_object_id=object_id, device_id=device.id
        )

    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {CONF_MODE_ENTITY: MODE})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_STATUS_ENTITY] == STATUS
    assert result["data"][CONF_PLUG_ENTITY] == PLUG
    assert result["data"][CONF_SESSION_ENTITY] == SESSION
