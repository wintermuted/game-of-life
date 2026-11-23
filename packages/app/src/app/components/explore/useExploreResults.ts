import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  groupExplorePatterns,
  patternMatchesFilters,
  sortExplorePatterns,
  type PatternGroup,
} from './exploreFiltering';
import { getExploreFacets, type ExploreFacets } from './exploreFacets';
import type { ExplorePattern, MetricsByHash, ExploreQueryValues } from './exploreTypes';
import type { ExploreLabels } from './useExploreLabels';

export interface ExploreResultsState {
  filteredCount: number;
  groupedPatterns: PatternGroup[];
  facets: ExploreFacets;
}

export function useExploreResults(
  browsablePatterns: ExplorePattern[],
  query: ExploreQueryValues,
  labels: ExploreLabels,
  favoriteHashes: Set<string>,
  patternMetrics: MetricsByHash,
): ExploreResultsState {
  const { t } = useTranslation();
  const {
    searchQuery,
    selectedCategories,
    selectedSource,
    selectedAuthors,
    selectedRulesets,
    selectedTags,
    favoritesOnly,
  } = query;
  const filters = useMemo(
    () => ({
      searchQuery,
      selectedCategories,
      selectedSource,
      selectedAuthors,
      selectedRulesets,
      selectedTags,
      favoritesOnly,
    }),
    [
      searchQuery,
      selectedCategories,
      selectedSource,
      selectedAuthors,
      selectedRulesets,
      selectedTags,
      favoritesOnly,
    ],
  );
  const context = useMemo(
    () => ({ filters, labels, favoriteHashes, t }),
    [filters, labels, favoriteHashes, t],
  );
  const filteredPatterns = useMemo(
    () =>
      sortExplorePatterns(
        browsablePatterns.filter((pattern) => patternMatchesFilters(pattern, context)),
        patternMetrics,
        query.sortField,
        query.sortDirection,
        t,
      ),
    [browsablePatterns, context, patternMetrics, query.sortField, query.sortDirection, t],
  );
  const groupedPatterns = useMemo(
    () => groupExplorePatterns(filteredPatterns, query.groupMode, labels, t),
    [filteredPatterns, query.groupMode, labels, t],
  );
  const facets = useMemo(
    () => getExploreFacets(browsablePatterns, context),
    [browsablePatterns, context],
  );
  return { filteredCount: filteredPatterns.length, groupedPatterns, facets };
}
