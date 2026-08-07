/**
 * Server model for user-defined template names (board hash → display name map).
 * Conflict strategy: last-write-wins using `updatedAt` as source of truth.
 */
export interface ServerTemplateNames {
  /** Stable server-assigned user identifier. */
  userId: string;
  /** Map from board hash to user-assigned display name. */
  names: Record<string, string>;
  /** ISO 8601 timestamp of the last server-side update. */
  updatedAt: string;
}

export interface UpdateTemplateNamesRequest {
  names: Record<string, string>;
  /** Client-reported updatedAt (epoch ms) used for conflict detection. */
  clientUpdatedAt: number;
}

export interface UpdateTemplateNamesResponse {
  templateNames: ServerTemplateNames;
}

export interface GetTemplateNamesResponse {
  templateNames: ServerTemplateNames;
}
