import type { ServerProfile, UpdateProfileRequest } from '../models/profile';

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_PROFILE: Omit<ServerProfile, 'id' | 'updatedAt' | 'createdAt'> = {
  name: '',
  email: '',
  memberSince: '',
  timezone: 'UTC',
  favoritePalette: 'Classic Green',
  avatarInitials: '',
};

export class ProfileStore {
  /** userId → ServerProfile */
  private data = new Map<string, ServerProfile>();

  get(userId: string): ServerProfile | null {
    return this.data.get(userId) ?? null;
  }

  getOrCreate(userId: string): ServerProfile {
    const existing = this.data.get(userId);
    if (existing) return existing;
    const now = nowIso();
    const created: ServerProfile = {
      ...DEFAULT_PROFILE,
      id: userId,
      updatedAt: now,
      createdAt: now,
    };
    this.data.set(userId, created);
    return created;
  }

  update(userId: string, request: UpdateProfileRequest): ServerProfile {
    const current = this.getOrCreate(userId);
    const now = nowIso();
    const serverMs = new Date(current.updatedAt).getTime();

    // Last-write-wins: only update if client's version is newer
    if (request.clientUpdatedAt < serverMs) {
      return current;
    }

    const updated: ServerProfile = {
      ...current,
      name: request.name?.trim() ?? current.name,
      email: request.email?.trim() ?? current.email,
      timezone: request.timezone?.trim() ?? current.timezone,
      favoritePalette: request.favoritePalette?.trim() ?? current.favoritePalette,
      avatarInitials: request.avatarInitials?.trim() ?? current.avatarInitials,
      updatedAt: now,
    };

    this.data.set(userId, updated);
    return updated;
  }

  clear(): void {
    this.data.clear();
  }
}
