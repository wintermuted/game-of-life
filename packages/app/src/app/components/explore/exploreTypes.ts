import { patterns } from '@game-of-life/core';
export type ExplorePattern = (typeof patterns)[number] & {
  source: 'system' | 'user';
  creatorName?: string;
  visibility?: 'public' | 'private';
  favoriteCount: number;
  forkCount: number;
  boardId?: string;
};

export const SYSTEM_AUTHOR_KEY = '__system__';
export const UNKNOWN_USER_AUTHOR_KEY = '__user__';
export const CUSTOM_RULESET_ID = 'custom';
export const DEFAULT_SORT_FIELD = 'favorites';
export const DEFAULT_SORT_DIRECTION = 'desc';
export const DEFAULT_GROUP_MODE = 'none';
export const DEFAULT_VIEW_MODE = 'cards';

export type {
  CatalogGroupMode as GroupMode,
  CatalogSortField as SortField,
  CatalogSortDirection as SortDirection,
  CatalogViewMode as ViewMode,
} from '@game-of-life/ui-patterns';
import type {
  CatalogGroupMode as GroupMode,
  CatalogSortField as SortField,
  CatalogSortDirection as SortDirection,
  CatalogViewMode as ViewMode,
} from '@game-of-life/ui-patterns';

export const VALID_SORT_FIELDS = new Set(['favorites', 'forks', 'name', 'user', 'category']);
export const VALID_SORT_DIRECTIONS = new Set(['asc', 'desc']);
export const VALID_SOURCES = new Set(['all', 'system', 'user']);
export const VALID_VIEW_MODES = new Set(['cards', 'table']);
export const VALID_GROUP_MODES = new Set<GroupMode>(['none', 'category', 'ruleset', 'author']);

export type Source = 'all' | 'system' | 'user';
export interface PatternMetrics {
  favorites: number;
  forks: number;
}
export type MetricsByHash = Record<string, PatternMetrics>;
export interface QueryOptions {
  categoryOptions: string[];
  authorOptions: string[];
  rulesetOptions: string[];
  tagOptions: string[];
}
export interface ExploreQueryValues {
  searchQuery: string;
  selectedCategories: Set<string>;
  selectedSource: Source;
  selectedAuthors: Set<string>;
  selectedRulesets: Set<string>;
  selectedTags: Set<string>;
  favoritesOnly: boolean;
  forkedOnly: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  groupMode: GroupMode;
  viewMode: ViewMode;
}
