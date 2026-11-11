# Zappi Card

A Home Assistant dashboard card for controlling a myenergi **zappi** EV charger, built on top of the
[myenergi integration](https://github.com/CJNE/ha-myenergi) (HACS).

- **Live status**: charger / plug status, charge power, session energy, plus optional solar, grid and home power
- **Charge mode**: Fast, Eco, Eco+, Stopped
- **Boost**: manual boost (kWh), smart boost (kWh by a time), stop boost

## Requirements

- Home Assistant with the [myenergi integration](https://github.com/CJNE/ha-myenergi) set up and your zappi visible

## Installation

### HACS (custom repository)

1. HACS → ⋮ → **Custom repositories** → add this repository's URL as type **Dashboard**
2. Install **Zappi Card** and reload your browser

### Manual

1. Copy `dist/zappi-card.js` to `<config>/www/zappi-card.js`
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/zappi-card.js` as a **JavaScript module**
3. Reload your browser

## Configuration

Add the card from the dashboard card picker (search for "Zappi"), or in YAML:

```yaml
type: custom:zappi-card
entity: select.myenergi_zappi_charge_mode
```

The card finds the zappi's other sensors from the charge mode entity's device. Set any of the
`*_entity` options if a sensor isn't found or you want to use a different one.

| Option                  | Default       | Description                                         |
| ----------------------- | ------------- | --------------------------------------------------- |
| `entity`                | **required**  | myenergi zappi charge mode `select` entity          |
| `name`                  | device name   | Card title                                          |
| `show_power_flow`       | `true`        | Show solar, grid and home power                     |
| `show_boost`            | `true`        | Show boost controls                                 |
| `battery_soh_percent`   | none          | Last read battery state of health (for later use)   |
| `max_charge_percent`    | none          | Highest target % unless 100% is picked on the card  |
| `status_entity`         | auto          | Status sensor (Paused / Charging / Boosting / ...)  |
| `plug_status_entity`    | auto          | Plug status sensor                                  |
| `charge_power_entity`   | auto          | Charge power sensor (CT internal load)              |
| `session_energy_entity` | auto          | Charge added this session                           |
| `grid_power_entity`     | auto          | Grid power (positive = import, negative = export)   |
| `solar_power_entity`    | auto          | Solar generation power                              |
| `home_power_entity`     | auto          | Home consumption power                              |

| `default_ready_by`      | `07:00`       | Pre-filled "Ready by" time for smart boost          |
| `switch_to_stopped`     | `true`        | Switch to Stopped before a target boost (see below) |
| `calibration`           | none          | Up to 5 past charges, see below                     |

### Battery calibration

Cars without onboard charge limiting (e.g. MG5) can't tell the zappi to stop at a percentage.
The card estimates instead: in the card editor's **Battery calibration** section, enter up to five
past charges (battery % before, kWh the zappi added, battery % after). It averages the kWh per
percent of the complete rows. The result includes charging losses.

On the card, enter the battery's current % and a target %. The card shows the kWh it will boost.
An empty target means the max charge allowed (or 100% if none is set). **Max allowed** pins the
target to `max_charge_percent`. **100%** sets a 99 kWh boost (the maximum, overriding the max
allowed) and needs no current % or calibration, since the car stops itself when full.

**Smart boost** is the main action: it charges the kWh by the "Ready by" time, using myenergi's
scheduling (and cheap tariff slots, if set up in the myenergi app). **Boost now** charges immediately.

When a boost finishes, the zappi returns to its charge mode. In Fast or Eco it keeps charging, and in
Eco+ it may continue from surplus solar, so it wouldn't stop at the target. With `switch_to_stopped`
on (the default), the card switches the zappi to Stopped before starting a target boost. 100% charges
are left in their current mode.

```yaml
calibration:
  - start_percent: 55
    kwh: 15.1
    end_percent: 81
```

Smart boost sends the time as `HH:MM`. The zappi works in 15-minute steps.

## Development

```sh
npm install
npm run watch   # rebuilds dist/zappi-card.js on change (with sourcemaps)
npm run build   # minified production build
npm run typecheck
```

To try it in a running Home Assistant, copy or symlink `dist/zappi-card.js` into `<config>/www/`
and hard-refresh the dashboard after each rebuild.
