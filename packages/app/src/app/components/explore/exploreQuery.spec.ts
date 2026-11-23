import { parseExploreQuery, serializeExploreQuery } from './exploreQuery';
import type { QueryOptions } from './exploreTypes';

const options: QueryOptions = {
  categoryOptions: ['all', 'A', 'B'],
  authorOptions: ['all', 'One', 'Two'],
  rulesetOptions: ['standard', 'custom'],
  tagOptions: ['all', 'red', 'blue'],
};

describe('Explore query parsing', () => {
  test('trims, deduplicates and validates repeated/comma values without changing case', () => {
    const parsed = parseExploreQuery(
      '?q=%20text%20&category=A,B,A&category=%20B%20,missing&author=One,one&ruleset=standard,custom&tag=red,blue&tag=red&source=user&favorites=1&forked=true&view=table&sort=user&direction=asc',
      options,
    );
    expect(parsed).toStrictEqual({
      search: 'text',
      categories: ['A', 'B'],
      authors: ['One'],
      rulesets: ['standard', 'custom'],
      tags: ['red', 'blue'],
      source: 'user',
      favoritesOnly: true,
      forkedOnly: true,
      viewMode: 'table',
      sortField: 'user',
      sortDirection: 'asc',
      groupMode: 'none',
    });
  });

  test('retains legacy all selections and falls back only for invalid options', () => {
    const parsed = parseExploreQuery(
      '?category=all&author=all&tag=all&source=USER&favorites=TRUE&forked=0&sort=invalid&direction=up&view=list&groupBy=invalid&groupByCategory=true',
      options,
    );
    expect(parsed.categories).toStrictEqual(['all']);
    expect(parsed.authors).toStrictEqual(['all']);
    expect(parsed.tags).toStrictEqual(['all']);
    expect(parsed.source).toBe('all');
    expect(parsed.favoritesOnly).toBe(false);
    expect(parsed.forkedOnly).toBe(false);
    expect(parsed.sortField).toBe('favorites');
    expect(parsed.sortDirection).toBe('desc');
    expect(parsed.viewMode).toBe('cards');
    expect(parsed.groupMode).toBe('category');
    expect(parseExploreQuery('?groupBy=none&groupByCategory=1', options).groupMode).toBe('none');
  });

  test('serializes sorted selections, removes owned defaults/legacy fields and preserves repeated unknown parameters', () => {
    const serialized = serializeExploreQuery(
      '?unknown=one&unknown=two&groupByCategory=1&source=user&favorites=1&view=table',
      {
        searchQuery: ' text ',
        selectedCategories: new Set(['B', 'A']),
        selectedAuthors: new Set(['Two', 'One']),
        selectedRulesets: new Set(['standard', 'custom']),
        selectedTags: new Set(['red', 'blue']),
        selectedSource: 'all',
        favoritesOnly: false,
        forkedOnly: true,
        sortField: 'favorites',
        sortDirection: 'desc',
        viewMode: 'cards',
        groupMode: 'author',
      },
    );
    const params = new URLSearchParams(serialized);
    expect(params.getAll('unknown')).toStrictEqual(['one', 'two']);
    expect(params.getAll('category')).toStrictEqual(['A', 'B']);
    expect(params.getAll('author')).toStrictEqual(['One', 'Two']);
    expect(params.getAll('ruleset')).toStrictEqual(['custom', 'standard']);
    expect(params.getAll('tag')).toStrictEqual(['blue', 'red']);
    for (const key of ['sort', 'direction', 'favorites', 'view', 'source', 'groupByCategory'])
      expect(params.has(key)).toBe(false);
    expect(params.get('groupBy')).toBe('author');
    expect(params.get('forked')).toBe('true');
    expect(parseExploreQuery(serialized, options).search).toBe('text');
  });
});
