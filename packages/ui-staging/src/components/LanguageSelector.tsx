import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';

export interface LanguageOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface LanguageSelectorProps {
  options: readonly LanguageOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  variant?: 'native' | 'dropup';
  className?: string;
}

export function LanguageSelector({
  options,
  value,
  onChange,
  label,
  variant = 'native',
  className = '',
}: LanguageSelectorProps): ReactElement {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  useEffect(() => {
    if (!open) return;
    function outside(event: MouseEvent): void {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', outside);
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
    const index =
      selectedIndex >= 0 ? selectedIndex : options.findIndex((option) => !option.disabled);
    optionRefs.current[index]?.focus();
    return () => document.removeEventListener('mousedown', outside);
  }, [open, options, value]);

  function close(): void {
    setOpen(false);
    trigger.current?.focus();
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      trigger.current?.focus();
      setOpen(false);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const enabled = options
        .map((option, index) => (option.disabled ? -1 : index))
        .filter((index) => index >= 0);
      const current = enabled.findIndex(
        (index) => optionRefs.current[index] === document.activeElement,
      );
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? enabled.length - 1
            : (current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      optionRefs.current[enabled[next]]?.focus();
    }
  }

  if (variant === 'native') {
    return (
      <select
        className={className || 'wm-select'}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <div
      ref={wrapper}
      className={`wm-staged-language ${className}`}
      onKeyDown={navigate}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="wm-staged-language-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-expanded={open}
        disabled={options.every((option) => option.disabled)}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>{options.find((option) => option.value === value)?.label}</span>
        <span aria-hidden="true">&#x25B4;</span>
      </button>
      {open && (
        <div id={listId} className="wm-staged-language-menu" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={value === option.value}
              disabled={option.disabled}
              className={`wm-staged-language-option${value === option.value ? ' is-active' : ''}`}
              onClick={() => {
                onChange(option.value);
                close();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
