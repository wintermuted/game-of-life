import type { ReactElement, ReactNode } from 'react';

export interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  valueLabel: string;
  decreaseIcon: ReactNode;
  increaseIcon: ReactNode;
  tooltipPlacement?: 'above' | 'right';
}

export function NumberStepper({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  label,
  decreaseLabel,
  increaseLabel,
  valueLabel,
  decreaseIcon,
  increaseIcon,
  tooltipPlacement = 'above',
}: NumberStepperProps): ReactElement {
  if (
    ![value, min, max, step].every(Number.isFinite) ||
    min > max ||
    step <= 0 ||
    value < min ||
    value > max
  ) {
    throw new RangeError(
      'NumberStepper requires a finite value within bounds and a positive finite step.',
    );
  }
  return (
    <div
      className={`wm-staged-stepper wm-staged-stepper-tooltip-${tooltipPlacement}`}
      role="group"
      aria-label={label}
    >
      <span className="wm-staged-tooltip" data-tooltip={decreaseLabel}>
        <button
          className="btn btn-sm btn-secondary-neutral"
          type="button"
          aria-label={decreaseLabel}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, Number((value - step).toPrecision(15))))}
        >
          {decreaseIcon}
        </button>
      </span>
      <span className="wm-staged-tooltip" data-tooltip={valueLabel}>
        <span className="wm-staged-stepper-value" aria-label={valueLabel} aria-live="polite">
          {value}
        </span>
      </span>
      <span className="wm-staged-tooltip" data-tooltip={increaseLabel}>
        <button
          className="btn btn-sm btn-secondary-neutral"
          type="button"
          aria-label={increaseLabel}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, Number((value + step).toPrecision(15))))}
        >
          {increaseIcon}
        </button>
      </span>
    </div>
  );
}
