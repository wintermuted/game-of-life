import { Router } from 'express';
import type { Request, Response } from 'express';
import type { FavoriteBoardStore } from '../store/favoriteBoardStore';
import type {
  ListFavoriteBoardsResponse,
  AddFavoriteBoardRequest,
  AddFavoriteBoardResponse,
} from '../models/favoriteBoard';

export function createFavoriteBoardsRouter(store: FavoriteBoardStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const response: ListFavoriteBoardsResponse = { favorites: store.list(userId) };
    res.json(response);
  });

  router.post('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as AddFavoriteBoardRequest;

    if (!body.boardId || !body.hash || !body.title) {
      res.status(400).json({ error: 'boardId, hash, and title are required' });
      return;
    }

    const favorite = store.add(userId, body);
    const response: AddFavoriteBoardResponse = { favorite };
    res.status(201).json(response);
  });

  router.delete('/:boardId', (req: Request, res: Response) => {
    const { userId, boardId } = req.params as { userId: string; boardId: string };
    const actorName = (req.query as Record<string, string>).actorName;
    const deleted = store.remove(userId, boardId, actorName);
    if (!deleted) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
