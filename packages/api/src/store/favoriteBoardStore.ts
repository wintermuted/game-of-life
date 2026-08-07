import type {
  ServerFavoriteBoard,
  AddFavoriteBoardRequest,
} from '../models/favoriteBoard';

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function favoriteKey(boardId: string, actorName: string): string {
  return `${boardId}::${actorName.trim().toLowerCase()}`;
}

export class FavoriteBoardStore {
  /** userId → favoriteKey → ServerFavoriteBoard */
  private data = new Map<string, Map<string, ServerFavoriteBoard>>();

  private getUserFavorites(userId: string): Map<string, ServerFavoriteBoard> {
    let map = this.data.get(userId);
    if (!map) {
      map = new Map();
      this.data.set(userId, map);
    }
    return map;
  }

  list(userId: string): ServerFavoriteBoard[] {
    return Array.from(this.getUserFavorites(userId).values()).sort(
      (a, b) => new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime(),
    );
  }

  add(userId: string, request: AddFavoriteBoardRequest): ServerFavoriteBoard {
    const favorites = this.getUserFavorites(userId);
    const actor = request.actorName?.trim() || userId;
    const key = favoriteKey(request.boardId, actor);

    const existing = favorites.get(key);
    if (existing) {
      // Set-union: already present, return existing record
      return existing;
    }

    const now = nowIso();
    const record: ServerFavoriteBoard = {
      id: generateId(),
      userId,
      boardId: request.boardId,
      hash: request.hash,
      title: request.title.trim(),
      actorName: actor,
      favoritedAt: now,
      updatedAt: now,
    };

    favorites.set(key, record);
    return record;
  }

  remove(userId: string, boardId: string, actorName?: string): boolean {
    const favorites = this.getUserFavorites(userId);
    const actor = actorName?.trim() || userId;
    const key = favoriteKey(boardId, actor);
    return favorites.delete(key);
  }

  isFavorited(userId: string, boardId: string, actorName?: string): boolean {
    const actor = actorName?.trim() || userId;
    const key = favoriteKey(boardId, actor);
    return this.getUserFavorites(userId).has(key);
  }

  clear(): void {
    this.data.clear();
  }
}
