import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowDownUp, ArrowUp, ArrowUpAZ, ChevronDown, Cpu, FolderTree, GitFork, LayoutGrid, Play, Rows3, Search, Star, User } from 'lucide-react';
import { createLifeGrid, DEFAULT_RULES, GameRuleKey, GameRules, LifeGrid, patterns, RULESETS } from '@game-of-life/core';
import PatternPreview from './PatternPreview';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';
import { encodeGridToBase64 } from '../util/urlState';
import {
  ensureSeededSocialData,
  getForkOrigins,
  setSavedTemplateNames,
  toggleFavoriteBoard,
  trackRecentBoard,
  upsertSavedBoard,
  upsertForkOrigin,
  getSavedTemplateNames,
  getFavoriteBoards,
  getSavedBoards,
  getStoredProfileUser,
  hashToGrid,
} from '../util/browserStorage';
import { useTranslation } from 'react-i18next';

type ExplorePattern = (typeof patterns)[number] & {
  source: 'system' | 'user';
  creatorName?: string;
  visibility?: 'public' | 'private';
  favoriteCount: number;
  forkCount: number;
  boardId?: string;
};

const seededUserPatterns: ExplorePattern[] = [
  {
    name: 'Signal Weave',
    category: 'User Creations',
    source: 'user',
    creatorName: 'James Nyeholt',
    favoriteCount: 21,
    forkCount: 8,
    grid: createLifeGrid({
      '-2,0': true,
      '-1,0': true,
      '0,0': true,
      '1,1': true,
      '2,2': true,
      '2,-2': true,
      '3,1': true,
      '3,-1': true,
      '4,0': true,
      '5,0': true,
    }),
  },
  {
    name: 'Twin Lantern',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Anika Shah',
    favoriteCount: 16,
    forkCount: 5,
    grid: createLifeGrid({
      '-3,-1': true,
      '-3,0': true,
      '-2,-2': true,
      '-2,1': true,
      '-1,-2': true,
      '-1,1': true,
      '1,-1': true,
      '1,0': true,
      '2,-2': true,
      '2,1': true,
      '3,-2': true,
      '3,1': true,
    }),
  },
  {
    name: 'Orbit Stack',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Leo Martinez',
    favoriteCount: 14,
    forkCount: 4,
    grid: createLifeGrid({
      '-2,-2': true,
      '-2,-1': true,
      '-1,-2': true,
      '-1,-1': true,
      '0,1': true,
      '1,2': true,
      '2,0': true,
      '2,1': true,
      '3,1': true,
      '4,2': true,
      '4,3': true,
      '5,2': true,
    }),
  },
];

const SYSTEM_AUTHOR_KEY = '__system__';
const UNKNOWN_USER_AUTHOR_KEY = '__user__';
const CUSTOM_RULESET_ID = 'custom';
const DEFAULT_SORT_FIELD = 'favorites';
const DEFAULT_SORT_DIRECTION = 'desc';
const DEFAULT_GROUP_MODE = 'none';
const DEFAULT_VIEW_MODE = 'cards';

type GroupMode = 'none' | 'category' | 'ruleset' | 'author';

const VALID_SORT_FIELDS = new Set(['favorites', 'forks', 'name', 'user', 'category']);
const VALID_SORT_DIRECTIONS = new Set(['asc', 'desc']);
const VALID_SOURCES = new Set(['all', 'system', 'user']);
const VALID_VIEW_MODES = new Set(['cards', 'table']);
const VALID_GROUP_MODES = new Set<GroupMode>(['none', 'category', 'ruleset', 'author']);

function readMultiValueParam(params: URLSearchParams, key: string): string[] {
  const values = params.getAll(key).flatMap((value) => value.split(','));
  const normalized = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return Array.from(new Set(normalized));
}

function setsMatch(left: Set<string>, rightValues: string[]): boolean {
  if (left.size !== rightValues.length) {
    return false;
  }

  return rightValues.every((value) => left.has(value));
}

function sortByCountThenLabel<T extends string>(
  values: T[],
  counts: Record<string, number>,
  getLabel: (value: T) => string,
): T[] {
  return [...values].sort((left, right) => {
    const countDelta = (counts[right] ?? 0) - (counts[left] ?? 0);
    if (countDelta !== 0) {
      return countDelta;
    }

    return getLabel(left).localeCompare(getLabel(right));
  });
}

function getCurrentProfileName(): string {
  const normalized = getStoredProfileUser().name?.trim();
  return normalized && normalized.length > 0 ? normalized : 'James Nyeholt';
}

function getFavoriteHashesForActor(actorName: string): Set<string> {
  return new Set(
    getFavoriteBoards()
      .filter((entry) => (entry.actorName ?? '').trim() === actorName)
      .map((entry) => entry.hash),
  );
}

function buildPatternMetrics(patternList: ExplorePattern[]): Record<string, { favorites: number; forks: number }> {
  const favoriteCounts = getFavoriteBoards().reduce<Record<string, number>>((acc, entry) => {
    acc[entry.hash] = (acc[entry.hash] ?? 0) + 1;
    return acc;
  }, {});

  const forkCounts = getForkOrigins().reduce<Record<string, number>>((acc, entry) => {
    acc[entry.parentHash] = (acc[entry.parentHash] ?? 0) + 1;
    return acc;
  }, {});

  const metrics: Record<string, { favorites: number; forks: number }> = {};
  for (const pattern of patternList) {
    const hash = encodeGridToBase64(pattern.grid);
    metrics[hash] = {
      favorites: favoriteCounts[hash] ?? 0,
      forks: forkCounts[hash] ?? 0,
    };
  }

  return metrics;
}

function detectPersistedRuleset(rules?: GameRules): string | undefined {
  if (!rules) return undefined;

  const matchingRuleset = RULESETS.find((ruleset) => {
    if (!ruleset.implemented) return false;

    const togglesMatch = (Object.keys(DEFAULT_RULES) as GameRuleKey[]).every((ruleKey) => {
      const persistedEnabled = rules[ruleKey]?.enabled ?? DEFAULT_RULES[ruleKey].enabled;
      return persistedEnabled === ruleset.rules[ruleKey].enabled;
    });
    const profilesMatch = JSON.stringify(rules.lifeLikeProfile ?? null) === JSON.stringify(ruleset.rules.lifeLikeProfile ?? null);
    return togglesMatch && profilesMatch;
  });

  return matchingRuleset?.id ?? CUSTOM_RULESET_ID;
}

function Explore() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showFavoritesToastLink, setShowFavoritesToastLink] = useState(false);
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isApplyingQueryState = useRef(false);
  const currentProfileName = getCurrentProfileName();
  const [favoriteHashes, setFavoriteHashes] = useState<Set<string>>(() => getFavoriteHashesForActor(currentProfileName));
  const [forkOrigins, setForkOrigins] = useState(() => getForkOrigins());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<'all' | 'system' | 'user'>('all');
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string>>(new Set());
  const [selectedRulesets, setSelectedRulesets] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showDisabledCategories, setShowDisabledCategories] = useState(false);
  const [showDisabledRulesets, setShowDisabledRulesets] = useState(false);
  const [showDisabledTags, setShowDisabledTags] = useState(false);
  const [showDisabledAuthors, setShowDisabledAuthors] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [forkedOnly, setForkedOnly] = useState(false);
  const [sortField, setSortField] = useState<'favorites' | 'forks' | 'name' | 'user' | 'category'>('favorites');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>(DEFAULT_GROUP_MODE);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const allPatterns = useMemo<ExplorePattern[]>(() => {
    const savedMetadataByHash = new Map(getSavedBoards().map((record) => [record.hash, record]));
    const systemPatterns = patterns.map((pattern) => {
      const savedMetadata = savedMetadataByHash.get(encodeGridToBase64(pattern.grid));
      return {
        ...pattern,
        rulesetId: pattern.rulesetId ?? detectPersistedRuleset(savedMetadata?.rules),
        tags: savedMetadata?.tags?.length ? savedMetadata.tags : pattern.tags,
        source: 'system' as const,
        visibility: 'public' as const,
        favoriteCount: Math.max(4, Math.floor(Object.keys(pattern.grid).length / 2) + 6),
        forkCount: Math.max(2, Math.floor(Object.keys(pattern.grid).length / 3) + 3),
      };
    });

    const userPatterns = seededUserPatterns.map((pattern) => {
      const savedMetadata = savedMetadataByHash.get(encodeGridToBase64(pattern.grid));
      return {
        ...pattern,
        rulesetId: detectPersistedRuleset(savedMetadata?.rules) ?? pattern.rulesetId,
        tags: savedMetadata?.tags?.length ? savedMetadata.tags : pattern.tags,
        visibility: savedMetadata?.visibility ?? 'public',
      };
    });

    return [...systemPatterns, ...userPatterns];
  }, []);

  const forkedPatterns = useMemo<ExplorePattern[]>(() => {
    const parentPatternsByHash = new Map(allPatterns.map((pattern) => [encodeGridToBase64(pattern.grid), pattern]));
    const savedBoardsById = new Map(getSavedBoards().map((record) => [record.boardId ?? record.hash, record]));

    return forkOrigins.flatMap((forkOrigin) => {
      const parentPattern = parentPatternsByHash.get(forkOrigin.parentHash);
      if (!parentPattern) return [];

      const savedBoard = savedBoardsById.get(forkOrigin.hash);
      const savedGrid = savedBoard ? hashToGrid(savedBoard.hash) : null;
      return [{
        ...parentPattern,
        name: savedBoard?.title || forkOrigin.forkedPatternTitle || `${forkOrigin.parentTitle} (${t('explore.forkSuffix')})`,
        category: savedBoard?.category || parentPattern.category,
        source: 'user' as const,
        creatorName: forkOrigin.forkerName,
        visibility: savedBoard?.visibility ?? 'public',
        rulesetId: detectPersistedRuleset(savedBoard?.rules) ?? parentPattern.rulesetId,
        tags: savedBoard?.tags?.length ? savedBoard.tags : parentPattern.tags,
        favoriteCount: 0,
        forkCount: 0,
        boardId: forkOrigin.hash,
        grid: savedGrid ?? parentPattern.grid,
      }];
    });
  }, [allPatterns, forkOrigins, t]);

  const browsablePatterns = forkedOnly ? forkedPatterns : allPatterns;

  const [patternMetrics, setPatternMetrics] = useState<Record<string, { favorites: number; forks: number }>>(() => {
    return buildPatternMetrics(allPatterns);
  });

  useEffect(() => {
    const catalog = allPatterns.map((pattern) => ({
      hash: encodeGridToBase64(pattern.grid),
      title: pattern.name,
      source: pattern.source,
      creatorName: pattern.creatorName,
    }));

    ensureSeededSocialData(catalog);
    setFavoriteHashes(getFavoriteHashesForActor(currentProfileName));
    setForkOrigins((current) => {
      const next = getForkOrigins();
      return next.map((entry) => entry.hash).join('|') === current.map((entry) => entry.hash).join('|') ? current : next;
    });
    setPatternMetrics(buildPatternMetrics(allPatterns));
  }, [allPatterns, currentProfileName]);

  const categoryOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(allPatterns.map((pattern) => pattern.category)))];
  }, [allPatterns]);

  const authorOptions = useMemo(() => {
    const uniqueAuthorKeys = new Set<string>();
    for (const pattern of allPatterns) {
      uniqueAuthorKeys.add(getPatternAuthorKey(pattern));
    }

    return ['all', ...Array.from(uniqueAuthorKeys)];
  }, [allPatterns]);

  const rulesetOptions = useMemo(
    () => [...RULESETS.filter((ruleset) => ruleset.implemented).map((ruleset) => ruleset.id), CUSTOM_RULESET_ID],
    [],
  );

  const tagOptions = useMemo(
    () => ['all', ...Array.from(new Set(allPatterns.flatMap((pattern) => getPatternTags(pattern))))],
    [allPatterns, t],
  );

  const parsedQueryState = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('q')?.trim() ?? '';

    const categories = readMultiValueParam(params, 'category').filter((category) => categoryOptions.includes(category));
    const authors = readMultiValueParam(params, 'author').filter((author) => authorOptions.includes(author));
    const rulesets = readMultiValueParam(params, 'ruleset').filter((ruleset) => rulesetOptions.includes(ruleset));
    const tags = readMultiValueParam(params, 'tag').filter((tag) => tagOptions.includes(tag));

    const sourceParam = params.get('source');
    const source = sourceParam && VALID_SOURCES.has(sourceParam) ? (sourceParam as 'all' | 'system' | 'user') : 'all';

    const sortParam = params.get('sort');
    const sortField = sortParam && VALID_SORT_FIELDS.has(sortParam)
      ? (sortParam as 'favorites' | 'forks' | 'name' | 'user' | 'category')
      : DEFAULT_SORT_FIELD;

    const directionParam = params.get('direction');
    const sortDirection = directionParam && VALID_SORT_DIRECTIONS.has(directionParam)
      ? (directionParam as 'asc' | 'desc')
      : DEFAULT_SORT_DIRECTION;

    const viewParam = params.get('view');
    const viewMode = viewParam && VALID_VIEW_MODES.has(viewParam)
      ? (viewParam as 'cards' | 'table')
      : DEFAULT_VIEW_MODE;

    const favoritesParam = params.get('favorites');
    const favoritesOnly = favoritesParam === '1' || favoritesParam === 'true';
    const forkedParam = params.get('forked');
    const forkedOnly = forkedParam === '1' || forkedParam === 'true';

    const groupParam = params.get('groupBy');
    const legacyGroupParam = params.get('groupByCategory');
    const groupMode = groupParam && VALID_GROUP_MODES.has(groupParam as GroupMode)
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
  }, [authorOptions, categoryOptions, location.search, rulesetOptions, tagOptions]);

  useEffect(() => {
    isApplyingQueryState.current = true;

    if (searchQuery !== parsedQueryState.search) {
      setSearchQuery(parsedQueryState.search);
    }

    if (!setsMatch(selectedCategories, parsedQueryState.categories)) {
      setSelectedCategories(new Set(parsedQueryState.categories));
    }

    if (selectedSource !== parsedQueryState.source) {
      setSelectedSource(parsedQueryState.source);
    }

    if (!setsMatch(selectedAuthors, parsedQueryState.authors)) {
      setSelectedAuthors(new Set(parsedQueryState.authors));
    }

    if (!setsMatch(selectedRulesets, parsedQueryState.rulesets)) {
      setSelectedRulesets(new Set(parsedQueryState.rulesets));
    }

    if (!setsMatch(selectedTags, parsedQueryState.tags)) {
      setSelectedTags(new Set(parsedQueryState.tags));
    }

    if (favoritesOnly !== parsedQueryState.favoritesOnly) {
      setFavoritesOnly(parsedQueryState.favoritesOnly);
    }

    if (forkedOnly !== parsedQueryState.forkedOnly) {
      setForkedOnly(parsedQueryState.forkedOnly);
    }

    if (sortField !== parsedQueryState.sortField) {
      setSortField(parsedQueryState.sortField);
    }

    if (sortDirection !== parsedQueryState.sortDirection) {
      setSortDirection(parsedQueryState.sortDirection);
    }

    if (groupMode !== parsedQueryState.groupMode) {
      setGroupMode(parsedQueryState.groupMode);
    }

    if (viewMode !== parsedQueryState.viewMode) {
      setViewMode(parsedQueryState.viewMode);
    }
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

    const params = new URLSearchParams(location.search);
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

    const nextSearch = params.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
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
  ]);

  function patternMatchesSearch(pattern: ExplorePattern, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;

    const sourceLabel = pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user');
    const visibilityLabel = pattern.visibility === 'private'
      ? t('playground.visibilityPrivate')
      : t('playground.visibilityPublic');
    const searchableValues = [
      pattern.name,
      pattern.category,
      getRulesetLabel(getPatternRulesetId(pattern)),
      sourceLabel,
      visibilityLabel,
      ...(pattern.tags ?? []),
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  }

  function patternMatchesSelectedTags(pattern: ExplorePattern): boolean {
    return selectedTags.size === 0 || getPatternTags(pattern).some((tag) => selectedTags.has(tag));
  }

  const filteredPatterns = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = browsablePatterns.filter((pattern) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(pattern.category)) {
        return false;
      }

      if (selectedSource !== 'all' && pattern.source !== selectedSource) {
        return false;
      }

      if (selectedAuthors.size > 0 && !selectedAuthors.has(getPatternAuthorKey(pattern))) {
        return false;
      }

      if (selectedRulesets.size > 0 && !selectedRulesets.has(getPatternRulesetId(pattern))) {
        return false;
      }

      if (!patternMatchesSelectedTags(pattern)) {
        return false;
      }

      if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) {
        return false;
      }

      return patternMatchesSearch(pattern, normalizedQuery);
    });

    return [...filtered].sort((leftPattern, rightPattern) => {
      const leftHash = getPatternHash(leftPattern.grid);
      const rightHash = getPatternHash(rightPattern.grid);
      const leftMetrics = patternMetrics[leftHash] ?? { favorites: 0, forks: 0 };
      const rightMetrics = patternMetrics[rightHash] ?? { favorites: 0, forks: 0 };

      const baseDelta = (() => {
        if (sortField === 'favorites') {
          return leftMetrics.favorites - rightMetrics.favorites;
        }

        if (sortField === 'forks') {
          return leftMetrics.forks - rightMetrics.forks;
        }

        if (sortField === 'name') {
          return leftPattern.name.localeCompare(rightPattern.name);
        }

        if (sortField === 'category') {
          return leftPattern.category.localeCompare(rightPattern.category);
        }

        const leftUser = leftPattern.source === 'user' ? leftPattern.creatorName ?? '' : t('patternSource.system');
        const rightUser = rightPattern.source === 'user' ? rightPattern.creatorName ?? '' : t('patternSource.system');
        return leftUser.localeCompare(rightUser);
      })();

      if (baseDelta !== 0) {
        return sortDirection === 'asc' ? baseDelta : -baseDelta;
      }

      return leftPattern.name.localeCompare(rightPattern.name);
    });
  }, [browsablePatterns, favoriteHashes, favoritesOnly, patternMetrics, searchQuery, selectedAuthors, selectedCategories, selectedRulesets, selectedSource, selectedTags, sortDirection, sortField, t]);

  const categoryCountBase = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return browsablePatterns.filter((pattern) => {
      if (selectedSource !== 'all' && pattern.source !== selectedSource) {
        return false;
      }

      if (selectedAuthors.size > 0 && !selectedAuthors.has(getPatternAuthorKey(pattern))) {
        return false;
      }

      if (selectedRulesets.size > 0 && !selectedRulesets.has(getPatternRulesetId(pattern))) {
        return false;
      }

      if (!patternMatchesSelectedTags(pattern)) return false;

      if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) {
        return false;
      }

      return patternMatchesSearch(pattern, normalizedQuery);
    });
  }, [browsablePatterns, favoriteHashes, favoritesOnly, searchQuery, selectedAuthors, selectedRulesets, selectedSource, selectedTags]);

  const categoryCounts = useMemo(() => {
    const next: Record<string, number> = {
      all: categoryCountBase.length,
    };

    for (const pattern of categoryCountBase) {
      next[pattern.category] = (next[pattern.category] ?? 0) + 1;
    }

    return next;
  }, [categoryCountBase]);

  const authorCountBase = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return browsablePatterns.filter((pattern) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(pattern.category)) {
        return false;
      }

      if (selectedSource !== 'all' && pattern.source !== selectedSource) {
        return false;
      }

      if (selectedRulesets.size > 0 && !selectedRulesets.has(getPatternRulesetId(pattern))) {
        return false;
      }

      if (!patternMatchesSelectedTags(pattern)) return false;

      if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) {
        return false;
      }

      return patternMatchesSearch(pattern, normalizedQuery);
    });
  }, [browsablePatterns, favoriteHashes, favoritesOnly, searchQuery, selectedCategories, selectedRulesets, selectedSource, selectedTags]);

  const authorCounts = useMemo(() => {
    const next: Record<string, number> = {
      all: authorCountBase.length,
    };

    for (const pattern of authorCountBase) {
      const authorKey = getPatternAuthorKey(pattern);
      next[authorKey] = (next[authorKey] ?? 0) + 1;
    }

    return next;
  }, [authorCountBase]);

  const rulesetCountBase = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return browsablePatterns.filter((pattern) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(pattern.category)) return false;
      if (selectedSource !== 'all' && pattern.source !== selectedSource) return false;
      if (selectedAuthors.size > 0 && !selectedAuthors.has(getPatternAuthorKey(pattern))) return false;
      if (!patternMatchesSelectedTags(pattern)) return false;
      if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) return false;
      return patternMatchesSearch(pattern, normalizedQuery);
    });
  }, [browsablePatterns, favoriteHashes, favoritesOnly, searchQuery, selectedAuthors, selectedCategories, selectedSource, selectedTags, t]);

  const rulesetCounts = useMemo(() => {
    const next: Record<string, number> = { all: rulesetCountBase.length };
    for (const pattern of rulesetCountBase) {
      const rulesetId = getPatternRulesetId(pattern);
      next[rulesetId] = (next[rulesetId] ?? 0) + 1;
    }
    return next;
  }, [rulesetCountBase]);

  const tagCountBase = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return browsablePatterns.filter((pattern) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(pattern.category)) return false;
      if (selectedSource !== 'all' && pattern.source !== selectedSource) return false;
      if (selectedAuthors.size > 0 && !selectedAuthors.has(getPatternAuthorKey(pattern))) return false;
      if (selectedRulesets.size > 0 && !selectedRulesets.has(getPatternRulesetId(pattern))) return false;
      if (favoritesOnly && !favoriteHashes.has(getPatternHash(pattern.grid))) return false;
      return patternMatchesSearch(pattern, normalizedQuery);
    });
  }, [browsablePatterns, favoriteHashes, favoritesOnly, searchQuery, selectedAuthors, selectedCategories, selectedRulesets, selectedSource, t]);

  const tagCounts = useMemo(() => {
    const next: Record<string, number> = { all: tagCountBase.length };
    for (const pattern of tagCountBase) {
      for (const tag of getPatternTags(pattern)) {
        next[tag] = (next[tag] ?? 0) + 1;
      }
    }
    return next;
  }, [tagCountBase, t]);

  const sortedCategoryOptions = useMemo(
    () => sortByCountThenLabel(categoryOptions.filter((category) => category !== 'all'), categoryCounts, (category) => category),
    [categoryCounts, categoryOptions],
  );

  const disabledCategoryOptions = sortedCategoryOptions.filter(
    (category) => (categoryCounts[category] ?? 0) === 0 && !selectedCategories.has(category),
  );
  const visibleCategoryOptions = showDisabledCategories
    ? sortedCategoryOptions
    : sortedCategoryOptions.filter((category) => !disabledCategoryOptions.includes(category));

  const sortedAuthorOptions = useMemo(
    () => sortByCountThenLabel(authorOptions.filter((author) => author !== 'all'), authorCounts, (author) => getAuthorLabel(author)),
    [authorCounts, authorOptions, t],
  );

  const sortedRulesetOptions = useMemo(
    () => sortByCountThenLabel(rulesetOptions, rulesetCounts, (ruleset) => getRulesetLabel(ruleset)),
    [rulesetCounts, rulesetOptions, t],
  );

  const sortedTagOptions = useMemo(
    () => sortByCountThenLabel(tagOptions.filter((tag) => tag !== 'all'), tagCounts, (tag) => tag),
    [tagCounts, tagOptions],
  );

  const disabledRulesetOptions = sortedRulesetOptions.filter(
    (rulesetId) => (rulesetCounts[rulesetId] ?? 0) === 0 && !selectedRulesets.has(rulesetId),
  );
  const visibleRulesetOptions = showDisabledRulesets
    ? sortedRulesetOptions
    : sortedRulesetOptions.filter((rulesetId) => !disabledRulesetOptions.includes(rulesetId));
  const disabledTagOptions = sortedTagOptions.filter(
    (tag) => (tagCounts[tag] ?? 0) === 0 && !selectedTags.has(tag),
  );
  const visibleTagOptions = showDisabledTags
    ? sortedTagOptions
    : sortedTagOptions.filter((tag) => !disabledTagOptions.includes(tag));
  const disabledAuthorOptions = sortedAuthorOptions.filter(
    (author) => (authorCounts[author] ?? 0) === 0 && !selectedAuthors.has(author),
  );
  const visibleAuthorOptions = showDisabledAuthors
    ? sortedAuthorOptions
    : sortedAuthorOptions.filter((author) => !disabledAuthorOptions.includes(author));

  const hasAvailableCategories = sortedCategoryOptions.some((category) => (categoryCounts[category] ?? 0) > 0);
  const hasAvailableRulesets = sortedRulesetOptions.some((rulesetId) => (rulesetCounts[rulesetId] ?? 0) > 0);
  const hasAvailableTags = sortedTagOptions.some((tag) => (tagCounts[tag] ?? 0) > 0);
  const hasAvailableAuthors = sortedAuthorOptions.some((author) => (authorCounts[author] ?? 0) > 0);

  const groupedPatterns = useMemo(() => {
    if (filteredPatterns.length === 0) {
      return [];
    }

    if (groupMode === 'none') {
      return [[t('explore.allPatternsGroupLabel'), filteredPatterns]] as const;
    }

    const grouped = new Map<string, ExplorePattern[]>();
    for (const pattern of filteredPatterns) {
      const groupLabel = groupMode === 'category'
        ? pattern.category
        : groupMode === 'ruleset'
          ? getRulesetLabel(getPatternRulesetId(pattern))
          : getAuthorLabel(getPatternAuthorKey(pattern));
      const current = grouped.get(groupLabel) ?? [];
      current.push(pattern);
      grouped.set(groupLabel, current);
    }

    return Array.from(grouped.entries());
  }, [filteredPatterns, groupMode, t]);

  const groupOptions: { value: GroupMode; label: string; icon: typeof FolderTree }[] = [
    { value: 'none', label: t('explore.groupNone'), icon: Rows3 },
    { value: 'category', label: t('explore.groupCategory'), icon: FolderTree },
    { value: 'ruleset', label: t('explore.groupRuleset'), icon: Cpu },
    { value: 'author', label: t('explore.groupAuthor'), icon: User },
  ];
  const selectedGroupOption = groupOptions.find((option) => option.value === groupMode) ?? groupOptions[0];
  const SelectedGroupIcon = selectedGroupOption.icon;

  const sortFieldLabel =
    sortField === 'favorites'
      ? t('explore.sortFavorites')
      : sortField === 'forks'
        ? t('explore.sortForks')
        : sortField === 'name'
          ? t('explore.sortName')
        : sortField === 'category'
          ? t('explore.sortCategory')
          : t('explore.sortUser');

  const SortFieldIcon =
    sortField === 'favorites'
      ? Star
      : sortField === 'forks'
        ? GitFork
        : sortField === 'name'
          ? ArrowUpAZ
          : sortField === 'category'
            ? FolderTree
            : User;

  const sortDirectionLabel = sortDirection === 'desc' ? t('explore.sortDirectionDesc') : t('explore.sortDirectionAsc');
  const SortDirectionIcon = sortDirection === 'desc' ? ArrowDown : ArrowUp;
  const selectedSortLabel = `${sortFieldLabel} (${sortDirectionLabel})`;

  const sortMenuSections = useMemo(() => {
    const fields = [
      { value: 'favorites' as const, label: t('explore.sortFavorites'), icon: Star },
      { value: 'forks' as const, label: t('explore.sortForks'), icon: GitFork },
      { value: 'name' as const, label: t('explore.sortName'), icon: ArrowUpAZ },
      { value: 'category' as const, label: t('explore.sortCategory'), icon: FolderTree },
      { value: 'user' as const, label: t('explore.sortUser'), icon: User },
    ];

    const directions = [
      { value: 'desc' as const, label: t('explore.sortDirectionDesc'), icon: ArrowDown },
      { value: 'asc' as const, label: t('explore.sortDirectionAsc'), icon: ArrowUp },
    ];

    return fields.map((field) => ({
      ...field,
      options: directions.map((direction) => ({
        key: `${field.value}-${direction.value}`,
        field: field.value,
        direction: direction.value,
        label: direction.label,
        icon: direction.icon,
      })),
    }));
  }, [t]);

  const filteredCount = filteredPatterns.length;

  function showToast(message: string, includeFavoritesLink = false): void {
    setToastMessage(message);
    setShowFavoritesToastLink(includeFavoritesLink);
    setToastOpen(true);
  }

  function closeToast(): void {
    setToastOpen(false);
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
  }

  useEffect(() => {
    if (!toastOpen) {
      return;
    }

    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    toastHideTimer.current = setTimeout(() => {
      setToastOpen(false);
    }, 3200);

    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, [toastOpen]);

  function getPatternHash(patternGrid: LifeGrid): string {
    return encodeGridToBase64(patternGrid);
  }

  function getPatternPlayUrl(pattern: ExplorePattern): string {
    const params = new URLSearchParams({ pattern: getPatternHash(pattern.grid) });
    if (pattern.boardId) {
      params.set('board', pattern.boardId);
    } else if (pattern.source === 'system') {
      params.set('catalog', pattern.name);
    }
    if (pattern.rulesetId && RULESETS.some((ruleset) => ruleset.id === pattern.rulesetId && ruleset.implemented)) {
      params.set('ruleset', pattern.rulesetId);
    }
    return `/play?${params.toString()}`;
  }

  function handleTableSort(nextField: 'name' | 'user' | 'category' | 'forks' | 'favorites'): void {
    if (sortField === nextField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(nextField);
    setSortDirection('asc');
  }

  function handleTableSortDirection(nextField: 'name' | 'user' | 'category' | 'forks' | 'favorites'): void {
    if (sortField === nextField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(nextField);
    setSortDirection('desc');
  }

  function getPatternAuthorKey(pattern: ExplorePattern): string {
    if (pattern.source === 'system') {
      return SYSTEM_AUTHOR_KEY;
    }

    const authorName = pattern.creatorName?.trim();
    return authorName && authorName.length > 0 ? authorName : UNKNOWN_USER_AUTHOR_KEY;
  }

  function getAuthorLabel(authorKey: string): string {
    if (authorKey === SYSTEM_AUTHOR_KEY) {
      return t('patternSource.system');
    }

    if (authorKey === UNKNOWN_USER_AUTHOR_KEY) {
      return t('patternSource.user');
    }

    return authorKey;
  }

  function getPatternRulesetId(pattern: ExplorePattern): string {
    if (pattern.rulesetId) return pattern.rulesetId;
    return pattern.source === 'system' ? 'standard' : CUSTOM_RULESET_ID;
  }

  function getRulesetLabel(rulesetId: string): string {
    if (rulesetId === CUSTOM_RULESET_ID) return t('explore.rulesetCustom');
    if (rulesetId === 'standard') return t('diagnostics.rulesetStandardOption');
    if (rulesetId === 'highlife') return t('diagnostics.rulesetHighlifeOption');
    const ruleset = RULESETS.find((candidate) => candidate.id === rulesetId);
    return ruleset ? `${ruleset.name} (${ruleset.classification})` : rulesetId;
  }

  function getPatternTags(pattern: ExplorePattern): string[] {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sourceLabel = pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user');
    const visibilityLabel = pattern.visibility === 'private'
      ? t('playground.visibilityPrivate')
      : t('playground.visibilityPublic');
    const rulesetId = getPatternRulesetId(pattern);
    const excludedValues = new Set([
      pattern.category,
      sourceLabel,
      visibilityLabel,
      pattern.creatorName ?? '',
      rulesetId,
      getRulesetLabel(rulesetId),
    ].map(normalize).filter(Boolean));
    const seenTags = new Set<string>();

    return (pattern.tags ?? []).filter((tag) => {
      const normalizedTag = normalize(tag.trim());
      if (!normalizedTag || excludedValues.has(normalizedTag) || seenTags.has(normalizedTag)) {
        return false;
      }

      seenTags.add(normalizedTag);
      return true;
    }).slice(0, 3);
  }

  function renderSourceBadge(pattern: ExplorePattern) {
    const sourceLabel = pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user');
    const displayLabel = pattern.source === 'user' ? pattern.creatorName ?? sourceLabel : sourceLabel;
    const SourceIcon = pattern.source === 'user' ? User : Cpu;

    return (
      <button
        className="wm-badge wm-badge-neutral explore-filter-badge"
        type="button"
        aria-label={`${t('explore.sourceFilterLabel')}: ${sourceLabel}`}
        onClick={() => setSelectedSource(pattern.source)}
      >
        <span className="pattern-source-badge-content">
          <SourceIcon size={11} aria-hidden="true" />
          <span>{displayLabel}</span>
        </span>
      </button>
    );
  }

  function renderPatternBadges(pattern: ExplorePattern) {
    const tags = getPatternTags(pattern);
    const rulesetId = getPatternRulesetId(pattern);

    return (
      <div className="explore-pattern-detail-rows">
        <div className="explore-pattern-category-row">
          <button
            className="wm-badge wm-badge-neutral explore-filter-badge"
            type="button"
            aria-label={`${t('explore.categoryFilterLabel')}: ${pattern.category}`}
            onClick={() => setSelectedCategories(new Set([pattern.category]))}
          >
            {pattern.category}
          </button>
        </div>
        <div className="explore-pattern-ruleset-row">
          <button
            className="wm-badge wm-badge-neutral explore-pattern-ruleset-badge explore-filter-badge"
            type="button"
            aria-label={`${t('explore.rulesetFilterLabel')}: ${getRulesetLabel(rulesetId)}`}
            onClick={() => setSelectedRulesets(new Set([rulesetId]))}
          >
            {getRulesetLabel(rulesetId)}
          </button>
        </div>
        {tags.length > 0 ? (
          <div className="explore-pattern-tag-row">
            {tags.map((tag) => (
              <button
                key={tag}
                className="wm-badge wm-badge-neutral explore-pattern-tag explore-filter-badge"
                type="button"
                aria-label={`${t('explore.tagFilterLabel')}: ${tag}`}
                onClick={() => setSelectedTags(new Set([tag]))}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  function renderRulesetFilter() {
    return (
      <details className="explore-filter-section" open>
        <summary className="explore-filter-section-summary">{t('explore.rulesetFilterLabel')}</summary>
        <div className="explore-checkbox-list" role="group" aria-label={t('explore.rulesetFilterLabel')}>
          {!hasAvailableRulesets ? <p className="explore-filter-empty-state">{t('explore.noFiltersAvailable')}</p> : null}
          {hasAvailableRulesets ? ['all', ...visibleRulesetOptions].map((rulesetId) => {
            const checked = rulesetId === 'all' ? selectedRulesets.size === 0 : selectedRulesets.has(rulesetId);
            const disabled = rulesetId !== 'all' && (rulesetCounts[rulesetId] ?? 0) === 0 && !checked;

            return (
              <label key={rulesetId} className="explore-checkbox-item explore-checkbox-item-with-count">
                <span className="explore-checkbox-item-main">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => {
                      if (rulesetId === 'all') {
                        if (event.target.checked) setSelectedRulesets(new Set());
                        return;
                      }

                      setSelectedRulesets((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.add(rulesetId);
                        else next.delete(rulesetId);
                        return next;
                      });
                    }}
                  />
                  <span>{rulesetId === 'all' ? t('explore.rulesetAll') : getRulesetLabel(rulesetId)}</span>
                </span>
                <span className="wm-badge wm-badge-neutral explore-filter-option-count">{rulesetCounts[rulesetId] ?? 0}</span>
              </label>
            );
          }) : null}
          {hasAvailableRulesets && disabledRulesetOptions.length > 0 ? (
            <button className="explore-filter-more-btn" type="button" onClick={() => setShowDisabledRulesets((current) => !current)}>
              {showDisabledRulesets
                ? t('explore.showFewerFilterOptions')
                : t('explore.showMoreFilterOptions', { count: disabledRulesetOptions.length })}
            </button>
          ) : null}
        </div>
      </details>
    );
  }

  function renderTagFilter() {
    return (
      <details className="explore-filter-section" open>
        <summary className="explore-filter-section-summary">{t('explore.tagFilterLabel')}</summary>
        <div className="explore-checkbox-list" role="group" aria-label={t('explore.tagFilterLabel')}>
          {!hasAvailableTags ? <p className="explore-filter-empty-state">{t('explore.noFiltersAvailable')}</p> : null}
          {hasAvailableTags ? ['all', ...visibleTagOptions].map((tag) => {
            const checked = tag === 'all' ? selectedTags.size === 0 : selectedTags.has(tag);
            const disabled = tag !== 'all' && (tagCounts[tag] ?? 0) === 0 && !checked;

            return (
              <label key={tag} className="explore-checkbox-item explore-checkbox-item-with-count">
                <span className="explore-checkbox-item-main">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => {
                      if (tag === 'all') {
                        if (event.target.checked) setSelectedTags(new Set());
                        return;
                      }

                      setSelectedTags((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.add(tag);
                        else next.delete(tag);
                        return next;
                      });
                    }}
                  />
                  <span>{tag === 'all' ? t('explore.tagAll') : tag}</span>
                </span>
                <span className="wm-badge wm-badge-neutral explore-filter-option-count">{tagCounts[tag] ?? 0}</span>
              </label>
            );
          }) : null}
          {hasAvailableTags && disabledTagOptions.length > 0 ? (
            <button className="explore-filter-more-btn" type="button" onClick={() => setShowDisabledTags((current) => !current)}>
              {showDisabledTags
                ? t('explore.showFewerFilterOptions')
                : t('explore.showMoreFilterOptions', { count: disabledTagOptions.length })}
            </button>
          ) : null}
        </div>
      </details>
    );
  }

  function handleFork(pattern: ExplorePattern): void {
    const hash = getPatternHash(pattern.grid);
    const forkBoardId = `${hash}-fork-${Date.now().toString(36)}`;
    const patternName = pattern.name;
    const forkTitle = `${patternName} (${t('explore.forkSuffix')})`;
    const currentTemplateNames = getSavedTemplateNames();

    setSavedTemplateNames({
      ...currentTemplateNames,
      [hash]: forkTitle,
    });
    upsertSavedBoard(hash, forkTitle, forkBoardId);
    upsertForkOrigin(forkBoardId, {
      parentHash: hash,
      parentTitle: pattern.name,
      parentSource: pattern.source,
      parentCreatorName: pattern.creatorName,
      forkerName: currentProfileName,
      forkedPatternTitle: forkTitle,
    });
    trackRecentBoard(hash, forkTitle);
    setForkOrigins(getForkOrigins());
    setPatternMetrics(buildPatternMetrics(allPatterns));
    showToast(t('messages.patternForked', { name: patternName }));
  }

  function handleFavorite(patternName: string, patternGrid: LifeGrid): void {
    const hash = getPatternHash(patternGrid);
    const favored = toggleFavoriteBoard(hash, patternName, currentProfileName);
    setFavoriteHashes((current) => {
      const next = new Set(current);
      if (favored) {
        next.add(hash);
      } else {
        next.delete(hash);
      }
      return next;
    });
    setPatternMetrics(buildPatternMetrics(allPatterns));
    if (favored) {
      showToast(t('messages.patternFavorited', { name: patternName }), true);
      return;
    }

    showToast(t('messages.patternUnfavorited', { name: patternName }));
  }

  return (
    <div className="profile-layout explore-page-layout">
      <header className="profile-header">
        <div>
          <h1 className="profile-title explore-page-title">{t('explore.title')}</h1>
          <p className="profile-subtitle explore-page-subtitle">{t('explore.subtitle')}</p>
        </div>
      </header>

      <div className="explore-layout">
        <aside className="explore-sidebar">
          <section className="explore-filters-card">
            <div className="explore-filters-row">
              <div className="explore-search-section">
                <div className="explore-search-input-wrap">
                  <Search size={14} className="explore-search-input-icon" aria-hidden="true" />
                  <input
                    className="wm-input explore-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t('explore.searchPlaceholder')}
                    aria-label={t('explore.searchPlaceholder')}
                  />
                </div>
              </div>

              <div className="explore-filters-meta-row">
                <p className="profile-persistence-note">{t('explore.resultsCount', { count: filteredCount })}</p>
                <button
                  className="btn btn-sm btn-secondary-neutral"
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories(new Set());
                    setSelectedSource('all');
                    setSelectedAuthors(new Set());
                    setSelectedRulesets(new Set());
                    setSelectedTags(new Set());
                    setSortField('favorites');
                    setSortDirection('desc');
                    setGroupMode(DEFAULT_GROUP_MODE);
                    setFavoritesOnly(false);
                    setForkedOnly(false);
                  }}
                >
                  {t('explore.clearFilters')}
                </button>
              </div>

              <details className="explore-filter-section" open>
                <summary className="explore-filter-section-summary">{t('explore.categoryFilterLabel')}</summary>
                <div className="explore-checkbox-list" role="group" aria-label={t('explore.categoryFilterLabel')}>
                  {!hasAvailableCategories ? <p className="explore-filter-empty-state">{t('explore.noFiltersAvailable')}</p> : null}
                  {hasAvailableCategories ? ['all', ...visibleCategoryOptions].map((category) => {
                    const checked = category === 'all' ? selectedCategories.size === 0 : selectedCategories.has(category);
                    const disabled = category !== 'all' && (categoryCounts[category] ?? 0) === 0 && !checked;

                    return (
                      <label key={category} className="explore-checkbox-item explore-checkbox-item-with-count">
                        <span className="explore-checkbox-item-main">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={(event) => {
                              if (category === 'all') {
                                if (event.target.checked) {
                                  setSelectedCategories(new Set());
                                }
                                return;
                              }

                              setSelectedCategories((current) => {
                                const next = new Set(current);
                                if (event.target.checked) {
                                  next.add(category);
                                } else {
                                  next.delete(category);
                                }
                                return next;
                              });
                            }}
                          />
                          <span>{category === 'all' ? t('explore.categoryAll') : category}</span>
                        </span>
                        <span className="wm-badge wm-badge-neutral explore-filter-option-count">{categoryCounts[category] ?? 0}</span>
                      </label>
                    );
                  }) : null}
                  {hasAvailableCategories && disabledCategoryOptions.length > 0 ? (
                    <button
                      className="explore-filter-more-btn"
                      type="button"
                      onClick={() => setShowDisabledCategories((current) => !current)}
                    >
                      {showDisabledCategories
                        ? t('explore.showFewerFilterOptions')
                        : t('explore.showMoreFilterOptions', { count: disabledCategoryOptions.length })}
                    </button>
                  ) : null}
                </div>
              </details>

              {renderRulesetFilter()}

              {renderTagFilter()}

              <details className="explore-filter-section" open>
                <summary className="explore-filter-section-summary">{t('explore.authorFilterLabel')}</summary>
                <div className="explore-checkbox-list" role="group" aria-label={t('explore.authorFilterLabel')}>
                  {!hasAvailableAuthors ? <p className="explore-filter-empty-state">{t('explore.noFiltersAvailable')}</p> : null}
                  {hasAvailableAuthors ? ['all', ...visibleAuthorOptions].map((authorKey) => {
                    const checked = authorKey === 'all' ? selectedAuthors.size === 0 : selectedAuthors.has(authorKey);
                    const disabled = authorKey !== 'all' && (authorCounts[authorKey] ?? 0) === 0 && !checked;

                    return (
                      <label key={authorKey} className="explore-checkbox-item explore-checkbox-item-with-count">
                        <span className="explore-checkbox-item-main">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={(event) => {
                              if (authorKey === 'all') {
                                if (event.target.checked) {
                                  setSelectedAuthors(new Set());
                                }
                                return;
                              }

                              setSelectedAuthors((current) => {
                                const next = new Set(current);
                                if (event.target.checked) {
                                  next.add(authorKey);
                                } else {
                                  next.delete(authorKey);
                                }
                                return next;
                              });
                            }}
                          />
                          <span>{authorKey === 'all' ? t('explore.authorAll') : getAuthorLabel(authorKey)}</span>
                        </span>
                        <span className="wm-badge wm-badge-neutral explore-filter-option-count">{authorCounts[authorKey] ?? 0}</span>
                      </label>
                    );
                  }) : null}
                  {hasAvailableAuthors && disabledAuthorOptions.length > 0 ? (
                    <button className="explore-filter-more-btn" type="button" onClick={() => setShowDisabledAuthors((current) => !current)}>
                      {showDisabledAuthors
                        ? t('explore.showFewerFilterOptions')
                        : t('explore.showMoreFilterOptions', { count: disabledAuthorOptions.length })}
                    </button>
                  ) : null}
                </div>
              </details>

            </div>

          </section>
        </aside>

        <div className="explore-results-column">
          <section className="explore-results-toolbar">
            <div className="explore-results-toolbar-left">
              <div className="explore-view-toggle" role="group" aria-label={t('explore.viewModeLabel')}>
                <button
                  className={`btn btn-sm btn-secondary-neutral explore-view-toggle-btn${viewMode === 'cards' ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => setViewMode('cards')}
                >
                  <LayoutGrid size={12} aria-hidden="true" />
                  <span>{t('explore.viewCards')}</span>
                </button>
                <button
                  className={`btn btn-sm btn-secondary-neutral explore-view-toggle-btn${viewMode === 'table' ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => setViewMode('table')}
                >
                  <Rows3 size={12} aria-hidden="true" />
                  <span>{t('explore.viewTable')}</span>
                </button>
              </div>

              <div className="explore-group-select-wrap">
                <SelectedGroupIcon className="explore-group-select-icon" size={12} aria-hidden="true" />
                <select
                  className="wm-select explore-group-select"
                  aria-label={t('explore.groupByLabel')}
                  value={groupMode}
                  onChange={(event) => setGroupMode(event.target.value as GroupMode)}
                >
                  {groupOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <button
                className={`btn btn-sm btn-secondary-neutral explore-boolean-toggle${favoritesOnly ? ' is-active' : ''}`}
                type="button"
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly((current) => !current)}
              >
                <Star size={12} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
                <span>{t('explore.favoritesOnly')}</span>
              </button>

              <button
                className={`btn btn-sm btn-secondary-neutral explore-boolean-toggle${forkedOnly ? ' is-active' : ''}`}
                type="button"
                aria-pressed={forkedOnly}
                onClick={() => setForkedOnly((current) => !current)}
              >
                <GitFork size={12} aria-hidden="true" />
                <span>{t('explore.forkedOnly')}</span>
              </button>
            </div>

            <div className="explore-results-toolbar-right">
              <details className="header-user-menu explore-sort-menu">
                <summary className="header-user-menu-trigger explore-sort-menu-trigger" aria-label={t('explore.sortLabel')}>
                  <span className="explore-sort-menu-selected">
                    <SortFieldIcon size={12} aria-hidden="true" />
                    <SortDirectionIcon size={12} aria-hidden="true" />
                    <span className="explore-sort-menu-value">{selectedSortLabel}</span>
                  </span>
                  <ChevronDown size={14} aria-hidden="true" />
                </summary>
                <div className="header-user-menu-panel explore-sort-menu-panel" role="menu" aria-label={t('explore.sortLabel')}>
                  {sortMenuSections.map((section) => (
                    <div key={section.value} className="explore-sort-menu-group" role="none">
                      <div className="explore-sort-menu-heading" role="presentation">
                        <section.icon size={12} aria-hidden="true" />
                        <span>{section.label}</span>
                      </div>

                      {section.options.map((option) => {
                        const active = option.field === sortField && option.direction === sortDirection;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`header-user-menu-item explore-sort-menu-item${active ? ' is-active' : ''}`}
                            onClick={(event) => {
                              setSortField(option.field);
                              setSortDirection(option.direction);
                              (event.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                            }}
                          >
                            <option.icon size={12} aria-hidden="true" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </section>

          {groupedPatterns.length === 0 ? (
            <div className="explore-empty-state">
              <Search size={24} aria-hidden="true" />
              <div>
                <h2>{t('explore.noResultsTitle')}</h2>
                <p>{t('explore.noResults')}</p>
              </div>
              <button
                className="btn btn-sm btn-secondary-neutral"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories(new Set());
                  setSelectedSource('all');
                  setSelectedAuthors(new Set());
                  setSelectedRulesets(new Set());
                  setSelectedTags(new Set());
                  setFavoritesOnly(false);
                  setForkedOnly(false);
                }}
              >
                {t('explore.clearFilters')}
              </button>
            </div>
          ) : null}

          {groupedPatterns.map(([category, categoryPatterns]) => (
            <section
              key={category}
              className={`profile-gallery-section${viewMode === 'cards' ? ' explore-gallery-section-cards' : ''}`}
            >
              <div className="profile-section-heading-row">
                <h2>{category}</h2>
                <span className="wm-badge wm-badge-neutral">{categoryPatterns.length}</span>
              </div>

              {viewMode === 'cards' ? (
                <div className="explore-patterns-grid">
                  {categoryPatterns.map((pattern) => {
                    const hash = getPatternHash(pattern.grid);
                    const favorite = favoriteHashes.has(hash);
                    const metrics = patternMetrics[hash] ?? { favorites: 0, forks: 0 };
                    return (
                      <article key={`${pattern.category}-${pattern.name}`} className="card card-body explore-pattern-card">
                        <Link
                          className="explore-card-preview-link"
                          to={getPatternPlayUrl(pattern)}
                          onClick={() => trackRecentBoard(hash, pattern.name)}
                        >
                          <div className="profile-board-preview">
                            <PatternPreview grid={pattern.grid} size={88} palette={previewPalette} />
                          </div>
                        </Link>

                        <div className="profile-board-meta">
                          <div className="profile-board-meta-title-row">
                            <Link
                              className="explore-card-title-link"
                              to={getPatternPlayUrl(pattern)}
                              onClick={() => trackRecentBoard(hash, pattern.name)}
                            >
                              <h3>{pattern.name}</h3>
                            </Link>
                            {renderSourceBadge(pattern)}
                          </div>
                          {renderPatternBadges(pattern)}
                        </div>

                        <div className="explore-pattern-actions">
                          <button
                            className="btn btn-sm btn-secondary-neutral explore-action-btn"
                            type="button"
                              onClick={() => handleFork(pattern)}
                          >
                            <GitFork size={13} aria-hidden="true" />
                            {t('explore.forkPattern')}
                            <span className="explore-action-count">{metrics.forks}</span>
                          </button>
                          <button
                            className="btn btn-sm btn-secondary-neutral explore-action-btn explore-favorite-btn"
                            type="button"
                            onClick={() => handleFavorite(pattern.name, pattern.grid)}
                          >
                            <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
                            <span>{favorite ? t('explore.favorited') : t('explore.favorite')}</span>
                            <span className="explore-action-count">{metrics.favorites}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="explore-patterns-table-wrap">
                  <table className={`explore-patterns-table${groupMode !== 'none' ? ' is-grouped' : ''}`}>
                    <colgroup>
                      <col className="explore-col-pattern" />
                      <col className="explore-col-source" />
                      <col className="explore-col-category" />
                      <col className="explore-col-ruleset" />
                      <col className="explore-col-tags" />
                      <col className="explore-col-forks" />
                      <col className="explore-col-stars" />
                      <col className="explore-col-actions" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>
                          <div className="explore-table-sort-head">
                            <button
                              type="button"
                              className={`explore-table-sort-btn${sortField === 'name' ? ' is-active' : ''}`}
                              onClick={() => handleTableSort('name')}
                            >
                              <span>{t('explore.tablePattern')}</span>
                            </button>
                            <button
                              type="button"
                              className={`explore-table-sort-dir-btn${sortField === 'name' ? ' is-active' : ''}`}
                              aria-label={`${t('explore.sortDirectionLabel')} - ${t('explore.tablePattern')}`}
                              onClick={() => handleTableSortDirection('name')}
                            >
                              {sortField === 'name' ? (
                                sortDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDownUp size={12} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th>
                          <div className="explore-table-sort-head">
                            <button
                              type="button"
                              className={`explore-table-sort-btn${sortField === 'user' ? ' is-active' : ''}`}
                              onClick={() => handleTableSort('user')}
                            >
                              <span>{t('explore.tableSource')}</span>
                            </button>
                            <button
                              type="button"
                              className={`explore-table-sort-dir-btn${sortField === 'user' ? ' is-active' : ''}`}
                              aria-label={`${t('explore.sortDirectionLabel')} - ${t('explore.tableSource')}`}
                              onClick={() => handleTableSortDirection('user')}
                            >
                              {sortField === 'user' ? (
                                sortDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDownUp size={12} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th>
                          <div className="explore-table-sort-head">
                            <button
                              type="button"
                              className={`explore-table-sort-btn${sortField === 'category' ? ' is-active' : ''}`}
                              onClick={() => handleTableSort('category')}
                            >
                              <span>{t('explore.tableCategory')}</span>
                            </button>
                            <button
                              type="button"
                              className={`explore-table-sort-dir-btn${sortField === 'category' ? ' is-active' : ''}`}
                              aria-label={`${t('explore.sortDirectionLabel')} - ${t('explore.tableCategory')}`}
                              onClick={() => handleTableSortDirection('category')}
                            >
                              {sortField === 'category' ? (
                                sortDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDownUp size={12} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th>{t('explore.tableRuleset')}</th>
                        <th>{t('explore.tableTags')}</th>
                        <th>
                          <div className="explore-table-sort-head">
                            <button
                              type="button"
                              className={`explore-table-sort-btn${sortField === 'forks' ? ' is-active' : ''}`}
                              onClick={() => handleTableSort('forks')}
                            >
                              <span>{t('explore.tableForks')}</span>
                            </button>
                            <button
                              type="button"
                              className={`explore-table-sort-dir-btn${sortField === 'forks' ? ' is-active' : ''}`}
                              aria-label={`${t('explore.sortDirectionLabel')} - ${t('explore.tableForks')}`}
                              onClick={() => handleTableSortDirection('forks')}
                            >
                              {sortField === 'forks' ? (
                                sortDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDownUp size={12} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th>
                          <div className="explore-table-sort-head">
                            <button
                              type="button"
                              className={`explore-table-sort-btn${sortField === 'favorites' ? ' is-active' : ''}`}
                              onClick={() => handleTableSort('favorites')}
                            >
                              <span>{t('explore.tableStars')}</span>
                            </button>
                            <button
                              type="button"
                              className={`explore-table-sort-dir-btn${sortField === 'favorites' ? ' is-active' : ''}`}
                              aria-label={`${t('explore.sortDirectionLabel')} - ${t('explore.tableStars')}`}
                              onClick={() => handleTableSortDirection('favorites')}
                            >
                              {sortField === 'favorites' ? (
                                sortDirection === 'asc' ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDownUp size={12} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </th>
                        <th>{t('explore.tableActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPatterns.map((pattern) => {
                        const hash = getPatternHash(pattern.grid);
                        const favorite = favoriteHashes.has(hash);
                        const metrics = patternMetrics[hash] ?? { favorites: 0, forks: 0 };

                        return (
                          <tr key={`${pattern.category}-${pattern.name}`}>
                            <td>
                              <Link
                                className="explore-table-pattern-link"
                                to={getPatternPlayUrl(pattern)}
                                onClick={() => trackRecentBoard(hash, pattern.name)}
                              >
                                <div className="explore-table-pattern-cell">
                                  <PatternPreview grid={pattern.grid} size={48} palette={previewPalette} />
                                  <span>{pattern.name}</span>
                                </div>
                              </Link>
                            </td>
                            <td>
                              {renderSourceBadge(pattern)}
                            </td>
                            <td>
                              <button
                                className="wm-badge wm-badge-neutral explore-filter-badge"
                                type="button"
                                aria-label={`${t('explore.categoryFilterLabel')}: ${pattern.category}`}
                                onClick={() => setSelectedCategories(new Set([pattern.category]))}
                              >
                                {pattern.category}
                              </button>
                            </td>
                            <td className="explore-table-ruleset-cell">
                              <button
                                className="wm-badge wm-badge-neutral explore-pattern-ruleset-badge explore-filter-badge"
                                type="button"
                                aria-label={`${t('explore.rulesetFilterLabel')}: ${getRulesetLabel(getPatternRulesetId(pattern))}`}
                                onClick={() => setSelectedRulesets(new Set([getPatternRulesetId(pattern)]))}
                              >
                                {getRulesetLabel(getPatternRulesetId(pattern))}
                              </button>
                            </td>
                            <td className="explore-table-tags-cell">
                              <div className="explore-pattern-tag-row">
                                {getPatternTags(pattern).map((tag) => (
                                  <button
                                    key={tag}
                                    className="wm-badge wm-badge-neutral explore-pattern-tag explore-filter-badge"
                                    type="button"
                                    aria-label={`${t('explore.tagFilterLabel')}: ${tag}`}
                                    onClick={() => setSelectedTags(new Set([tag]))}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-secondary-neutral explore-action-btn"
                                type="button"
                                onClick={() => handleFork(pattern)}
                              >
                                <GitFork size={13} aria-hidden="true" />
                                {t('explore.forkPattern')}
                                <span className="explore-action-count">{metrics.forks}</span>
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-secondary-neutral explore-action-btn explore-favorite-btn"
                                type="button"
                                onClick={() => handleFavorite(pattern.name, pattern.grid)}
                              >
                                <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
                                <span>{favorite ? t('explore.favorited') : t('explore.favorite')}</span>
                                <span className="explore-action-count">{metrics.favorites}</span>
                              </button>
                            </td>
                            <td>
                              <div className="explore-pattern-actions explore-table-actions">
                                <Link
                                  className="btn btn-sm btn-secondary-neutral explore-action-btn"
                                  to={getPatternPlayUrl(pattern)}
                                  onClick={() => trackRecentBoard(hash, pattern.name)}
                                >
                                  <Play size={13} aria-hidden="true" />
                                  {t('explore.playPattern')}
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className={`wm-toast wm-toast-success${toastOpen ? ' wm-toast-visible' : ''}`} role="status" aria-live="polite">
        <span>{toastMessage}</span>
        {showFavoritesToastLink ? (
          <Link className="explore-toast-link" to="/profile#favorites" onClick={closeToast}>
            {t('explore.viewFavorites')}
          </Link>
        ) : null}
        <button className="wm-toast-dismiss" type="button" aria-label="Dismiss" onClick={closeToast}>&#x2715;</button>
      </div>
    </div>
  );
}

export default Explore;
