import { randomUUID } from 'node:crypto';

import {
  BoardRecord,
  BootstrapSnapshot,
  FavoriteRecord,
  ForkOriginRecord,
  ImportSnapshot,
  RecentBoardRecord,
  SessionIdentity,
  ToggleFavoriteInput,
  UpsertBoardInput,
  UpsertForkOriginInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferences,
  UserProfile,
} from './domain';
import { GameOfLifeRepository } from './storage';

const DEFAULT_PROFILE: UserProfile = {
  userId: 'user-anonymous',
  displayName: 'Guest Explorer',
  email: undefined,
  timezone: 'UTC',
  favoritePalette: 'Classic Green',
  avatarInitials: 'GE',
  memberSince: '2026-08-05',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'light',
  customColors: {},
  storageMode: 'local',
};

function now(): string {
  return new Date().toISOString();
}

function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
}

function normalizeTitle(title: string): string {
  return title.trim();
}

export class InMemoryGameOfLifeRepository implements GameOfLifeRepository {
  private readonly sessions = new Map<string, SessionIdentity>();

  private readonly profiles = new Map<string, UserProfile>();

  private readonly preferences = new Map<string, UserPreferences>();

  private readonly boards = new Map<string, BoardRecord>();

  private readonly favorites = new Map<string, FavoriteRecord[]>();

  private readonly recents = new Map<string, RecentBoardRecord[]>();

  private readonly forks = new Map<string, ForkOriginRecord>();

  getSession(sessionId: string): SessionIdentity | null {
    return this.sessions.get(sessionId) ?? null;
  }

  createAnonymousSession(): { session: SessionIdentity; profile: UserProfile } {
    const sessionId = randomUUID();
    const userId = `user-${sessionId.slice(0, 8)}`;
    const session: SessionIdentity = {
      sessionId,
      kind: 'anonymous',
      userId,
      createdAt: now(),
    };
    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      userId,
    };

    this.sessions.set(sessionId, session);
    this.profiles.set(userId, profile);
    this.preferences.set(userId, { ...DEFAULT_PREFERENCES });
    this.favorites.set(userId, []);
    this.recents.set(userId, []);

    return { session, profile };
  }

  getProfile(userId: string): UserProfile {
    return this.profiles.get(userId) ?? { ...DEFAULT_PROFILE, userId };
  }

  upsertProfile(profile: UpdateProfileInput & { userId: string }): UserProfile {
    const current = this.getProfile(profile.userId);
    const next: UserProfile = {
      ...current,
      ...profile,
      userId: profile.userId,
      displayName: profile.displayName?.trim() || current.displayName,
      email: profile.email?.trim() || current.email,
      avatarInitials: profile.avatarInitials?.trim() || current.avatarInitials,
      favoritePalette: profile.favoritePalette?.trim() || current.favoritePalette,
      timezone: profile.timezone?.trim() || current.timezone,
      memberSince: profile.memberSince?.trim() || current.memberSince,
    };

    this.profiles.set(profile.userId, next);
    return next;
  }

  getPreferences(userId: string): UserPreferences {
    return this.preferences.get(userId) ?? { ...DEFAULT_PREFERENCES };
  }

  updatePreferences(userId: string, next: UpdatePreferencesInput): UserPreferences {
    const current = this.getPreferences(userId);
    const merged: UserPreferences = {
      themeMode: next.themeMode ?? current.themeMode,
      customColors: next.customColors ?? current.customColors,
      storageMode: next.storageMode ?? current.storageMode,
    };

    this.preferences.set(userId, merged);
    return merged;
  }

  listBoards(userId: string): BoardRecord[] {
    return Array.from(this.boards.values()).filter((board) => board.ownerId === userId).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getBoard(userId: string, boardId: string): BoardRecord | null {
    const board = this.boards.get(boardId);
    if (!board || board.ownerId !== userId) {
      return null;
    }

    return board;
  }

  deleteBoard(userId: string, boardId: string): boolean {
    const board = this.boards.get(boardId);
    if (!board || board.ownerId !== userId) {
      return false;
    }

    this.boards.delete(boardId);
    return true;
  }

  upsertBoard(userId: string, input: UpsertBoardInput): BoardRecord {
    const boardId = input.boardId?.trim() || input.hash;
    const current = this.boards.get(boardId);
    const next: BoardRecord = {
      boardId,
      hash: input.hash,
      grid: { ...input.grid },
      ownerId: userId,
      title: normalizeTitle(input.title),
      category: input.category?.trim() || current?.category,
      description: input.description?.trim() || current?.description,
      tags: normalizeTags(input.tags),
      visibility: input.visibility ?? current?.visibility ?? 'private',
      rules: input.rules ?? current?.rules,
      rulesLocked: input.rulesLocked ?? current?.rulesLocked ?? true,
      updatedAt: now(),
    };

    this.boards.set(boardId, next);
    return next;
  }

  listFavorites(userId: string): FavoriteRecord[] {
    return [...(this.favorites.get(userId) ?? [])];
  }

  toggleFavorite(userId: string, input: ToggleFavoriteInput): { favorited: boolean; record?: FavoriteRecord } {
    const normalizedTitle = normalizeTitle(input.title);
    const existing = this.listFavorites(userId);
    const index = existing.findIndex((entry) => entry.hash === input.hash);

    if (index >= 0) {
      existing.splice(index, 1);
      this.favorites.set(userId, existing);
      return { favorited: false };
    }

    const record: FavoriteRecord = {
      userId,
      hash: input.hash,
      title: normalizedTitle,
      favoritedAt: now(),
    };

    existing.unshift(record);
    this.favorites.set(userId, existing);
    return { favorited: true, record };
  }

  listRecents(userId: string): RecentBoardRecord[] {
    return [...(this.recents.get(userId) ?? [])];
  }

  trackRecent(userId: string, boardId: string, hash: string, title: string): RecentBoardRecord {
    const existing = this.listRecents(userId).filter((entry) => entry.boardId !== boardId);
    const record: RecentBoardRecord = {
      userId,
      boardId,
      hash,
      title: normalizeTitle(title),
      openedAt: now(),
    };

    existing.unshift(record);
    this.recents.set(userId, existing.slice(0, 12));
    return record;
  }

  listForkOrigins(): ForkOriginRecord[] {
    return [...this.forks.values()];
  }

  upsertForkOrigin(input: UpsertForkOriginInput): ForkOriginRecord {
    const record: ForkOriginRecord = {
      hash: input.hash,
      parentHash: input.parentHash,
      parentTitle: normalizeTitle(input.parentTitle),
      parentSource: input.parentSource,
      parentCreatorName: input.parentCreatorName?.trim() || undefined,
      forkerName: normalizeTitle(input.forkerName),
      forkedPatternTitle: input.forkedPatternTitle?.trim() || undefined,
      createdAt: now(),
    };

    this.forks.set(input.hash, record);
    return record;
  }

  bootstrap(sessionId: string): BootstrapSnapshot {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      session,
      profile: this.getProfile(session.userId),
      preferences: this.getPreferences(session.userId),
      boards: this.listBoards(session.userId),
      favorites: this.listFavorites(session.userId),
      recents: this.listRecents(session.userId),
      forks: this.listForkOrigins(),
    };
  }

  importSnapshot(userId: string, snapshot: ImportSnapshot): BootstrapSnapshot {
    if (snapshot.profile) {
      this.upsertProfile({ ...snapshot.profile, userId });
    }

    if (snapshot.preferences) {
      this.updatePreferences(userId, snapshot.preferences);
    }

    for (const board of snapshot.boards ?? []) {
      this.upsertBoard(userId, {
        ...board,
        boardId: board.boardId ?? board.hash,
        grid: board.grid ?? {},
      });
    }

    const favorites = snapshot.favorites ?? [];
    if (favorites.length > 0) {
      this.favorites.set(userId, favorites.map((favorite) => ({
        ...favorite,
        userId,
        title: favorite.title.trim(),
      })));
    }

    const recents = snapshot.recents ?? [];
    if (recents.length > 0) {
      this.recents.set(userId, recents.map((recent) => ({
        ...recent,
        userId,
        boardId: recent.boardId.trim(),
        title: recent.title.trim(),
      })));
    }

    for (const fork of snapshot.forks ?? []) {
      this.upsertForkOrigin(fork);
    }

    const session = Array.from(this.sessions.values()).find((entry) => entry.userId === userId);
    if (!session) {
      throw new Error('Session not found for import');
    }

    return this.bootstrap(session.sessionId);
  }
}