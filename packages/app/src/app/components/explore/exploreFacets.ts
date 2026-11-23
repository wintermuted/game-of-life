import { getPatternAuthorKey, getPatternRulesetId } from './exploreCatalog';
import { patternMatchesFilters, type FacetKey, type FilterContext } from './exploreFiltering';
import type { ExplorePattern } from './exploreTypes';

export interface ExploreFacet {
  counts: Record<string, number>;
  options: string[];
  disabledOptions: string[];
  hasAvailable: boolean;
}
export type ExploreFacets = Record<FacetKey, ExploreFacet>;

export function getFacetCounts(
  patterns: ExplorePattern[],
  context: FilterContext,
  facet: FacetKey,
): Record<string, number> {
  const base = patterns.filter((pattern) => patternMatchesFilters(pattern, context, facet));
  const counts: Record<string, number> = { all: base.length };
  for (const pattern of base) {
    const keys =
      facet === 'category'
        ? [pattern.category]
        : facet === 'author'
          ? [getPatternAuthorKey(pattern)]
          : facet === 'ruleset'
            ? [getPatternRulesetId(pattern)]
            : context.labels.getPatternTags(pattern);
    for (const key of keys) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function buildFacet(
  values: string[],
  counts: Record<string, number>,
  selected: Set<string>,
  getLabel: (value: string) => string,
): ExploreFacet {
  const options = [...values].sort((left, right) => {
    const countDelta = (counts[right] ?? 0) - (counts[left] ?? 0);
    return countDelta !== 0 ? countDelta : getLabel(left).localeCompare(getLabel(right));
  });
  return {
    counts,
    options,
    disabledOptions: options.filter((value) => (counts[value] ?? 0) === 0 && !selected.has(value)),
    hasAvailable: options.some((value) => (counts[value] ?? 0) > 0),
  };
}

export function getExploreFacets(
  patterns: ExplorePattern[],
  context: FilterContext,
): ExploreFacets {
  const { labels, filters } = context;
  const identity = (value: string): string => value;
  const withoutAll = (values: string[]): string[] => values.filter((value) => value !== 'all');
  return {
    category: buildFacet(
      withoutAll(labels.categoryOptions),
      getFacetCounts(patterns, context, 'category'),
      filters.selectedCategories,
      identity,
    ),
    author: buildFacet(
      withoutAll(labels.authorOptions),
      getFacetCounts(patterns, context, 'author'),
      filters.selectedAuthors,
      labels.getAuthorLabel,
    ),
    ruleset: buildFacet(
      labels.rulesetOptions,
      getFacetCounts(patterns, context, 'ruleset'),
      filters.selectedRulesets,
      labels.getRulesetLabel,
    ),
    tag: buildFacet(
      withoutAll(labels.tagOptions),
      getFacetCounts(patterns, context, 'tag'),
      filters.selectedTags,
      identity,
    ),
  };
}
