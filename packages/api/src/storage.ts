import {
  BoardRecord,
  BootstrapSnapshot,
  FavoriteRecord,
  ForkOriginRecord,
  ImportSnapshot,
  RecentBoardRecord,
  SessionIdentity,
  ToggleFavoriteInput,
  UpsertBoardInput,
  UpsertForkOriginInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferences,
  UserProfile,
} from './domain';

export interface GameOfLifeRepository {
  getSession(sessionId: string): SessionIdentity | null;
  createAnonymousSession(): { session: SessionIdentity; profile: UserProfile };
  getProfile(userId: string): UserProfile;
  upsertProfile(profile: UpdateProfileInput & { userId: string }): UserProfile;
  getPreferences(userId: string): UserPreferences;
  updatePreferences(userId: string, next: UpdatePreferencesInput): UserPreferences;
  listBoards(userId: string): BoardRecord[];
  getBoard(userId: string, boardId: string): BoardRecord | null;
  upsertBoard(userId: string, input: UpsertBoardInput): BoardRecord;
  listFavorites(userId: string): FavoriteRecord[];
  toggleFavorite(userId: string, input: ToggleFavoriteInput): { favorited: boolean; record?: FavoriteRecord };
  listRecents(userId: string): RecentBoardRecord[];
  trackRecent(userId: string, boardId: string, hash: string, title: string): RecentBoardRecord;
  listForkOrigins(): ForkOriginRecord[];
  upsertForkOrigin(input: UpsertForkOriginInput): ForkOriginRecord;
  bootstrap(sessionId: string): BootstrapSnapshot;
  importSnapshot(userId: string, snapshot: ImportSnapshot): BootstrapSnapshot;
}