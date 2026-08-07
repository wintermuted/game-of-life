/**
 * Server model for a user's profile.
 * Conflict strategy: last-write-wins using `updatedAt` as source of truth.
 */
export interface ServerProfile {
  /** Stable server-assigned user identifier. */
  id: string;
  name: string;
  email: string;
  memberSince: string;
  timezone: string;
  favoritePalette: string;
  avatarInitials: string;
  /** ISO 8601 timestamp of the last server-side update. */
  updatedAt: string;
  /** ISO 8601 timestamp when this profile was created on the server. */
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  timezone?: string;
  favoritePalette?: string;
  avatarInitials?: string;
  /** Client-reported updatedAt (epoch ms) used for conflict detection. */
  clientUpdatedAt: number;
}

export interface UpdateProfileResponse {
  profile: ServerProfile;
}

export interface GetProfileResponse {
  profile: ServerProfile;
}
