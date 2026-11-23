import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SortField, SortDirection } from './exploreTypes';

interface SortHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDirection: (field: SortField) => void;
}

export function ExploreSortHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
  onDirection,
}: SortHeaderProps): React.JSX.Element {
  const { t } = useTranslation();
  const active = field === sortField;
  return (
    <div className="explore-table-sort-head">
      <button
        type="button"
        className={`explore-table-sort-btn${active ? ' is-active' : ''}`}
        onClick={() => onSort(field)}
      >
        <span>{label}</span>
      </button>
      <button
        type="button"
        className={`explore-table-sort-dir-btn${active ? ' is-active' : ''}`}
        aria-label={`${t('explore.sortDirectionLabel')} - ${label}`}
        onClick={() => onDirection(field)}
      >
        {active ? (
          sortDirection === 'asc' ? (
            <ArrowUp size={12} aria-hidden="true" />
          ) : (
            <ArrowDown size={12} aria-hidden="true" />
          )
        ) : (
          <ArrowDownUp size={12} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
