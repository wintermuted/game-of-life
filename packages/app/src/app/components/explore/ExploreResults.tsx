import { CatalogEmptyState, PatternGallerySection } from '@game-of-life/ui-patterns';
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
        <CatalogEmptyState
          title={t('explore.noResultsTitle')}
          description={t('explore.noResults')}
          actionLabel={t('explore.clearFilters')}
          onReset={onClear}
        />
      ) : null}
      {groupedPatterns.map(([category, categoryPatterns]) => (
        <PatternGallerySection
          key={category}
          title={category}
          count={categoryPatterns.length}
          viewMode={viewMode}
        >
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
        </PatternGallerySection>
      ))}
    </>
  );
}
