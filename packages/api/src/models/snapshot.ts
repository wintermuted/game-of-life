import type { ServerSavedBoard } from './savedBoard';
import type { ServerFavoriteBoard } from './favoriteBoard';
import type { ServerRecentBoard } from './recentBoard';
import type { ServerForkOrigin } from './forkOrigin';
import type { ServerProfile } from './profile';
import type { ServerTemplateNames } from './templateNames';

/**
 * Snapshot of all server-owned entities for a user, returned on app boot
 * to support the bootstrap-first local read + server reconciliation pattern.
 *
 * Client-only entities (theme, language, storage mode, social seed) are
 * intentionally excluded from this payload.
 */
export interface UserSnapshot {
  userId: string;
  boards: ServerSavedBoard[];
  favorites: ServerFavoriteBoard[];
  recents: ServerRecentBoard[];
  forks: ServerForkOrigin[];
  profile: ServerProfile | null;
  templateNames: ServerTemplateNames | null;
  /** ISO 8601 timestamp when this snapshot was generated. */
  snapshotAt: string;
}

export interface GetSnapshotResponse {
  snapshot: UserSnapshot;
}
