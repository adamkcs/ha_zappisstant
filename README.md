# Zappi Card

A Home Assistant dashboard card for controlling a myenergi **zappi** EV charger, built on top of the
[myenergi integration](https://github.com/CJNE/ha-myenergi) (HACS), plus an optional companion
integration, **Zappistant**, that runs a weekly charging schedule.

- **Live status**: charger / plug status, charge power, session energy, plus optional solar, grid and home power
- **Charge mode**: Fast, Eco, Eco+, Stopped
- **Boost to a target %**: smart boost (kWh by a time), boost now, stop boost
- **Weekly schedule** (with Zappistant, set up in the card editor): half-hour charging slots and a kWh amount per day

## Requirements

- Home Assistant with the [myenergi integration](https://github.com/CJNE/ha-myenergi) set up and your zappi visible

## Installation

### Card: HACS (custom repository)

1. HACS → ⋮ → **Custom repositories** → add this repository's URL as type **Dashboard**
2. Install **Zappi Card** and reload your browser

### Card: manual

1. Copy `dist/zappi-card.js` to `<config>/www/zappi-card.js`
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/zappi-card.js` as a **JavaScript module**
3. Reload your browser

### Zappistant integration (for the schedule)

1. Copy `custom_components/zappistant` to `<config>/custom_components/zappistant`
2. Restart Home Assistant
3. Settings → Devices & services → **Add integration** → **Zappistant**, and pick the zappi's charge
   mode entity. Its sensors are found automatically.

## Configuration

Add the card from the dashboard card picker (search for "Zappi"), or in YAML:

```yaml
type: custom:zappi-card
entity: select.myenergi_zappi_charge_mode
```

The card finds the zappi's other sensors from the charge mode entity's device. Set any of the
`*_entity` options if a sensor isn't found or you want to use a different one.

| Option                  | Default      | Description                                          |
| ----------------------- | ------------ | ---------------------------------------------------- |
| `entity`                | **required** | myenergi zappi charge mode `select` entity           |
| `name`                  | device name  | Card title                                           |
| `show_power_flow`       | `true`       | Show solar, grid and home power                      |
| `show_boost`            | `true`       | Show boost controls                                  |
| `show_upcoming`         | `true`       | Show the next scheduled charge (needs Zappistant)    |
| `battery_soh_percent`   | none         | Last read battery state of health (for later use)    |
| `max_charge_percent`    | none         | Highest target % unless 100% is picked on the card   |
| `default_ready_by`      | `07:00`      | Pre-filled "Ready by" time for smart boost           |
| `switch_to_stopped`     | `true`       | Switch to Stopped before a target boost (see below)  |
| `calibration`           | none         | Up to 5 past charges, see below                      |
| `status_entity`         | auto         | Status sensor (Paused / Charging / Boosting / ...)   |
| `plug_status_entity`    | auto         | Plug status sensor                                   |
| `charge_power_entity`   | auto         | Charge power sensor (CT internal load)               |
| `session_energy_entity` | auto         | Charge added this session                            |
| `grid_power_entity`     | auto         | Grid power (positive = import, negative = export)    |
| `solar_power_entity`    | auto         | Solar generation power                               |
| `home_power_entity`     | auto         | Home consumption power                               |

### Battery calibration

Cars without onboard charge limiting (e.g. MG5) can't tell the zappi to stop at a percentage.
The card estimates instead: in the card editor's **Battery calibration** section, enter up to five
past charges (battery % before, kWh the zappi added, battery % after). It averages the kWh per
percent of the complete rows. The result includes charging losses.

```yaml
calibration:
  - start_percent: 55
    kwh: 15.1
    end_percent: 81
```

### Boosting to a target

On the card, enter the battery's current % and a target %. The card shows the kWh it will boost.
An empty target means the max charge allowed (or 100% if none is set). **Max allowed** pins the
target to `max_charge_percent`. **100%** sets a 99 kWh boost (the maximum, overriding the max
allowed) and needs no current % or calibration, since the car stops itself when full.

**Smart boost** is the main action: it charges the kWh by the "Ready by" time, using myenergi's
scheduling (and cheap tariff slots, if set up in the myenergi app). **Boost now** charges immediately.
Smart boost sends the time as `HH:MM`. The zappi works in 15-minute steps.

When a boost finishes, the zappi returns to its charge mode. In Fast or Eco it keeps charging, and in
Eco+ it may continue from surplus solar, so it wouldn't stop at the target. With `switch_to_stopped`
on (the default), the card switches the zappi to Stopped before starting a target boost. 100% charges
are left in their current mode.

### Weekly schedule

With Zappistant installed, the card editor (Edit card) gets a **Weekly schedule** section. It saves
straight to Home Assistant with its own Save button, separately from the card's settings. Each weekday has:

- **Charging slots**: tap or drag on a half-hour grid, up to 5 intervals per day (midnight to midnight)
- **Expected start %** and **target %**, which calculate the **kWh** from your calibration. You can
  also type the kWh in directly; it's the amount the schedule actually uses.
- **Keep charging after** (per interval): when on, charging continues past that interval's end until
  the day's kWh is delivered, even past midnight. When off, charging stops at the interval's end.

**Overnight charges**: when a day's last slot runs to 24:00 and the next day (also switched on)
starts with a 00:00 slot, the two are one charge, e.g. Tuesday 22:00–24:00 plus Wednesday
00:00–05:00 is a single 22:00–05:00 charge. It uses the first day's start %, target % and kWh, and
counts delivered energy across midnight. The next day's own charge is its remaining slots. The
schedule editor marks both halves.

Press **Save** to send the plan to Home Assistant. Zappistant then runs it even with no dashboard open:

- At the start of the day's first slot it switches the zappi to Stopped (an integration option, on by
  default) so it doesn't charge outside the slots.
- In each slot it starts a boost for the kWh still needed, if the car is plugged in.
- At the end of a slot it stops the boost, unless that interval keeps charging after.
- It counts kWh delivered from the zappi's session energy sensor, so a day's later slots only add
  what's still missing. An overrun is dropped if it hasn't finished by the end of the next day.

The card's **Upcoming charge** section shows the next charge the schedule will run (today's if it
still has slots left, otherwise the next active day) with its expected start %. Change the start %
to recalculate the kWh from your calibration and press **Apply**: that adjusts only this one charge
and leaves the weekly plan as it is. 0 kWh (start at or above the target) skips the charge.
**Use weekly plan** removes the adjustment.

Zappistant adds `sensor.zappi_schedule_status` (with progress attributes),
`switch.zappi_schedule_enabled` to turn the whole schedule on or off, and
`binary_sensor.zappi_schedule_charge_slot` for Predbat (below).

### Predbat

Zappistant publishes its charging plan in the format [Predbat](https://springfall2008.github.io/batpred/)
reads planned car charging from, so Predbat can plan the house battery around it.
`binary_sensor.zappi_schedule_charge_slot` is on during a planned charge, and its
`planned_dispatches` attribute lists the next 48 hours:

- **Schedule**: each upcoming charge split over its slots at the configured charging power
  (an integration option, 7 kW by default), trimmed to the kWh still needed, and extended past a
  slot's end when "keep charging after" is on.
- **Boost now** (from the card): from now until the kWh is in.
- **Smart boost** (from the card): myenergi doesn't say when it will charge, so it's estimated as
  the latest block that finishes by the "Ready by" time.

Boosts are dropped from the plan once delivered, when the car is unplugged, when you press Stop boost,
or when the ready-by time passes. Boosts started outside the card (e.g. the myenergi app) aren't in
the plan; Predbat only sees them once the car is charging.

Each slot has the source `charger-schedule`, which Predbat treats as car load only, never as a
cheap tariff slot. In Predbat's `apps.yaml`:

```yaml
num_cars: 1
octopus_intelligent_slot: binary_sensor.zappi_schedule_charge_slot
```

Keep Predbat's own zappi control (`myenergi_zappi_control`) off, or it will switch the zappi
between Fast and Stopped against Zappistant. Predbat's myenergi support (or `car_charging_now` and
`car_charging_energy` pointed at the zappi's plug status and session energy) still covers a car that
is charging right now and keeps car energy out of the house load history.

On **Intelligent Octopus Go**, `octopus_intelligent_slot` is for Octopus's own dispatch sensor and
Octopus schedules the charging, so this setup needs revisiting before switching tariff.

## Development

```sh
npm install
npm run watch     # rebuilds dist/zappi-card.js on change (with sourcemaps)
npm run build     # minified production build
npm run typecheck
npm run preview   # build and serve dev/preview.html with mock data
```

To try the card in a running Home Assistant, copy or symlink `dist/zappi-card.js` into `<config>/www/`
and hard-refresh the dashboard after each rebuild.

Integration tests run Zappistant inside Home Assistant (Python 3.13):

```sh
python3.13 -m venv .venv && .venv/bin/pip install -r requirements_test.txt
.venv/bin/python -m pytest
```
