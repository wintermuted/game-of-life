import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_GROUP_MODE,
  type GroupMode,
  type QueryOptions,
  type SortField,
  type SortDirection,
  type Source,
  type ViewMode,
  type ExploreQueryValues,
} from './exploreTypes';
import { parseExploreQuery, serializeExploreQuery, setsMatch } from './exploreQuery';
export interface ExploreQueryState extends ExploreQueryValues {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCategories: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedSource: React.Dispatch<React.SetStateAction<Source>>;
  setSelectedAuthors: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedRulesets: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  setFavoritesOnly: React.Dispatch<React.SetStateAction<boolean>>;
  setForkedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  setGroupMode: React.Dispatch<React.SetStateAction<GroupMode>>;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

export function useExploreQueryState(options: QueryOptions): ExploreQueryState & {
  handleTableSort: (field: SortField) => void;
  handleTableSortDirection: (field: SortField) => void;
  clearFilters: (resetPresentation?: boolean) => void;
} {
  const location = useLocation();
  const navigate = useNavigate();
  const isApplyingQueryState = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<'all' | 'system' | 'user'>('all');
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [selectedRulesets, setSelectedRulesets] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [forkedOnly, setForkedOnly] = useState(false);
  const [sortField, setSortField] = useState<'favorites' | 'forks' | 'name' | 'user' | 'category'>(
    'favorites',
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>(DEFAULT_GROUP_MODE);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { categoryOptions, authorOptions, rulesetOptions, tagOptions } = options;
  const parsedQueryState = useMemo(
    () =>
      parseExploreQuery(location.search, {
        categoryOptions,
        authorOptions,
        rulesetOptions,
        tagOptions,
      }),
    [authorOptions, categoryOptions, location.search, rulesetOptions, tagOptions],
  );
  const state = useMemo(
    () => ({
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
      setSearchQuery,
      setSelectedCategories,
      setSelectedSource,
      setSelectedAuthors,
      setSelectedRulesets,
      setSelectedTags,
      setFavoritesOnly,
      setForkedOnly,
      setSortField,
      setSortDirection,
      setGroupMode,
      setViewMode,
    }),
    [
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
    ],
  );
  useEffect(() => {
    isApplyingQueryState.current = true;

    setSearchQuery(parsedQueryState.search);
    setSelectedCategories((current) =>
      setsMatch(current, parsedQueryState.categories)
        ? current
        : new Set(parsedQueryState.categories),
    );
    setSelectedSource(parsedQueryState.source);
    setSelectedAuthors((current) =>
      setsMatch(current, parsedQueryState.authors) ? current : new Set(parsedQueryState.authors),
    );
    setSelectedRulesets((current) =>
      setsMatch(current, parsedQueryState.rulesets) ? current : new Set(parsedQueryState.rulesets),
    );
    setSelectedTags((current) =>
      setsMatch(current, parsedQueryState.tags) ? current : new Set(parsedQueryState.tags),
    );
    setFavoritesOnly(parsedQueryState.favoritesOnly);
    setForkedOnly(parsedQueryState.forkedOnly);
    setSortField(parsedQueryState.sortField);
    setSortDirection(parsedQueryState.sortDirection);
    setGroupMode(parsedQueryState.groupMode);
    setViewMode(parsedQueryState.viewMode);
  }, [parsedQueryState]);

  useEffect(() => {
    if (isApplyingQueryState.current) {
      const queryMatchesState =
        searchQuery === parsedQueryState.search &&
        setsMatch(selectedCategories, parsedQueryState.categories) &&
        selectedSource === parsedQueryState.source &&
        setsMatch(selectedAuthors, parsedQueryState.authors) &&
        setsMatch(selectedRulesets, parsedQueryState.rulesets) &&
        setsMatch(selectedTags, parsedQueryState.tags) &&
        favoritesOnly === parsedQueryState.favoritesOnly &&
        forkedOnly === parsedQueryState.forkedOnly &&
        sortField === parsedQueryState.sortField &&
        sortDirection === parsedQueryState.sortDirection &&
        groupMode === parsedQueryState.groupMode &&
        viewMode === parsedQueryState.viewMode;

      if (queryMatchesState) {
        isApplyingQueryState.current = false;
      }

      return;
    }

    const nextSearch = serializeExploreQuery(location.search, state);
    const currentSearch = location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search;
    if (nextSearch === currentSearch) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true },
    );
  }, [
    favoritesOnly,
    forkedOnly,
    groupMode,
    location.pathname,
    location.search,
    navigate,
    parsedQueryState,
    searchQuery,
    selectedAuthors,
    selectedCategories,
    selectedRulesets,
    selectedSource,
    selectedTags,
    sortDirection,
    sortField,
    viewMode,
    state,
  ]);

  function handleTableSort(nextField: 'name' | 'user' | 'category' | 'forks' | 'favorites'): void {
    if (sortField === nextField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(nextField);
    setSortDirection('asc');
  }

  function handleTableSortDirection(
    nextField: 'name' | 'user' | 'category' | 'forks' | 'favorites',
  ): void {
    if (sortField === nextField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(nextField);
    setSortDirection('desc');
  }

  function clearFilters(resetPresentation = false): void {
    setSearchQuery('');
    setSelectedCategories(new Set());
    setSelectedSource('all');
    setSelectedAuthors(new Set());
    setSelectedRulesets(new Set());
    setSelectedTags(new Set());
    setFavoritesOnly(false);
    setForkedOnly(false);
    if (resetPresentation) {
      setSortField('favorites');
      setSortDirection('desc');
      setGroupMode(DEFAULT_GROUP_MODE);
    }
  }
  return { ...state, handleTableSort, handleTableSortDirection, clearFilters };
}
