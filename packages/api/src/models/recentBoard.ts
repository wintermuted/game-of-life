/**
 * Server model for a recently opened board.
 * Conflict strategy: merge by boardId, keep max `openedAt` timestamp per board,
 * trim to server-side `MAX_RECENT_BOARDS` limit.
 */
export interface ServerRecentBoard {
  /** Stable server-assigned identifier for this recent-board record. */
  id: string;
  userId: string;
  boardId: string;
  /** Board content hash. */
  hash: string;
  title: string;
  /** ISO 8601 timestamp when this board was most recently opened. */
  openedAt: string;
  /** ISO 8601 timestamp of the last server-side update to this record. */
  updatedAt: string;
}

export interface TrackRecentBoardRequest {
  boardId: string;
  hash: string;
  title: string;
  /** Client-reported openedAt (epoch ms). */
  openedAt: number;
}

export interface TrackRecentBoardResponse {
  recent: ServerRecentBoard;
}

export interface ListRecentBoardsResponse {
  recents: ServerRecentBoard[];
}
