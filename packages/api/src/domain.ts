import { GameRules, LifeGrid } from '@game-of-life/core';

export type SessionKind = 'anonymous' | 'registered';

export interface SessionIdentity {
  sessionId: string;
  kind: SessionKind;
  userId: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  timezone: string;
  favoritePalette: string;
  avatarInitials: string;
  memberSince: string;
}

export interface BoardRecord {
  boardId: string;
  hash: string;
  grid: LifeGrid;
  ownerId: string;
  title: string;
  category?: string;
  description?: string;
  tags: string[];
  visibility: 'public' | 'private';
  rules?: GameRules;
  rulesLocked: boolean;
  updatedAt: string;
}

export interface FavoriteRecord {
  userId: string;
  hash: string;
  title: string;
  favoritedAt: string;
}

export interface RecentBoardRecord {
  userId: string;
  hash: string;
  boardId: string;
  title: string;
  openedAt: string;
}

export interface ForkOriginRecord {
  hash: string;
  parentHash: string;
  parentTitle: string;
  parentSource: 'system' | 'user';
  parentCreatorName?: string;
  forkerName: string;
  forkedPatternTitle?: string;
  createdAt: string;
}

export interface UserPreferences {
  themeMode: 'light' | 'dark';
  customColors: Record<string, string>;
  storageMode: 'local' | 'session';
}

export interface ImportSnapshot {
  boards?: BoardRecord[];
  favorites?: FavoriteRecord[];
  recents?: RecentBoardRecord[];
  forks?: ForkOriginRecord[];
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateProfileInput {
  displayName?: string;
  email?: string;
  timezone?: string;
  favoritePalette?: string;
  avatarInitials?: string;
  memberSince?: string;
}

export interface UpdatePreferencesInput {
  themeMode?: 'light' | 'dark';
  customColors?: Record<string, string>;
  storageMode?: 'local' | 'session';
}

export interface BootstrapSnapshot {
  session: SessionIdentity;
  profile: UserProfile;
  preferences: UserPreferences;
  boards: BoardRecord[];
  favorites: FavoriteRecord[];
  recents: RecentBoardRecord[];
  forks: ForkOriginRecord[];
}

export interface UpsertBoardInput {
  boardId?: string;
  hash: string;
  grid: LifeGrid;
  title: string;
  category?: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  rules?: GameRules;
  rulesLocked?: boolean;
}

export interface ToggleFavoriteInput {
  hash: string;
  title: string;
}

export interface UpsertForkOriginInput {
  hash: string;
  parentHash: string;
  parentTitle: string;
  parentSource: 'system' | 'user';
  parentCreatorName?: string;
  forkerName: string;
  forkedPatternTitle?: string;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
  };
}

export interface BoardStats {
  liveCells: number;
  width: number;
  height: number;
}

export interface BoardPreview extends BoardStats {
  hash: string;
  grid: LifeGrid;
}