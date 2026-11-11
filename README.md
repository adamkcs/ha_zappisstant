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
| `default_boost_kwh`     | `10`          | Pre-filled boost amount                             |
| `status_entity`         | auto          | Status sensor (Paused / Charging / Boosting / ...)  |
| `plug_status_entity`    | auto          | Plug status sensor                                  |
| `charge_power_entity`   | auto          | Charge power sensor (CT internal load)              |
| `session_energy_entity` | auto          | Charge added this session                           |
| `grid_power_entity`     | auto          | Grid power (positive = import, negative = export)   |
| `solar_power_entity`    | auto          | Solar generation power                              |
| `home_power_entity`     | auto          | Home consumption power                              |

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
