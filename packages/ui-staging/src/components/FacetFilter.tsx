import { useState, type ReactElement } from 'react';

export interface FacetOption<Value extends string = string> {
  value: Value;
  label: string;
  count: number;
  disabled?: boolean;
  hidden?: boolean;
}

export interface FacetFilterProps<Value extends string = string> {
  label: string;
  options: readonly FacetOption<Value>[];
  selected: readonly Value[];
  onChange: (selected: Value[]) => void;
  available: boolean;
  emptyLabel: string;
  reset: { label: string; count: number; selected: boolean; onSelect: () => void };
  moreLabel: string;
  fewerLabel: string;
}

export function FacetFilter<Value extends string>({
  label,
  options,
  selected,
  onChange,
  available,
  emptyLabel,
  reset,
  moreLabel,
  fewerLabel,
}: FacetFilterProps<Value>): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = options.filter((option) => option.hidden).length;
  return (
    <details className="wm-staged-facet-section" open>
      <summary className="wm-staged-facet-section-summary">{label}</summary>
      <div className="wm-staged-checkbox-list" role="group" aria-label={label}>
        {!available ? (
          <p className="wm-staged-facet-empty">{emptyLabel}</p>
        ) : (
          <>
            <label className="wm-staged-checkbox-item wm-staged-checkbox-item-with-count">
              <span className="wm-staged-checkbox-item-main">
                <input
                  type="checkbox"
                  checked={reset.selected}
                  onChange={(event) => {
                    if (event.target.checked) reset.onSelect();
                  }}
                />
                <span>{reset.label}</span>
              </span>
              <span className="wm-badge wm-badge-neutral wm-staged-facet-count">{reset.count}</span>
            </label>
            {options
              .filter((option) => expanded || !option.hidden)
              .map((option) => (
                <label
                  key={option.value}
                  className="wm-staged-checkbox-item wm-staged-checkbox-item-with-count"
                >
                  <span className="wm-staged-checkbox-item-main">
                    <input
                      type="checkbox"
                      checked={selected.includes(option.value)}
                      disabled={option.disabled}
                      onChange={(event) =>
                        onChange(
                          event.target.checked
                            ? [...selected, option.value]
                            : selected.filter((value) => value !== option.value),
                        )
                      }
                    />
                    <span>{option.label}</span>
                  </span>
                  <span className="wm-badge wm-badge-neutral wm-staged-facet-count">
                    {option.count}
                  </span>
                </label>
              ))}
            {hiddenCount > 0 && (
              <button
                className="wm-staged-facet-more"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? fewerLabel : moreLabel}
              </button>
            )}
          </>
        )}
      </div>
    </details>
  );
}
