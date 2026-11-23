import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExploreFacetFilter } from './ExploreFacetFilter';
import type { ExploreFacets } from './exploreFacets';
import type { ExploreLabels } from './useExploreLabels';
import type { ExploreQueryState } from './useExploreQueryState';

interface ExploreFiltersProps {
  query: Pick<
    ExploreQueryState,
    | 'searchQuery'
    | 'setSearchQuery'
    | 'selectedCategories'
    | 'setSelectedCategories'
    | 'selectedRulesets'
    | 'setSelectedRulesets'
    | 'selectedTags'
    | 'setSelectedTags'
    | 'selectedAuthors'
    | 'setSelectedAuthors'
  >;
  facets: ExploreFacets;
  labels: Pick<ExploreLabels, 'getRulesetLabel' | 'getAuthorLabel'>;
  filteredCount: number;
  onClear: () => void;
}
const identity = (value: string): string => value;

export function ExploreFilters({
  query,
  facets,
  labels,
  filteredCount,
  onClear,
}: ExploreFiltersProps): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <aside className="explore-sidebar">
      <section className="explore-filters-card">
        <div className="explore-filters-row">
          <div className="explore-search-section">
            <div className="explore-search-input-wrap">
              <Search size={14} className="explore-search-input-icon" aria-hidden="true" />
              <input
                className="wm-input explore-search-input"
                type="search"
                value={query.searchQuery}
                onChange={(event) => query.setSearchQuery(event.target.value)}
                placeholder={t('explore.searchPlaceholder')}
                aria-label={t('explore.searchPlaceholder')}
              />
            </div>
          </div>
          <div className="explore-filters-meta-row">
            <p className="profile-persistence-note">
              {t('explore.resultsCount', { count: filteredCount })}
            </p>
            <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={onClear}>
              {t('explore.clearFilters')}
            </button>
          </div>
          <ExploreFacetFilter
            label={t('explore.categoryFilterLabel')}
            allLabel={t('explore.categoryAll')}
            facet={facets.category}
            selected={query.selectedCategories}
            setSelected={query.setSelectedCategories}
            getLabel={identity}
          />
          <ExploreFacetFilter
            label={t('explore.rulesetFilterLabel')}
            allLabel={t('explore.rulesetAll')}
            facet={facets.ruleset}
            selected={query.selectedRulesets}
            setSelected={query.setSelectedRulesets}
            getLabel={labels.getRulesetLabel}
          />
          <ExploreFacetFilter
            label={t('explore.tagFilterLabel')}
            allLabel={t('explore.tagAll')}
            facet={facets.tag}
            selected={query.selectedTags}
            setSelected={query.setSelectedTags}
            getLabel={identity}
          />
          <ExploreFacetFilter
            label={t('explore.authorFilterLabel')}
            allLabel={t('explore.authorAll')}
            facet={facets.author}
            selected={query.selectedAuthors}
            setSelected={query.setSelectedAuthors}
            getLabel={labels.getAuthorLabel}
          />
        </div>
      </section>
    </aside>
  );
}
