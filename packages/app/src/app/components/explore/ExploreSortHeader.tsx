import { ArrowDown, ArrowDownUp, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SortableTableHeader } from '@wintermuted/ui-react';
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
  const Icon = field === sortField ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowDownUp;
  return (
    <SortableTableHeader
      column={field}
      label={label}
      active={field === sortField}
      direction={sortDirection}
      onSort={onSort}
      onDirection={onDirection}
      directionLabel={`${t('explore.sortDirectionLabel')} - ${label}`}
      directionIcon={<Icon size={12} aria-hidden="true" />}
    />
  );
}
