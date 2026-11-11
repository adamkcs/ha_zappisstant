import { css } from "lit";

export const cardStyles = css`
  :host {
    --zappi-accent: var(--primary-color);
    --zappi-solar: var(--energy-solar-color, #ff9800);
    --zappi-grid: var(--energy-grid-consumption-color, #488fc2);
    --zappi-export: var(--energy-grid-return-color, #8353d1);
    --zappi-home: var(--primary-text-color);
    --zappi-car: var(--success-color, #43a047);
  }
  ha-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.85rem;
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .chip ha-icon {
    --mdc-icon-size: 18px;
  }
  .chip.active {
    background: color-mix(in srgb, var(--zappi-car) 20%, transparent);
    color: var(--zappi-car);
  }
  .chip.fault {
    background: color-mix(in srgb, var(--error-color) 20%, transparent);
    color: var(--error-color);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    border-radius: 12px;
    background: var(--secondary-background-color);
    cursor: pointer;
  }
  .stat ha-icon {
    --mdc-icon-size: 22px;
  }
  .stat .value {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .stat .label {
    font-size: 0.75rem;
    color: var(--secondary-text-color);
  }
  .section-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
    margin-bottom: 6px;
  }
  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 8px;
  }
  button {
    font: inherit;
    border: none;
    border-radius: 12px;
    padding: 10px 8px;
    cursor: pointer;
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: background 0.15s, color 0.15s;
  }
  button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--zappi-accent) 15%, var(--secondary-background-color));
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  button.selected {
    background: var(--zappi-accent);
    color: var(--text-primary-color, #fff);
  }
  button.danger {
    color: var(--error-color);
  }
  button ha-icon {
    --mdc-icon-size: 22px;
  }
  .boost {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .boost-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .boost-row button {
    flex-direction: row;
    padding: 8px 14px;
  }
  .field {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }
  input {
    font: inherit;
    width: 72px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
  }
  input[type="number"] {
    width: 56px;
  }
  input[type="time"] {
    width: auto;
  }
  input:disabled {
    opacity: 0.6;
  }
  .estimate {
    font-size: 0.9rem;
    color: var(--primary-text-color);
  }
  .estimate.problem {
    color: var(--secondary-text-color);
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
`;
