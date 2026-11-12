import { css } from "lit";

// Everything is built from Home Assistant's theme variables (and mixes of them), so the card
// follows light, dark and custom themes.
export const cardStyles = css`
  :host {
    display: block;
    --zappi-accent: var(--primary-color);
    --zappi-solar: var(--energy-solar-color, #ff9800);
    --zappi-grid: var(--energy-grid-consumption-color, #488fc2);
    --zappi-export: var(--energy-grid-return-color, #8353d1);
    --zappi-home: var(--primary-text-color);
    --zappi-car: var(--success-color, #43a047);
    /* Surfaces: a faint wash of the text colour reads as raised in both light and dark themes. */
    --zappi-surface: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
    --zappi-control: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    --zappi-control-hover: color-mix(in srgb, var(--zappi-accent) 14%, var(--zappi-control));
    --zappi-radius: 14px;
    --zappi-control-height: 36px;
  }
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Header */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .heading {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    background: var(--zappi-control);
    color: var(--primary-text-color);
    white-space: nowrap;
    cursor: pointer;
  }
  .chip ha-icon {
    --mdc-icon-size: 16px;
  }
  .chip.active {
    background: color-mix(in srgb, var(--zappi-car) 16%, transparent);
    color: var(--zappi-car);
  }
  .chip.fault {
    background: color-mix(in srgb, var(--error-color) 16%, transparent);
    color: var(--error-color);
  }
  .chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 1.6s ease-in-out infinite;
  }

  /* Stat tiles, each tinted with its own colour (--tile-color). */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
    gap: 8px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 12px;
    border-radius: var(--zappi-radius);
    background: color-mix(in srgb, var(--tile-color) 9%, transparent);
    cursor: pointer;
    transition: background 0.2s;
  }
  .stat:hover {
    background: color-mix(in srgb, var(--tile-color) 15%, transparent);
  }
  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--tile-color) 18%, transparent);
    color: var(--tile-color);
  }
  .icon-wrap ha-icon {
    --mdc-icon-size: 18px;
  }
  .stat.live .icon-wrap {
    animation: glow 2s ease-in-out infinite;
  }
  .stat .value {
    font-size: 1.15rem;
    font-weight: 600;
    line-height: 1.1;
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .stat .label {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
  }

  /* Buttons */
  button {
    font: inherit;
    font-weight: 500;
    border: none;
    border-radius: 10px;
    padding: 0 14px;
    min-height: var(--zappi-control-height);
    cursor: pointer;
    background: var(--zappi-control);
    color: var(--primary-text-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  button:hover:not(:disabled) {
    background: var(--zappi-control-hover);
  }
  button:active:not(:disabled) {
    transform: scale(0.97);
  }
  button:focus-visible {
    outline: 2px solid var(--zappi-accent);
    outline-offset: 2px;
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button ha-icon {
    --mdc-icon-size: 18px;
  }
  button.selected,
  button.primary {
    background: var(--zappi-accent);
    color: var(--text-primary-color, #fff);
  }
  button.primary:hover:not(:disabled),
  button.selected:hover:not(:disabled) {
    background: color-mix(in srgb, var(--zappi-accent) 85%, #000);
  }
  button.danger {
    background: color-mix(in srgb, var(--error-color) 12%, transparent);
    color: var(--error-color);
  }
  button.danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 20%, transparent);
  }
  button.pill {
    border-radius: 999px;
    min-height: 32px;
    padding: 0 12px;
    font-size: 0.85rem;
  }

  /* Charge mode: a segmented control. */
  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 4px;
    padding: 4px;
    border-radius: var(--zappi-radius);
    background: var(--zappi-surface);
  }
  .modes button {
    flex-direction: column;
    gap: 2px;
    padding: 8px 4px;
    border-radius: 10px;
    background: transparent;
    font-size: 0.85rem;
  }
  .modes button ha-icon {
    --mdc-icon-size: 20px;
  }
  .modes button.selected {
    background: var(--zappi-accent);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--zappi-accent) 35%, transparent);
  }

  /* Panels grouping related controls, e.g. Boost or the upcoming charge. */
  .block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: var(--zappi-radius);
    background: var(--zappi-surface);
    container-type: inline-size;
  }
  .block-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
  }
  .block-title ha-icon {
    --mdc-icon-size: 16px;
  }
  .boost-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  /* Ready by, Smart boost, Boost now and Stop share one row; the buttons shrink to fit. */
  .boost-row.actions {
    flex-wrap: nowrap;
    gap: 6px;
  }
  .boost-row.actions button {
    flex: 1 1 0;
    min-width: 0;
    padding: 0 6px;
    white-space: nowrap;
  }
  .boost-row.actions .field {
    flex-shrink: 0;
  }
  /* On a narrow card (e.g. a phone) the actions keep to one row as icons; tooltips name them. */
  @container (max-width: 440px) {
    .boost-row.actions .label {
      display: none;
    }
  }

  /* Upcoming charge: one line, tinted with the accent; wraps only when the card is too narrow. */
  .block.upcoming {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    padding: 8px 10px 8px 12px;
    background: color-mix(in srgb, var(--zappi-accent) 9%, transparent);
    color: var(--primary-text-color);
    font-size: 0.9rem;
  }
  .upcoming > * {
    white-space: nowrap;
  }
  .upcoming ha-icon {
    --mdc-icon-size: 20px;
    color: var(--zappi-accent);
  }
  .upcoming button {
    min-height: 30px;
    padding: 0 12px;
  }
  .upcoming .field {
    gap: 4px;
  }
  .upcoming button.skip {
    padding: 0 8px;
    background: transparent;
    color: var(--secondary-text-color);
  }
  .upcoming button.skip:hover:not(:disabled) {
    background: var(--zappi-control);
    color: var(--primary-text-color);
  }
  .upcoming button.skip ha-icon {
    color: inherit;
    --mdc-icon-size: 18px;
  }
  /* A skipped charge is shown muted, with Undo. */
  .block.upcoming.skipped {
    background: var(--zappi-surface);
  }
  .upcoming.skipped ha-icon {
    color: var(--secondary-text-color);
  }
  .spacer {
    flex: 1;
  }

  /* Inputs */
  .field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }
  input {
    font: inherit;
    width: 72px;
    height: 32px;
    box-sizing: border-box;
    padding: 0 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus {
    outline: none;
    border-color: var(--zappi-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--zappi-accent) 22%, transparent);
  }
  input[type="number"] {
    width: 52px;
    text-align: center;
    /* No spinner arrows: they eat the room "100" needs, and the keypad or typing is quicker. */
    -moz-appearance: textfield;
    appearance: textfield;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="time"] {
    width: auto;
  }
  input:disabled {
    opacity: 0.6;
  }

  /* Messages */
  .estimate {
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }
  .estimate strong {
    font-weight: 600;
  }
  .estimate.problem {
    color: var(--secondary-text-color);
  }
  .note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }
  .note ha-icon {
    --mdc-icon-size: 18px;
    flex-shrink: 0;
  }
  .note.warn {
    color: var(--warning-color);
  }
  .error {
    color: var(--error-color);
    font-size: 0.85rem;
  }
  .warning {
    padding: 8px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--warning-color) 20%, transparent);
    color: var(--primary-text-color);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.75);
    }
  }
  @keyframes glow {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--tile-color) 35%, transparent);
    }
    50% {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--tile-color) 0%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    .chip .dot,
    .stat.live .icon-wrap {
      animation: none !important;
      transition: none !important;
    }
  }
`;
