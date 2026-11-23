import { useTranslation } from 'react-i18next';
import { useExploreCatalog } from './explore/useExploreCatalog';
import { useExploreLabels } from './explore/useExploreLabels';
import { useExploreQueryState } from './explore/useExploreQueryState';
import { useExploreResults } from './explore/useExploreResults';
import { useExploreActions } from './explore/useExploreActions';
import { ExploreFilters } from './explore/ExploreFilters';
import { ExploreToolbar } from './explore/ExploreToolbar';
import { ExploreResults } from './explore/ExploreResults';
import { ExploreToast } from './explore/ExploreToast';

function Explore(): React.JSX.Element {
  const { t } = useTranslation();
  const catalog = useExploreCatalog();
  const labels = useExploreLabels(catalog.allPatterns);
  const query = useExploreQueryState(labels);
  const browsablePatterns = query.forkedOnly ? catalog.forkedPatterns : catalog.allPatterns;
  const results = useExploreResults(
    browsablePatterns,
    query,
    labels,
    catalog.favoriteHashes,
    catalog.patternMetrics,
  );
  const actions = useExploreActions(catalog);

  return (
    <div className="profile-layout explore-page-layout">
      <header className="profile-header">
        <div>
          <h1 className="profile-title explore-page-title">{t('explore.title')}</h1>
          <p className="profile-subtitle explore-page-subtitle">{t('explore.subtitle')}</p>
        </div>
      </header>
      <div className="explore-layout">
        <ExploreFilters
          query={query}
          facets={results.facets}
          labels={labels}
          filteredCount={results.filteredCount}
          onClear={() => query.clearFilters(true)}
        />
        <div className="explore-results-column">
          <ExploreToolbar {...query} />
          <ExploreResults
            groupedPatterns={results.groupedPatterns}
            groupMode={query.groupMode}
            viewMode={query.viewMode}
            sortField={query.sortField}
            sortDirection={query.sortDirection}
            handleTableSort={query.handleTableSort}
            handleTableSortDirection={query.handleTableSortDirection}
            favoriteHashes={catalog.favoriteHashes}
            patternMetrics={catalog.patternMetrics}
            labels={labels}
            filters={query}
            actions={actions}
            onClear={() => query.clearFilters()}
          />
        </div>
      </div>
      <ExploreToast {...actions} />
    </div>
  );
}

export default Explore;
