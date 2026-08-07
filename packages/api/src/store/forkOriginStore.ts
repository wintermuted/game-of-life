import type {
  ServerForkOrigin,
  AddForkOriginRequest,
} from '../models/forkOrigin';

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class ForkOriginStore {
  /** userId → childHash → ServerForkOrigin */
  private data = new Map<string, Map<string, ServerForkOrigin>>();

  private getUserForks(userId: string): Map<string, ServerForkOrigin> {
    let map = this.data.get(userId);
    if (!map) {
      map = new Map();
      this.data.set(userId, map);
    }
    return map;
  }

  list(userId: string): ServerForkOrigin[] {
    return Array.from(this.getUserForks(userId).values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  get(userId: string, hash: string): ServerForkOrigin | null {
    return this.getUserForks(userId).get(hash) ?? null;
  }

  add(userId: string, request: AddForkOriginRequest): ServerForkOrigin {
    const forks = this.getUserForks(userId);
    const existing = forks.get(request.hash);

    // Immutable append: if the canonical fork key already exists, return it
    if (existing) {
      return existing;
    }

    const now = nowIso();
    const record: ServerForkOrigin = {
      id: generateId(),
      userId,
      hash: request.hash,
      parentHash: request.parentHash,
      parentTitle: request.parentTitle.trim(),
      parentSource: request.parentSource,
      parentCreatorName: request.parentCreatorName,
      forkerName: request.forkerName?.trim() || userId,
      forkedPatternTitle: request.forkedPatternTitle?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    forks.set(request.hash, record);
    return record;
  }

  clear(): void {
    this.data.clear();
  }
}
