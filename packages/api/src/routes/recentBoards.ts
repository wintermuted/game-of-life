import { Router } from 'express';
import type { Request, Response } from 'express';
import type { RecentBoardStore } from '../store/recentBoardStore';
import type {
  ListRecentBoardsResponse,
  TrackRecentBoardRequest,
  TrackRecentBoardResponse,
} from '../models/recentBoard';

export function createRecentBoardsRouter(store: RecentBoardStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const response: ListRecentBoardsResponse = { recents: store.list(userId) };
    res.json(response);
  });

  router.post('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as TrackRecentBoardRequest;

    if (!body.boardId || !body.hash || !body.title) {
      res.status(400).json({ error: 'boardId, hash, and title are required' });
      return;
    }

    const recent = store.track(userId, {
      ...body,
      openedAt: body.openedAt ?? Date.now(),
    });
    const response: TrackRecentBoardResponse = { recent };
    res.status(201).json(response);
  });

  return router;
}
