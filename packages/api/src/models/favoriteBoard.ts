/**
 * Server model for a favorited board.
 * Conflict strategy: set-union by boardId + actorId; delete/toggle resolved by
 * latest server `updatedAt`.
 */
export interface ServerFavoriteBoard {
  /** Stable server-assigned identifier for this favorite relationship. */
  id: string;
  userId: string;
  boardId: string;
  /** Board content hash. */
  hash: string;
  title: string;
  actorName: string;
  /** ISO 8601 timestamp when this favorite was created. */
  favoritedAt: string;
  /** ISO 8601 timestamp of the last server-side change to this record. */
  updatedAt: string;
}

export interface AddFavoriteBoardRequest {
  boardId: string;
  hash: string;
  title: string;
  actorName?: string;
}

export interface AddFavoriteBoardResponse {
  favorite: ServerFavoriteBoard;
}

export interface ListFavoriteBoardsResponse {
  favorites: ServerFavoriteBoard[];
}
