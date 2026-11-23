import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExplorePatternCard } from './ExplorePatternCard';
import { ExplorePatternTable, type TableSortProps } from './ExplorePatternTable';
import type { PatternGroup } from './exploreFiltering';
import type { GroupMode, ViewMode } from './exploreTypes';
import type { PatternViewProps } from './exploreViewTypes';

interface ExploreResultsProps extends PatternViewProps, TableSortProps {
  groupedPatterns: PatternGroup[];
  groupMode: GroupMode;
  viewMode: ViewMode;
  onClear: () => void;
}

export function ExploreResults({
  groupedPatterns,
  groupMode,
  viewMode,
  onClear,
  ...patternProps
}: ExploreResultsProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <>
      {groupedPatterns.length === 0 ? (
        <div className="explore-empty-state">
          <Search size={24} aria-hidden="true" />
          <div>
            <h2>{t('explore.noResultsTitle')}</h2>
            <p>{t('explore.noResults')}</p>
          </div>
          <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={onClear}>
            {t('explore.clearFilters')}
          </button>
        </div>
      ) : null}
      {groupedPatterns.map(([category, categoryPatterns]) => (
        <section
          key={category}
          className={`profile-gallery-section${viewMode === 'cards' ? ' explore-gallery-section-cards' : ''}`}
        >
          <div className="profile-section-heading-row">
            <h2>{category}</h2>
            <span className="wm-badge wm-badge-neutral">{categoryPatterns.length}</span>
          </div>
          {viewMode === 'cards' ? (
            <div className="explore-patterns-grid">
              {categoryPatterns.map((pattern) => (
                <ExplorePatternCard
                  key={`${pattern.category}-${pattern.name}`}
                  pattern={pattern}
                  {...patternProps}
                />
              ))}
            </div>
          ) : (
            <ExplorePatternTable
              patterns={categoryPatterns}
              groupMode={groupMode}
              {...patternProps}
            />
          )}
        </section>
      ))}
    </>
  );
}
