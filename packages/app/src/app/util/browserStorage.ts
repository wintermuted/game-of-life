import { LifeGrid } from '@game-of-life/core';
import { decodeBase64ToGrid } from './urlState';

export type BrowserStorageMode = 'local' | 'session';

export interface SavedBoardRecord {
  hash: string;
  boardId?: string;
  title: string;
  category?: string;
  description?: string;
  visibility?: 'public' | 'private';
  updatedAt: number;
}

export interface RecentBoardRecord {
  hash: string;
  boardId?: string;
  title: string;
  openedAt: number;
}

export interface FavoriteBoardRecord {
  hash: string;
  title: string;
  favoritedAt: number;
  actorName?: string;
}

export interface ForkOriginRecord {
  hash: string;
  parentHash: string;
  parentTitle: string;
  parentSource: 'system' | 'user';
  parentCreatorName?: string;
  forkerName?: string;
  forkedPatternTitle?: string;
  createdAt: number;
}

export interface SeedCatalogPattern {
  hash: string;
  title: string;
  source: 'system' | 'user';
  creatorName?: string;
}

export interface StoredProfileUser {
  name: string;
  email: string;
  memberSince: string;
  timezone: string;
  favoritePalette: string;
  avatarInitials: string;
}

const STORAGE_MODE_KEY = 'gol.storage.mode';
const STORAGE_PREFIX = 'gol.storage.';
const TEMPLATE_NAMES_KEY = `${STORAGE_PREFIX}savedTemplateNames`;
const SAVED_BOARDS_KEY = `${STORAGE_PREFIX}savedBoards`;
const RECENT_BOARDS_KEY = `${STORAGE_PREFIX}recentBoards`;
const FAVORITE_BOARDS_KEY = `${STORAGE_PREFIX}favoriteBoards`;
const FORK_ORIGINS_KEY = `${STORAGE_PREFIX}forkOrigins`;
const PROFILE_USER_KEY = `${STORAGE_PREFIX}profileUser`;
const SOCIAL_SEED_KEY = `${STORAGE_PREFIX}socialSeed.v1`;

const MAX_RECENT_BOARDS = 12;
const DUMMY_SOCIAL_USERS = ['James Nyeholt', 'Anika Shah', 'Leo Martinez'];

const defaultProfileUser: StoredProfileUser = {
  name: 'James Nyeholt',
  email: 'james@example.com',
  memberSince: 'April 2026',
  timezone: 'America/Los_Angeles',
  favoritePalette: 'Classic Green',
  avatarInitials: 'JN',
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function getStorageByMode(mode: BrowserStorageMode): Storage | null {
  if (!canUseStorage()) return null;
  return mode === 'session' ? window.sessionStorage : window.localStorage;
}

function readJSON<T>(storage: Storage | null, key: string, fallback: T): T {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(storage: Storage | null, key: string, value: T): void {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}

function getModeFromLocalStorage(): BrowserStorageMode {
  if (!canUseStorage()) return 'local';

  const raw = window.localStorage.getItem(STORAGE_MODE_KEY);
  return raw === 'session' ? 'session' : 'local';
}

export function getBrowserStorageMode(): BrowserStorageMode {
  return getModeFromLocalStorage();
}

export function setBrowserStorageMode(nextMode: BrowserStorageMode): void {
  if (!canUseStorage()) return;

  const previousMode = getModeFromLocalStorage();
  if (previousMode !== nextMode) {
    const previousStorage = getStorageByMode(previousMode);
    const nextStorage = getStorageByMode(nextMode);

    if (previousStorage && nextStorage) {
      const keysToMigrate = [
        TEMPLATE_NAMES_KEY,
        SAVED_BOARDS_KEY,
        RECENT_BOARDS_KEY,
        FAVORITE_BOARDS_KEY,
        FORK_ORIGINS_KEY,
        PROFILE_USER_KEY,
        SOCIAL_SEED_KEY,
      ];
      for (const key of keysToMigrate) {
        const raw = previousStorage.getItem(key);
        if (raw !== null) {
          nextStorage.setItem(key, raw);
        }
      }
    }
  }

  window.localStorage.setItem(STORAGE_MODE_KEY, nextMode);
}

function getActiveStorage(): Storage | null {
  return getStorageByMode(getModeFromLocalStorage());
}

function normalizeActorName(actorName?: string): string {
  const normalized = actorName?.trim();
  return normalized && normalized.length > 0 ? normalized : defaultProfileUser.name;
}

function normalizeBoardId(boardId: string | undefined, hash: string): string {
  const normalized = boardId?.trim();
  return normalized && normalized.length > 0 ? normalized : hash;
}

function sanitizeSavedBoardRecord(record: SavedBoardRecord): SavedBoardRecord {
  const normalizedCategory = record.category?.trim();
  const normalizedDescription = record.description?.trim();
  return {
    ...record,
    boardId: normalizeBoardId(record.boardId, record.hash),
    title: record.title.trim(),
    category: normalizedCategory && normalizedCategory.length > 0 ? normalizedCategory : undefined,
    description: normalizedDescription && normalizedDescription.length > 0 ? normalizedDescription : undefined,
    visibility: record.visibility === 'public' ? 'public' : 'private',
  };
}

function sanitizeRecentBoardRecord(record: RecentBoardRecord): RecentBoardRecord {
  return {
    ...record,
    boardId: normalizeBoardId(record.boardId, record.hash),
    title: record.title.trim(),
  };
}

function sanitizeForkRecord(record: ForkOriginRecord): ForkOriginRecord {
  return {
    ...record,
    parentTitle: record.parentTitle.trim(),
    forkerName: normalizeActorName(record.forkerName),
    forkedPatternTitle: record.forkedPatternTitle?.trim() || undefined,
  };
}

export function getSavedTemplateNames(): Record<string, string> {
  return readJSON<Record<string, string>>(getActiveStorage(), TEMPLATE_NAMES_KEY, {});
}

export function setSavedTemplateNames(next: Record<string, string>): void {
  writeJSON(getActiveStorage(), TEMPLATE_NAMES_KEY, next);
}

export function getSavedBoards(): SavedBoardRecord[] {
  const records = readJSON<SavedBoardRecord[]>(getActiveStorage(), SAVED_BOARDS_KEY, []);
  return records.map((record) => sanitizeSavedBoardRecord(record));
}

export function setSavedBoards(next: SavedBoardRecord[]): void {
  writeJSON(getActiveStorage(), SAVED_BOARDS_KEY, next.map((record) => sanitizeSavedBoardRecord(record)));
}

export function upsertSavedBoard(
  hash: string,
  title: string,
  boardId = hash,
  category?: string,
  description?: string,
  visibility?: 'public' | 'private',
): void {
  const normalizedTitle = title.trim();
  if (!hash || !normalizedTitle) return;

  const current = getSavedBoards();
  const normalizedBoardId = normalizeBoardId(boardId, hash);
  const index = current.findIndex((item) => normalizeBoardId(item.boardId, item.hash) === normalizedBoardId);
  const normalizedCategory = category?.trim();
  const normalizedDescription = description?.trim();
  const existingCategory = index >= 0 ? current[index].category : undefined;
  const existingDescription = index >= 0 ? current[index].description : undefined;
  const existingVisibility = index >= 0 ? current[index].visibility : undefined;
  const updated: SavedBoardRecord = {
    hash,
    boardId: normalizedBoardId,
    title: normalizedTitle,
    category: normalizedCategory && normalizedCategory.length > 0 ? normalizedCategory : existingCategory,
    description: normalizedDescription && normalizedDescription.length > 0 ? normalizedDescription : existingDescription,
    visibility: visibility ?? existingVisibility ?? 'private',
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    current[index] = updated;
  } else {
    current.push(updated);
  }

  current.sort((a, b) => b.updatedAt - a.updatedAt);
  setSavedBoards(current);
}

export function getRecentBoards(): RecentBoardRecord[] {
  const records = readJSON<RecentBoardRecord[]>(getActiveStorage(), RECENT_BOARDS_KEY, []);
  return records.map((record) => sanitizeRecentBoardRecord(record));
}

export function setRecentBoards(next: RecentBoardRecord[]): void {
  writeJSON(getActiveStorage(), RECENT_BOARDS_KEY, next.map((record) => sanitizeRecentBoardRecord(record)));
}

export function trackRecentBoard(hash: string, title: string, boardId = hash): void {
  const normalizedTitle = title.trim();
  if (!hash || !normalizedTitle) return;

  const normalizedBoardId = normalizeBoardId(boardId, hash);
  const existing = getRecentBoards().filter((item) => normalizeBoardId(item.boardId, item.hash) !== normalizedBoardId);
  existing.unshift({
    hash,
    boardId: normalizedBoardId,
    title: normalizedTitle,
    openedAt: Date.now(),
  });
  setRecentBoards(existing.slice(0, MAX_RECENT_BOARDS));
}

export function getFavoriteBoards(): FavoriteBoardRecord[] {
  const records = readJSON<FavoriteBoardRecord[]>(getActiveStorage(), FAVORITE_BOARDS_KEY, []);
  return records.map((record) => ({
    ...record,
    actorName: normalizeActorName(record.actorName),
  }));
}

export function setFavoriteBoards(next: FavoriteBoardRecord[]): void {
  writeJSON(getActiveStorage(), FAVORITE_BOARDS_KEY, next.map((record) => ({
    ...record,
    actorName: normalizeActorName(record.actorName),
  })));
}

export function isBoardFavorited(hash: string, actorName = getStoredProfileUser().name): boolean {
  const normalizedActor = normalizeActorName(actorName);
  return getFavoriteBoards().some((entry) => entry.hash === hash && normalizeActorName(entry.actorName) === normalizedActor);
}

export function toggleFavoriteBoard(hash: string, title: string, actorName = getStoredProfileUser().name): boolean {
  const normalizedTitle = title.trim();
  const normalizedActor = normalizeActorName(actorName);
  if (!hash || !normalizedTitle) return false;

  const existing = getFavoriteBoards();
  const found = existing.find(
    (entry) => entry.hash === hash && normalizeActorName(entry.actorName) === normalizedActor,
  );
  if (found) {
    setFavoriteBoards(existing.filter(
      (entry) => !(entry.hash === hash && normalizeActorName(entry.actorName) === normalizedActor),
    ));
    return false;
  }

  setFavoriteBoards([
    {
      hash,
      title: normalizedTitle,
      favoritedAt: Date.now(),
      actorName: normalizedActor,
    },
    ...existing,
  ]);
  return true;
}

export function getForkOrigins(): ForkOriginRecord[] {
  const records = readJSON<ForkOriginRecord[]>(getActiveStorage(), FORK_ORIGINS_KEY, []);
  return records.map((record) => sanitizeForkRecord(record));
}

export function setForkOrigins(next: ForkOriginRecord[]): void {
  writeJSON(getActiveStorage(), FORK_ORIGINS_KEY, next.map((record) => sanitizeForkRecord(record)));
}

export function getForkOrigin(hash: string): ForkOriginRecord | null {
  return getForkOrigins().find((entry) => entry.hash === hash) ?? null;
}

export function upsertForkOrigin(
  hash: string,
  origin: Omit<ForkOriginRecord, 'hash' | 'createdAt'>,
): void {
  if (!hash || !origin.parentHash || !origin.parentTitle.trim()) return;

  const current = getForkOrigins().filter((entry) => entry.hash !== hash);
  current.unshift({
    hash,
    parentHash: origin.parentHash,
    parentTitle: origin.parentTitle.trim(),
    parentSource: origin.parentSource,
    parentCreatorName: origin.parentCreatorName,
    forkerName: normalizeActorName(origin.forkerName),
    forkedPatternTitle: origin.forkedPatternTitle?.trim() || undefined,
    createdAt: Date.now(),
  });
  setForkOrigins(current);
}

export function ensureSeededSocialData(catalog: SeedCatalogPattern[]): void {
  const storage = getActiveStorage();
  if (!storage || catalog.length === 0) return;
  if (storage.getItem(SOCIAL_SEED_KEY) === '1') return;

  const favorites = getFavoriteBoards();
  const forks = getForkOrigins();
  if (favorites.length > 0 || forks.length > 0) {
    storage.setItem(SOCIAL_SEED_KEY, '1');
    return;
  }

  const sortedCatalog = [...catalog].sort((left, right) => {
    if (left.source === right.source) return left.title.localeCompare(right.title);
    return left.source === 'user' ? -1 : 1;
  });
  const targets = sortedCatalog.slice(0, Math.min(6, sortedCatalog.length));
  const seededAt = Date.now();

  const seededFavorites: FavoriteBoardRecord[] = [];
  const seededForks: ForkOriginRecord[] = [];

  targets.forEach((pattern, index) => {
    const primaryUser = DUMMY_SOCIAL_USERS[index % DUMMY_SOCIAL_USERS.length];
    const secondaryUser = DUMMY_SOCIAL_USERS[(index + 1) % DUMMY_SOCIAL_USERS.length];

    seededFavorites.push(
      {
        hash: pattern.hash,
        title: pattern.title,
        favoritedAt: seededAt - index * 60000,
        actorName: primaryUser,
      },
      {
        hash: pattern.hash,
        title: pattern.title,
        favoritedAt: seededAt - (index * 60000 + 30000),
        actorName: secondaryUser,
      },
    );

    if (index < targets.length - 1) {
      const forkerName = DUMMY_SOCIAL_USERS[(index + 2) % DUMMY_SOCIAL_USERS.length];
      seededForks.push({
        hash: `seed-fork-${index}-${pattern.hash.slice(0, 8)}`,
        parentHash: pattern.hash,
        parentTitle: pattern.title,
        parentSource: pattern.source,
        parentCreatorName: pattern.creatorName,
        forkerName,
        forkedPatternTitle: `${pattern.title} Remix`,
        createdAt: seededAt - index * 45000,
      });
    }
  });

  setFavoriteBoards(seededFavorites);
  setForkOrigins(seededForks);
  storage.setItem(SOCIAL_SEED_KEY, '1');
}

export function getStoredProfileUser(): StoredProfileUser {
  return {
    ...defaultProfileUser,
    ...readJSON<Partial<StoredProfileUser>>(getActiveStorage(), PROFILE_USER_KEY, {}),
  };
}

export function setStoredProfileUser(next: Partial<StoredProfileUser>): void {
  const current = getStoredProfileUser();
  writeJSON(getActiveStorage(), PROFILE_USER_KEY, {
    ...current,
    ...next,
  });
}

export function clearActiveBrowserStorageData(): void {
  const storage = getActiveStorage();
  if (!storage) return;

  storage.removeItem(TEMPLATE_NAMES_KEY);
  storage.removeItem(SAVED_BOARDS_KEY);
  storage.removeItem(RECENT_BOARDS_KEY);
  storage.removeItem(FAVORITE_BOARDS_KEY);
  storage.removeItem(FORK_ORIGINS_KEY);
  storage.removeItem(PROFILE_USER_KEY);
  storage.removeItem(SOCIAL_SEED_KEY);
}

export function hashToGrid(hash: string): LifeGrid | null {
  return decodeBase64ToGrid(hash);
}

export function formatRelativeTime(timestamp: number, i18nRelativeFormatter: (value: number, unit: Intl.RelativeTimeFormatUnit) => string): string {
  const elapsedMs = Date.now() - timestamp;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  if (elapsedMinutes < 1) return i18nRelativeFormatter(0, 'minute');
  if (elapsedMinutes < 60) return i18nRelativeFormatter(-elapsedMinutes, 'minute');

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return i18nRelativeFormatter(-elapsedHours, 'hour');

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return i18nRelativeFormatter(-elapsedDays, 'day');

  const elapsedWeeks = Math.floor(elapsedDays / 7);
  if (elapsedWeeks < 5) return i18nRelativeFormatter(-elapsedWeeks, 'week');

  const elapsedMonths = Math.floor(elapsedDays / 30);
  if (elapsedMonths < 12) return i18nRelativeFormatter(-elapsedMonths, 'month');

  const elapsedYears = Math.floor(elapsedDays / 365);
  return i18nRelativeFormatter(-elapsedYears, 'year');
}
