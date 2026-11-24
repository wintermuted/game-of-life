import type { ReactElement, ReactNode } from 'react';

export interface SortableTableHeaderProps<Key extends string = string> {
  column: Key;
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: (column: Key) => void;
  onDirection: (column: Key) => void;
  directionLabel: string;
  directionIcon: ReactNode;
}

export function SortableTableHeader<Key extends string>({
  column,
  label,
  active,
  direction,
  onSort,
  onDirection,
  directionLabel,
  directionIcon,
}: SortableTableHeaderProps<Key>): ReactElement {
  return (
    <th
      scope="col"
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <div className="wm-staged-sort-head">
        <button
          type="button"
          className={`wm-staged-sort-btn${active ? ' is-active' : ''}`}
          onClick={() => onSort(column)}
        >
          {label}
        </button>
        <button
          type="button"
          className={`wm-staged-sort-dir-btn${active ? ' is-active' : ''}`}
          aria-label={directionLabel}
          onClick={() => onDirection(column)}
        >
          {directionIcon}
        </button>
      </div>
    </th>
  );
}
