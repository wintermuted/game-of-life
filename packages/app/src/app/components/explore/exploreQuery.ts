import {
  DEFAULT_GROUP_MODE,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_DIRECTION,
  DEFAULT_VIEW_MODE,
  VALID_GROUP_MODES,
  VALID_SORT_FIELDS,
  VALID_SORT_DIRECTIONS,
  VALID_SOURCES,
  VALID_VIEW_MODES,
  type GroupMode,
  type QueryOptions,
  type ExploreQueryValues,
  type Source,
  type SortField,
  type SortDirection,
  type ViewMode,
} from './exploreTypes';
export function readMultiValueParam(params: URLSearchParams, key: string): string[] {
  const values = params.getAll(key).flatMap((value) => value.split(','));
  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);

  return Array.from(new Set(normalized));
}

export function setsMatch(left: Set<string>, rightValues: string[]): boolean {
  if (left.size !== rightValues.length) {
    return false;
  }

  return rightValues.every((value) => left.has(value));
}

export function parseExploreQuery(searchString: string, options: QueryOptions): ParsedExploreQuery {
  const { categoryOptions, authorOptions, rulesetOptions, tagOptions } = options;
  const params = new URLSearchParams(searchString);
  const search = params.get('q')?.trim() ?? '';

  const categories = readMultiValueParam(params, 'category').filter((category) =>
    categoryOptions.includes(category),
  );
  const authors = readMultiValueParam(params, 'author').filter((author) =>
    authorOptions.includes(author),
  );
  const rulesets = readMultiValueParam(params, 'ruleset').filter((ruleset) =>
    rulesetOptions.includes(ruleset),
  );
  const tags = readMultiValueParam(params, 'tag').filter((tag) => tagOptions.includes(tag));

  const sourceParam = params.get('source');
  const source =
    sourceParam && VALID_SOURCES.has(sourceParam)
      ? (sourceParam as 'all' | 'system' | 'user')
      : 'all';

  const sortParam = params.get('sort');
  const sortField =
    sortParam && VALID_SORT_FIELDS.has(sortParam)
      ? (sortParam as 'favorites' | 'forks' | 'name' | 'user' | 'category')
      : DEFAULT_SORT_FIELD;

  const directionParam = params.get('direction');
  const sortDirection =
    directionParam && VALID_SORT_DIRECTIONS.has(directionParam)
      ? (directionParam as 'asc' | 'desc')
      : DEFAULT_SORT_DIRECTION;

  const viewParam = params.get('view');
  const viewMode =
    viewParam && VALID_VIEW_MODES.has(viewParam)
      ? (viewParam as 'cards' | 'table')
      : DEFAULT_VIEW_MODE;

  const favoritesParam = params.get('favorites');
  const favoritesOnly = favoritesParam === '1' || favoritesParam === 'true';
  const forkedParam = params.get('forked');
  const forkedOnly = forkedParam === '1' || forkedParam === 'true';

  const groupParam = params.get('groupBy');
  const legacyGroupParam = params.get('groupByCategory');
  const groupMode =
    groupParam && VALID_GROUP_MODES.has(groupParam as GroupMode)
      ? (groupParam as GroupMode)
      : legacyGroupParam === '1' || legacyGroupParam === 'true'
        ? 'category'
        : DEFAULT_GROUP_MODE;

  return {
    search,
    categories,
    authors,
    rulesets,
    tags,
    source,
    sortField,
    sortDirection,
    viewMode,
    favoritesOnly,
    forkedOnly,
    groupMode,
  };
}
export interface ParsedExploreQuery {
  search: string;
  categories: string[];
  authors: string[];
  rulesets: string[];
  tags: string[];
  source: Source;
  sortField: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  favoritesOnly: boolean;
  forkedOnly: boolean;
  groupMode: GroupMode;
}
export function serializeExploreQuery(searchString: string, state: ExploreQueryValues): string {
  const {
    searchQuery,
    selectedCategories,
    selectedSource,
    selectedAuthors,
    selectedRulesets,
    selectedTags,
    favoritesOnly,
    forkedOnly,
    sortField,
    sortDirection,
    groupMode,
    viewMode,
  } = state;
  const params = new URLSearchParams(searchString);
  params.delete('q');
  params.delete('category');
  params.delete('source');
  params.delete('author');
  params.delete('ruleset');
  params.delete('tag');
  params.delete('favorites');
  params.delete('forked');
  params.delete('sort');
  params.delete('direction');
  params.delete('groupBy');
  params.delete('groupByCategory');
  params.delete('view');

  const normalizedQuery = searchQuery.trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }

  Array.from(selectedCategories)
    .sort((left, right) => left.localeCompare(right))
    .forEach((category) => params.append('category', category));

  if (selectedSource !== 'all') {
    params.set('source', selectedSource);
  }

  Array.from(selectedAuthors)
    .sort((left, right) => left.localeCompare(right))
    .forEach((author) => params.append('author', author));

  Array.from(selectedRulesets)
    .sort((left, right) => left.localeCompare(right))
    .forEach((ruleset) => params.append('ruleset', ruleset));

  Array.from(selectedTags)
    .sort((left, right) => left.localeCompare(right))
    .forEach((tag) => params.append('tag', tag));

  if (favoritesOnly) {
    params.set('favorites', 'true');
  }

  if (forkedOnly) {
    params.set('forked', 'true');
  }

  if (sortField !== DEFAULT_SORT_FIELD) {
    params.set('sort', sortField);
  }

  if (sortDirection !== DEFAULT_SORT_DIRECTION) {
    params.set('direction', sortDirection);
  }

  if (groupMode !== DEFAULT_GROUP_MODE) {
    params.set('groupBy', groupMode);
  }

  if (viewMode !== DEFAULT_VIEW_MODE) {
    params.set('view', viewMode);
  }

  return params.toString();
}
