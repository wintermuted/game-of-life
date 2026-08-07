import express from 'express';
import type { Application } from 'express';
import { SavedBoardStore } from './store/savedBoardStore';
import { FavoriteBoardStore } from './store/favoriteBoardStore';
import { RecentBoardStore } from './store/recentBoardStore';
import { ForkOriginStore } from './store/forkOriginStore';
import { ProfileStore } from './store/profileStore';
import { TemplateNamesStore } from './store/templateNamesStore';
import { requireUserId } from './middleware/requireUserId';
import { createSavedBoardsRouter } from './routes/savedBoards';
import { createFavoriteBoardsRouter } from './routes/favoriteBoards';
import { createRecentBoardsRouter } from './routes/recentBoards';
import { createForkOriginsRouter } from './routes/forkOrigins';
import { createProfileRouter } from './routes/profile';
import { createTemplateNamesRouter } from './routes/templateNames';
import { createSnapshotRouter } from './routes/snapshot';

export interface AppStores {
  savedBoards: SavedBoardStore;
  favoriteBoards: FavoriteBoardStore;
  recentBoards: RecentBoardStore;
  forkOrigins: ForkOriginStore;
  profile: ProfileStore;
  templateNames: TemplateNamesStore;
}

export function createDefaultStores(): AppStores {
  return {
    savedBoards: new SavedBoardStore(),
    favoriteBoards: new FavoriteBoardStore(),
    recentBoards: new RecentBoardStore(),
    forkOrigins: new ForkOriginStore(),
    profile: new ProfileStore(),
    templateNames: new TemplateNamesStore(),
  };
}

export function createApp(stores: AppStores = createDefaultStores()): Application {
  const app = express();
  app.use(express.json());

  const userRouter = express.Router({ mergeParams: true });
  userRouter.use(requireUserId);

  userRouter.use('/boards', createSavedBoardsRouter(stores.savedBoards));
  userRouter.use('/favorites', createFavoriteBoardsRouter(stores.favoriteBoards));
  userRouter.use('/recents', createRecentBoardsRouter(stores.recentBoards));
  userRouter.use('/forks', createForkOriginsRouter(stores.forkOrigins));
  userRouter.use('/profile', createProfileRouter(stores.profile));
  userRouter.use('/template-names', createTemplateNamesRouter(stores.templateNames));
  userRouter.use('/snapshot', createSnapshotRouter(stores));

  app.use('/api/users/:userId', userRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
