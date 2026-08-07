/**
 * Server model for a fork origin record.
 * Conflict strategy: immutable append by forkId/hash; duplicates collapsed by
 * canonical fork key.
 */
export interface ServerForkOrigin {
  /** Stable server-assigned identifier for this fork relationship. */
  id: string;
  userId: string;
  /** Hash of the forked (child) board. */
  hash: string;
  /** Hash of the parent board that was forked. */
  parentHash: string;
  parentTitle: string;
  parentSource: 'system' | 'user';
  parentCreatorName?: string;
  forkerName: string;
  forkedPatternTitle?: string;
  /** ISO 8601 timestamp when this fork was created. Immutable after write. */
  createdAt: string;
  /** ISO 8601 timestamp of the last server-side update (for sync tracking). */
  updatedAt: string;
}

export interface AddForkOriginRequest {
  hash: string;
  parentHash: string;
  parentTitle: string;
  parentSource: 'system' | 'user';
  parentCreatorName?: string;
  forkerName?: string;
  forkedPatternTitle?: string;
}

export interface AddForkOriginResponse {
  fork: ServerForkOrigin;
}

export interface ListForkOriginsResponse {
  forks: ServerForkOrigin[];
}
