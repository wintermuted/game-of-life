import type { ReactElement, ReactNode } from 'react';
import { Search } from 'lucide-react';

export interface CatalogEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onReset: () => void;
  icon?: ReactNode;
}

export function CatalogEmptyState({
  title,
  description,
  actionLabel,
  onReset,
  icon = <Search size={24} aria-hidden="true" />,
}: CatalogEmptyStateProps): ReactElement {
  return (
    <div className="explore-empty-state">
      {icon}
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={onReset}>
        {actionLabel}
      </button>
    </div>
  );
}
