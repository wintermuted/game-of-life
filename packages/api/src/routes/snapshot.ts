import { Router } from 'express';
import type { Request, Response } from 'express';
import type { SavedBoardStore } from '../store/savedBoardStore';
import type { FavoriteBoardStore } from '../store/favoriteBoardStore';
import type { RecentBoardStore } from '../store/recentBoardStore';
import type { ForkOriginStore } from '../store/forkOriginStore';
import type { ProfileStore } from '../store/profileStore';
import type { TemplateNamesStore } from '../store/templateNamesStore';
import type { GetSnapshotResponse } from '../models/snapshot';

export interface SnapshotStores {
  savedBoards: SavedBoardStore;
  favoriteBoards: FavoriteBoardStore;
  recentBoards: RecentBoardStore;
  forkOrigins: ForkOriginStore;
  profile: ProfileStore;
  templateNames: TemplateNamesStore;
}

export function createSnapshotRouter(stores: SnapshotStores): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

    const response: GetSnapshotResponse = {
      snapshot: {
        userId,
        boards: stores.savedBoards.list(userId),
        favorites: stores.favoriteBoards.list(userId),
        recents: stores.recentBoards.list(userId),
        forks: stores.forkOrigins.list(userId),
        profile: stores.profile.get(userId),
        templateNames: stores.templateNames.get(userId),
        snapshotAt: new Date().toISOString(),
      },
    };

    res.json(response);
  });

  return router;
}
