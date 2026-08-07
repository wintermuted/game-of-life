import type {
  ServerSavedBoard,
  UpsertSavedBoardRequest,
} from '../models/savedBoard';

const MAX_SAVED_BOARDS_PER_USER = 200;

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class SavedBoardStore {
  /** userId → boardId → ServerSavedBoard */
  private data = new Map<string, Map<string, ServerSavedBoard>>();

  private getUserBoards(userId: string): Map<string, ServerSavedBoard> {
    let map = this.data.get(userId);
    if (!map) {
      map = new Map();
      this.data.set(userId, map);
    }
    return map;
  }

  list(userId: string): ServerSavedBoard[] {
    return Array.from(this.getUserBoards(userId).values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  get(userId: string, boardId: string): ServerSavedBoard | null {
    return this.getUserBoards(userId).get(boardId) ?? null;
  }

  upsert(userId: string, boardId: string, request: UpsertSavedBoardRequest): ServerSavedBoard {
    const boards = this.getUserBoards(userId);
    const now = nowIso();
    const existing = boards.get(boardId);

    if (existing) {
      const incomingMs = request.clientUpdatedAt;
      const serverMs = new Date(existing.updatedAt).getTime();
      // Last-write-wins: only update if client's version is newer
      if (incomingMs < serverMs) {
        return existing;
      }
    }

    const record: ServerSavedBoard = {
      id: existing?.id ?? generateId(),
      userId,
      hash: request.hash,
      title: request.title.trim(),
      category: request.category?.trim() || undefined,
      description: request.description?.trim() || undefined,
      tags: request.tags?.map((t) => t.trim()).filter((t) => t.length > 0),
      visibility: request.visibility ?? existing?.visibility ?? 'private',
      rules: request.rules ?? existing?.rules,
      rulesLocked: request.rulesLocked ?? existing?.rulesLocked ?? true,
      updatedAt: now,
      createdAt: existing?.createdAt ?? now,
    };

    boards.set(boardId, record);

    // Enforce per-user limit: drop oldest boards beyond the cap
    if (boards.size > MAX_SAVED_BOARDS_PER_USER) {
      const sorted = Array.from(boards.values()).sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      const toRemove = sorted.slice(0, boards.size - MAX_SAVED_BOARDS_PER_USER);
      for (const r of toRemove) {
        boards.delete(r.id);
      }
    }

    return record;
  }

  delete(userId: string, boardId: string): boolean {
    return this.getUserBoards(userId).delete(boardId);
  }

  clear(): void {
    this.data.clear();
  }
}
