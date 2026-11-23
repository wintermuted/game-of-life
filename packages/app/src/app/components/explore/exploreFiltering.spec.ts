import i18next from 'i18next';
import { createLifeGrid } from '@game-of-life/core';
import { getPatternHash } from './exploreCatalog';
import { buildFacet, getExploreFacets, getFacetCounts } from './exploreFacets';
import {
  groupExplorePatterns,
  patternMatchesFilters,
  sortExplorePatterns,
  type FilterContext,
} from './exploreFiltering';
import type { ExplorePattern } from './exploreTypes';
import type { ExploreLabels } from './useExploreLabels';

const translator = i18next.createInstance();
beforeAll(async () => {
  await translator.init({
    lng: 'en',
    resources: {
      en: {
        translation: {
          patternSource: { system: 'Sistema', user: 'Usuario' },
          playground: { visibilityPrivate: 'Privado', visibilityPublic: 'Publico' },
          explore: { allPatternsGroupLabel: 'Everything' },
        },
      },
    },
  });
});

function pattern(
  name: string,
  category: string,
  rulesetId: string,
  author: string,
  tags: string[],
  coordinate: string,
): ExplorePattern {
  return {
    name,
    category,
    rulesetId,
    creatorName: author,
    tags,
    source: 'user',
    visibility: 'public',
    favoriteCount: 0,
    forkCount: 0,
    grid: createLifeGrid({ [coordinate]: true }),
  };
}

const catalog: ExplorePattern[] = [
  pattern('Zeta', 'A', 'standard', 'One', ['red', 'shared'], '0,0'),
  pattern('Alpha', 'B', 'standard', 'One', ['blue', 'shared'], '1,0'),
  pattern('Beta', 'A', 'custom', 'Two', ['red'], '2,0'),
  pattern('Gamma', 'B', 'custom', 'Two', ['blue'], '3,0'),
];
const labels: ExploreLabels = {
  categoryOptions: ['all', 'A', 'B'],
  authorOptions: ['all', 'One', 'Two'],
  rulesetOptions: ['standard', 'custom'],
  tagOptions: ['all', 'red', 'blue', 'shared'],
  getPatternTags: (entry: ExplorePattern): string[] => entry.tags ?? [],
  getRulesetLabel: (id: string): string => (id === 'standard' ? 'Traducido' : id),
  getAuthorLabel: (author: string): string => author,
};

function context(overrides: Partial<FilterContext['filters']> = {}): FilterContext {
  return {
    filters: {
      searchQuery: '',
      selectedCategories: new Set(),
      selectedSource: 'all',
      selectedAuthors: new Set(),
      selectedRulesets: new Set(),
      selectedTags: new Set(),
      favoritesOnly: false,
      ...overrides,
    },
    labels,
    favoriteHashes: new Set(),
    t: translator.t,
  };
}

describe('Explore filtering and self-excluding facets', () => {
  test('excludes only the facet being counted and keeps selected zero-count options enabled', () => {
    const state = context({
      selectedCategories: new Set(['A']),
      selectedAuthors: new Set(['One']),
    });
    const facets = getExploreFacets(catalog, state);
    expect(facets.category.counts).toStrictEqual({ all: 2, A: 1, B: 1 });
    expect(facets.author.counts).toStrictEqual({ all: 2, One: 1, Two: 1 });
    expect(facets.ruleset.counts).toStrictEqual({ all: 1, standard: 1 });
    expect(facets.tag.counts).toStrictEqual({ all: 1, red: 1, shared: 1 });
    const facet = buildFacet(
      ['standard', 'custom'],
      { standard: 1, all: 1 },
      new Set(['custom']),
      labels.getRulesetLabel,
    );
    expect(facet.options).toStrictEqual(['standard', 'custom']);
    expect(facet.disabledOptions).toStrictEqual([]);
    expect(facet.hasAvailable).toBe(true);
  });

  test('each facet respects source, translated search and actor-specific favorites', () => {
    const state = context({ searchQuery: ' traducido ', favoritesOnly: true });
    state.favoriteHashes.add(getPatternHash(catalog[1].grid));
    for (const facet of ['category', 'author', 'ruleset', 'tag'] as const) {
      expect(getFacetCounts(catalog, state, facet).all).toBe(1);
    }
    expect(
      catalog.filter((entry) => patternMatchesFilters(entry, state)).map((entry) => entry.name),
    ).toStrictEqual(['Alpha']);
    state.filters.selectedSource = 'system';
    expect(getFacetCounts(catalog, state, 'category').all).toBe(0);
  });

  test('tag selection is OR within the facet, search uses all raw tags and translated visibility/source, not creator names', () => {
    expect(
      catalog.filter((entry) =>
        patternMatchesFilters(entry, context({ selectedTags: new Set(['red', 'blue']) })),
      ),
    ).toHaveLength(4);
    const privateSystem = {
      ...catalog[0],
      source: 'system' as const,
      visibility: 'private' as const,
    };
    expect(patternMatchesFilters(privateSystem, context({ searchQuery: 'sistema' }))).toBe(true);
    expect(patternMatchesFilters(privateSystem, context({ searchQuery: 'privado' }))).toBe(true);
    expect(patternMatchesFilters(catalog[0], context({ searchQuery: 'one' }))).toBe(false);
    expect(patternMatchesFilters(catalog[0], context({ searchQuery: 'shared' }))).toBe(true);
  });

  test('sort ties always use ascending names and grouping follows first appearance without mutating input', () => {
    const originalNames = catalog.map((entry) => entry.name);
    const sorted = sortExplorePatterns(catalog, {}, 'favorites', 'desc', translator.t);
    expect(sorted.map((entry) => entry.name)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Zeta']);
    expect(
      groupExplorePatterns(sorted, 'category', labels, translator.t).map(([label, entries]) => [
        label,
        entries.map((entry) => entry.name),
      ]),
    ).toStrictEqual([
      ['B', ['Alpha', 'Gamma']],
      ['A', ['Beta', 'Zeta']],
    ]);
    expect(
      groupExplorePatterns(sorted, 'ruleset', labels, translator.t).map(([label]) => label),
    ).toStrictEqual(['Traducido', 'custom']);
    expect(
      groupExplorePatterns(sorted, 'author', labels, translator.t).map(([label]) => label),
    ).toStrictEqual(['One', 'Two']);
    expect(groupExplorePatterns([], 'none', labels, translator.t)).toStrictEqual([]);
    expect(groupExplorePatterns(sorted, 'none', labels, translator.t)[0][0]).toBe('Everything');
    expect(catalog.map((entry) => entry.name)).toStrictEqual(originalNames);
  });

  test('numeric metrics determine ranking before name ties and text sorts reverse only nonzero comparisons', () => {
    const metrics = { [getPatternHash(catalog[0].grid)]: { favorites: 7, forks: 4 } };
    expect(sortExplorePatterns(catalog, metrics, 'forks', 'desc', translator.t)[0].name).toBe(
      'Zeta',
    );
    expect(
      sortExplorePatterns(catalog, metrics, 'favorites', 'asc', translator.t).map(
        (entry) => entry.name,
      ),
    ).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Zeta']);
    expect(
      sortExplorePatterns(catalog, {}, 'category', 'desc', translator.t).map((entry) => entry.name),
    ).toStrictEqual(['Alpha', 'Gamma', 'Beta', 'Zeta']);
    expect(
      sortExplorePatterns(catalog, {}, 'user', 'asc', translator.t).map((entry) => entry.name),
    ).toStrictEqual(['Alpha', 'Zeta', 'Beta', 'Gamma']);
  });
});
