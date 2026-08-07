import type { ServerTemplateNames, UpdateTemplateNamesRequest } from '../models/templateNames';

function nowIso(): string {
  return new Date().toISOString();
}

export class TemplateNamesStore {
  /** userId → ServerTemplateNames */
  private data = new Map<string, ServerTemplateNames>();

  get(userId: string): ServerTemplateNames | null {
    return this.data.get(userId) ?? null;
  }

  getOrCreate(userId: string): ServerTemplateNames {
    const existing = this.data.get(userId);
    if (existing) return existing;
    const created: ServerTemplateNames = {
      userId,
      names: {},
      updatedAt: new Date().toISOString(),
    };
    this.data.set(userId, created);
    return created;
  }

  update(userId: string, request: UpdateTemplateNamesRequest): ServerTemplateNames {
    const current = this.getOrCreate(userId);
    const serverMs = new Date(current.updatedAt).getTime();

    // Last-write-wins: only update if client's version is newer
    if (request.clientUpdatedAt < serverMs) {
      return current;
    }

    const updated: ServerTemplateNames = {
      userId,
      names: { ...request.names },
      updatedAt: nowIso(),
    };

    this.data.set(userId, updated);
    return updated;
  }

  clear(): void {
    this.data.clear();
  }
}
