import type { ReactElement, ReactNode } from 'react';

export interface ToggleOption<Value extends string = string> {
  value: Value;
  label: ReactNode;
  icon?: ReactNode;
  swatchColor?: string;
  title?: string;
  disabled?: boolean;
}

export interface ToggleGroupProps<Value extends string = string> {
  options: readonly ToggleOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  label: string;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  appearance?: 'segmented' | 'outline' | 'swatches';
  fullWidth?: boolean;
  className?: string;
}

export function ToggleGroup<Value extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  orientation = 'horizontal',
  appearance = 'segmented',
  fullWidth = false,
  className = '',
}: ToggleGroupProps<Value>): ReactElement {
  const swatches = appearance === 'swatches';
  const groupClass = swatches
    ? `wm-toggle-group${orientation === 'vertical' ? ' wm-toggle-group-vertical' : ''}${fullWidth ? ' wm-toggle-group-full' : ''}`
    : appearance === 'outline'
      ? 'wm-staged-toggle-outline'
      : 'btn-group';
  return (
    <div
      className={`${groupClass}${!swatches && orientation === 'vertical' ? ' wm-staged-toggle-vertical' : ''}${!swatches && fullWidth ? ' wm-staged-toggle-full' : ''} ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={
            swatches
              ? `wm-toggle-group-btn${value === option.value ? ' wm-toggle-group-btn-active' : ''}`
              : `btn btn-sm ${appearance === 'outline' ? 'btn-secondary-neutral wm-staged-toggle-option' : value === option.value ? 'btn-primary-neutral' : 'btn-secondary-neutral'}`
          }
          aria-pressed={value === option.value}
          disabled={disabled || option.disabled}
          title={option.title}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.swatchColor && (
            <span
              className="wm-toggle-group-swatch wm-staged-swatch"
              style={{ background: option.swatchColor }}
              aria-hidden="true"
            />
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
