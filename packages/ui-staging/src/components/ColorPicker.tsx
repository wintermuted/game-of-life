import { useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { normalizeHex } from './colorValue';

export interface ColorChoice {
  value: string;
  label: string;
}

export interface ColorGroup {
  id: string;
  label: string;
  choices: readonly ColorChoice[];
}

export interface ColorPickerProps {
  value: string;
  groups: readonly ColorGroup[];
  onSelect: (value: string, group: string, index: number) => void;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  label: string;
  inputLabel: string;
  hexLabel: string;
  invalidLabel: string;
  inputId?: string;
  draftValue?: string;
  onDraftChange?: (value: string) => void;
  disabled?: boolean;
  placement?: 'above' | 'right';
  className?: string;
  triggerClassName?: string;
}

export function ColorPicker({
  value,
  groups,
  onSelect,
  onChange,
  onCommit,
  label,
  inputLabel,
  hexLabel,
  invalidLabel,
  disabled = false,
  placement = 'above',
  className = '',
  triggerClassName = '',
  inputId,
  draftValue,
  onDraftChange,
}: ColorPickerProps): ReactElement {
  const [internalDraft, setInternalDraft] = useState(value);
  const controlledDraft = draftValue !== undefined;
  const draft = draftValue ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const skipBlurCommit = useRef(false);
  useEffect(() => {
    if (!controlledDraft) setInternalDraft(value);
    setInvalid(false);
  }, [value, controlledDraft]);
  if (controlledDraft !== (onDraftChange !== undefined)) {
    throw new Error('ColorPicker draftValue and onDraftChange must be supplied together.');
  }
  useEffect(() => {
    if (!open) return;
    function dismiss(event: MouseEvent): void {
      if (event.target instanceof Node && !details.current?.contains(event.target)) {
        if (details.current) details.current.open = false;
      }
    }
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, [open]);
  function close(): void {
    if (details.current) details.current.open = false;
    trigger.current?.focus();
  }
  function commit(): string | null {
    const normalized = normalizeHex(draft);
    setInvalid(normalized === null);
    if (normalized) {
      setDraft(normalized);
      onChange(normalized);
    }
    return normalized;
  }
  return (
    <details
      ref={details}
      className={`wm-staged-color-picker wm-staged-color-picker-${placement} ${className}`}
      aria-label={label}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
    >
      <summary
        ref={trigger}
        className={`wm-staged-color-picker-trigger ${triggerClassName}`}
        aria-label={label}
      >
        <span
          className="wm-staged-color-picker-dot"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
      </summary>
      <div className="wm-staged-color-picker-panel">
        <p className="wm-staged-color-picker-title">{label}</p>
        {groups.map((group) => (
          <div key={group.id}>
            <p className="wm-staged-color-group-label">{group.label}</p>
            <div className="wm-staged-color-swatch-grid" role="group" aria-label={group.label}>
              {group.choices.map((choice, index) => (
                <button
                  key={`${choice.value}-${index}`}
                  type="button"
                  className={`wm-staged-color-swatch${value.toLowerCase() === choice.value.toLowerCase() ? ' wm-staged-color-swatch-active' : ''}`}
                  style={{ backgroundColor: choice.value }}
                  aria-label={choice.label}
                  aria-pressed={value.toLowerCase() === choice.value.toLowerCase()}
                  title={choice.value}
                  disabled={disabled}
                  onClick={() => {
                    setDraft(choice.value);
                    setInvalid(false);
                    onSelect(choice.value, group.id, index);
                    close();
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="wm-staged-custom-color-row">
          <label className="wm-staged-custom-color-label" htmlFor={id}>
            {inputLabel}
          </label>
          <div className="wm-staged-custom-color-inputs">
            <input
              id={id}
              className="wm-staged-color-native-input"
              type="color"
              value={value}
              disabled={disabled}
              aria-label={inputLabel}
              onChange={(event) => {
                setDraft(event.target.value);
                setInvalid(false);
                onChange(event.target.value);
              }}
            />
            <input
              className="wm-staged-color-hex-input"
              type="text"
              value={draft}
              disabled={disabled}
              aria-label={hexLabel}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              onChange={(event) => {
                setDraft(event.target.value);
                setInvalid(false);
              }}
              onBlur={() => {
                if (!skipBlurCommit.current) commit();
                skipBlurCommit.current = false;
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  const color = commit();
                  if (color) {
                    onCommit?.(color);
                    skipBlurCommit.current = true;
                    close();
                  }
                }
              }}
            />
          </div>
          {invalid && (
            <span id={`${id}-error`} className="wm-staged-visually-hidden" role="alert">
              {invalidLabel}
            </span>
          )}
        </div>
      </div>
    </details>
  );
}
