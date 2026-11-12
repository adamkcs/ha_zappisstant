# Zappi Card

A Home Assistant dashboard card for controlling a myenergi **zappi** EV charger, built on top of the
[myenergi integration](https://github.com/CJNE/ha-myenergi) (HACS). Pair it with the
[Zappistant integration](https://github.com/adamkcs/ha-zappistant-integration) for a weekly charging
schedule, Predbat support and Intelligent Octopus Go.

- **Live status**: charger / plug status, charge power, session energy, plus optional solar, grid and home power
- **Charge mode**: Fast, Eco, Eco+, Stopped
- **Boost to a target %**: smart boost (kWh by a time), boost now, stop boost
- **Weekly schedule and upcoming charge** (with Zappistant): edit the plan in the card editor, adjust or skip the next charge on the card

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

### Zappistant integration (optional, for the schedule)

Install it from its own repository, [adamkcs/ha-zappistant-integration](https://github.com/adamkcs/ha-zappistant-integration),
through HACS as an **Integration**. Its README covers setup, the schedule, Predbat and Octopus mode.

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
| `show_stats`            | `true`       | Show charging power and session energy               |
| `show_power_flow`       | `true`       | Show solar, grid and home power                      |
| `show_boost`            | `true`       | Show boost controls                                  |
| `show_upcoming`         | `true`       | Show the next scheduled charge (needs Zappistant)    |
| `battery_soh_percent`   | none         | Last read battery state of health (for later use)    |
| `max_charge_percent`    | none         | Highest target % unless 100% is picked on the card   |
| `default_ready_by`      | `07:00`      | Pre-filled "Ready by" time for smart boost           |
| `switch_to_stopped`     | `true`       | Switch to Stopped after a target boost (see below)   |
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

A zappi only boosts in **Eco or Eco+** (it ignores a boost in Stopped or Fast), so the card switches
to Eco+ first when needed. When the boost finishes, the zappi returns to that mode: in Eco+ it only
carries on from surplus solar, in Eco it keeps charging. With `switch_to_stopped` on (the default) and
the Zappistant integration installed, the zappi is switched to Stopped once a target boost is done, so
charging ends at the target. 100% charges are left in Eco+.

### Weekly schedule

With [Zappistant](https://github.com/adamkcs/ha-zappistant-integration) installed, the card editor
(Edit card) gets a **Weekly schedule** section: a half-hour slot grid per day (or a ready-by time in
Octopus mode), with start and target % that calculate the kWh from your calibration. It saves straight
to Zappistant with its own Save button, separately from the card's settings. See Zappistant's README
for how the schedule runs.

The card's **Upcoming charge** section shows the next charge the schedule will run (today's if it
still has slots left, otherwise the next active day) on one line, with its start and target %. Change
either to recalculate the kWh from your calibration and press **Apply**: that adjusts only this one
charge and leaves the weekly plan as it is. **Reset** removes the adjustment. **Skip** (on the right)
cancels just this charge; it stays shown as skipped, with **Undo**, until its slots have passed.

## Development

```sh
npm install
npm run watch     # rebuilds dist/zappi-card.js on change (with sourcemaps)
npm run build     # minified production build
npm run typecheck
npm run preview   # build and serve dev/preview.html with mock data
```

### Deploying to Home Assistant

To try a change before releasing it, `npm run deploy` builds the card and copies it over SSH into
Home Assistant, replacing the HACS-installed copy (and the gzipped copy HACS serves). Copy
`.deploy.env.example` to `.deploy.env` and set your host first; `npm run deploy -- --dry-run` shows
what it would do. Hard-refresh the dashboard afterwards. The next HACS update restores the release.
