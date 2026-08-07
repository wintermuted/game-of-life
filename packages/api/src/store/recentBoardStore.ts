import type {
  ServerRecentBoard,
  TrackRecentBoardRequest,
} from '../models/recentBoard';

const MAX_RECENT_BOARDS = 12;

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class RecentBoardStore {
  /** userId → boardId → ServerRecentBoard */
  private data = new Map<string, Map<string, ServerRecentBoard>>();

  private getUserRecents(userId: string): Map<string, ServerRecentBoard> {
    let map = this.data.get(userId);
    if (!map) {
      map = new Map();
      this.data.set(userId, map);
    }
    return map;
  }

  list(userId: string): ServerRecentBoard[] {
    return Array.from(this.getUserRecents(userId).values())
      .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
      .slice(0, MAX_RECENT_BOARDS);
  }

  track(userId: string, request: TrackRecentBoardRequest): ServerRecentBoard {
    const recents = this.getUserRecents(userId);
    const now = nowIso();
    const incomingOpenedAt = new Date(request.openedAt).toISOString();

    const existing = recents.get(request.boardId);
    let result: ServerRecentBoard;

    // Merge: keep max openedAt timestamp per boardId
    if (existing) {
      const existingMs = new Date(existing.openedAt).getTime();
      if (request.openedAt <= existingMs) {
        return existing;
      }
      result = {
        ...existing,
        title: request.title.trim(),
        openedAt: incomingOpenedAt,
        updatedAt: now,
      };
      recents.set(request.boardId, result);
    } else {
      result = {
        id: generateId(),
        userId,
        boardId: request.boardId,
        hash: request.hash,
        title: request.title.trim(),
        openedAt: incomingOpenedAt,
        updatedAt: now,
      };
      recents.set(request.boardId, result);
    }

    // Trim to server limit after any write so the cap is always enforced
    if (recents.size > MAX_RECENT_BOARDS) {
      const sorted = Array.from(recents.entries()).sort(
        ([, a], [, b]) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime(),
      );
      const toRemove = sorted.slice(0, recents.size - MAX_RECENT_BOARDS);
      for (const [key] of toRemove) {
        recents.delete(key);
      }
    }

    return result;
  }

  clear(): void {
    this.data.clear();
  }
}
