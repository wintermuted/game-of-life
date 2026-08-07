import type { GameRules } from './gameRules';

/**
 * Server model for a saved board.
 * Conflict strategy: last-write-wins using `updatedAt` as source of truth.
 */
export interface ServerSavedBoard {
  /** Stable server-assigned identifier. */
  id: string;
  /** User who owns this board. */
  userId: string;
  /** Board content hash (base64-encoded grid). */
  hash: string;
  title: string;
  category?: string;
  description?: string;
  tags?: string[];
  visibility: 'public' | 'private';
  rules?: GameRules;
  rulesLocked: boolean;
  /** ISO 8601 timestamp of the last server-side update. */
  updatedAt: string;
  /** ISO 8601 timestamp when this record was first created on the server. */
  createdAt: string;
}

export interface UpsertSavedBoardRequest {
  hash: string;
  title: string;
  category?: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  rules?: GameRules;
  rulesLocked?: boolean;
  /** Client-reported updatedAt (epoch ms) used for conflict detection. */
  clientUpdatedAt: number;
}

export interface UpsertSavedBoardResponse {
  board: ServerSavedBoard;
}

export interface ListSavedBoardsResponse {
  boards: ServerSavedBoard[];
}
