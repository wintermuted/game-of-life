import type { TFunction } from 'i18next';
import { getPatternAuthorKey, getPatternHash, getPatternRulesetId } from './exploreCatalog';
import type {
  ExplorePattern,
  GroupMode,
  MetricsByHash,
  SortDirection,
  SortField,
  ExploreQueryValues,
} from './exploreTypes';
import type { ExploreLabels } from './useExploreLabels';

export type FacetKey = 'category' | 'author' | 'ruleset' | 'tag';
export type ExploreFilters = Pick<
  ExploreQueryValues,
  | 'searchQuery'
  | 'selectedCategories'
  | 'selectedSource'
  | 'selectedAuthors'
  | 'selectedRulesets'
  | 'selectedTags'
  | 'favoritesOnly'
>;
export interface FilterContext {
  filters: ExploreFilters;
  favoriteHashes: Set<string>;
  labels: ExploreLabels;
  t: TFunction;
}

export function patternMatchesFilters(
  pattern: ExplorePattern,
  context: FilterContext,
  excludedFacet?: FacetKey,
): boolean {
  const { filters, favoriteHashes, labels, t } = context;
  const {
    selectedCategories,
    selectedSource,
    selectedAuthors,
    selectedRulesets,
    selectedTags,
    favoritesOnly,
    searchQuery,
  } = filters;
  if (
    excludedFacet !== 'category' &&
    selectedCategories.size > 0 &&
    !selectedCategories.has(pattern.category)
  )
    return false;
  if (selectedSource !== 'all' && pattern.source !== selectedSource) return false;
  if (
    excludedFacet !== 'author' &&
    selectedAuthors.size > 0 &&
    !selectedAuthors.has(getPatternAuthorKey(pattern))
  )
    return false;
  if (
    excludedFacet !== 'ruleset' &&
    selectedRulesets.size > 0 &&
    !selectedRulesets.has(getPatternRulesetId(pattern))
  )
    return false;
  if (
    excludedFacet !== 'tag' &&
    selectedTags.size > 0 &&
    !labels.getPatternTags(pattern).some((tag) => selectedTags.has(tag))
  )
    return false;
  if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) return false;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) return true;
  const searchableValues = [
    pattern.name,
    pattern.category,
    labels.getRulesetLabel(getPatternRulesetId(pattern)),
    pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user'),
    pattern.visibility === 'private'
      ? t('playground.visibilityPrivate')
      : t('playground.visibilityPublic'),
    ...(pattern.tags ?? []),
  ];
  return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function sortExplorePatterns(
  filtered: ExplorePattern[],
  patternMetrics: MetricsByHash,
  sortField: SortField,
  sortDirection: SortDirection,
  t: TFunction,
): ExplorePattern[] {
  return [...filtered].sort((leftPattern, rightPattern) => {
    const leftMetrics = patternMetrics[getPatternHash(leftPattern.grid)] ?? {
      favorites: 0,
      forks: 0,
    };
    const rightMetrics = patternMetrics[getPatternHash(rightPattern.grid)] ?? {
      favorites: 0,
      forks: 0,
    };
    let baseDelta: number;
    if (sortField === 'favorites') baseDelta = leftMetrics.favorites - rightMetrics.favorites;
    else if (sortField === 'forks') baseDelta = leftMetrics.forks - rightMetrics.forks;
    else if (sortField === 'name') baseDelta = leftPattern.name.localeCompare(rightPattern.name);
    else if (sortField === 'category')
      baseDelta = leftPattern.category.localeCompare(rightPattern.category);
    else {
      const leftUser =
        leftPattern.source === 'user' ? (leftPattern.creatorName ?? '') : t('patternSource.system');
      const rightUser =
        rightPattern.source === 'user'
          ? (rightPattern.creatorName ?? '')
          : t('patternSource.system');
      baseDelta = leftUser.localeCompare(rightUser);
    }
    if (baseDelta !== 0) return sortDirection === 'asc' ? baseDelta : -baseDelta;
    return leftPattern.name.localeCompare(rightPattern.name);
  });
}

export type PatternGroup = [string, ExplorePattern[]];

export function groupExplorePatterns(
  filteredPatterns: ExplorePattern[],
  groupMode: GroupMode,
  labels: ExploreLabels,
  t: TFunction,
): PatternGroup[] {
  if (filteredPatterns.length === 0) return [];
  if (groupMode === 'none') return [[t('explore.allPatternsGroupLabel'), filteredPatterns]];
  const grouped = new Map<string, ExplorePattern[]>();
  for (const pattern of filteredPatterns) {
    const groupLabel =
      groupMode === 'category'
        ? pattern.category
        : groupMode === 'ruleset'
          ? labels.getRulesetLabel(getPatternRulesetId(pattern))
          : labels.getAuthorLabel(getPatternAuthorKey(pattern));
    const current = grouped.get(groupLabel) ?? [];
    current.push(pattern);
    grouped.set(groupLabel, current);
  }
  return Array.from(grouped.entries());
}
