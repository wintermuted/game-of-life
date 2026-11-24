import type { ReactElement, ReactNode } from 'react';

export interface RankedBarItem {
  id: string;
  label: ReactNode;
  value: number;
  valueLabel: ReactNode;
  color?: string;
}

export interface RankedBarListProps {
  items: readonly RankedBarItem[];
  label: string;
  heading?: ReactNode;
  empty: ReactNode;
  maximum: number;
  minimumWidthPercent?: number;
}

export function RankedBarList({
  items,
  label,
  heading,
  empty,
  maximum,
  minimumWidthPercent = 0,
}: RankedBarListProps): ReactElement {
  if (
    !Number.isFinite(maximum) ||
    maximum < 0 ||
    !Number.isFinite(minimumWidthPercent) ||
    minimumWidthPercent < 0 ||
    minimumWidthPercent > 100
  ) {
    throw new RangeError(
      'RankedBarList requires a nonnegative finite maximum and a minimum width between 0 and 100.',
    );
  }
  if (items.some((item) => !Number.isFinite(item.value) || item.value < 0)) {
    throw new RangeError('RankedBarList values must be finite and nonnegative.');
  }
  return (
    <div className="wm-staged-ranked-list" role="list" aria-label={label}>
      {heading && <p className="wm-staged-ranked-heading">{heading}</p>}
      {items.length === 0 ? (
        <p className="wm-staged-ranked-empty">{empty}</p>
      ) : (
        items.map((item) => (
          <div className="wm-staged-ranked-item" role="listitem" key={item.id}>
            <div className="wm-staged-ranked-item-header">
              {item.color && (
                <span
                  className="wm-staged-ranked-chip"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
              )}
              <span className="wm-staged-ranked-label">{item.label}</span>
              <span className="wm-staged-ranked-count">{item.valueLabel}</span>
            </div>
            <div className="wm-staged-ranked-track" aria-hidden="true">
              <div
                className="wm-staged-ranked-fill"
                style={{
                  width: `${maximum > 0 ? Math.min(100, Math.max(minimumWidthPercent, (item.value / maximum) * 100)) : 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
