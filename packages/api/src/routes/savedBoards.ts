import { Router } from 'express';
import type { Request, Response } from 'express';
import type { SavedBoardStore } from '../store/savedBoardStore';
import type {
  ListSavedBoardsResponse,
  UpsertSavedBoardRequest,
  UpsertSavedBoardResponse,
} from '../models/savedBoard';

export function createSavedBoardsRouter(store: SavedBoardStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const response: ListSavedBoardsResponse = { boards: store.list(userId) };
    res.json(response);
  });

  router.get('/:boardId', (req: Request, res: Response) => {
    const { userId, boardId } = req.params as { userId: string; boardId: string };
    const board = store.get(userId, boardId);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    const response: UpsertSavedBoardResponse = { board };
    res.json(response);
  });

  router.put('/:boardId', (req: Request, res: Response) => {
    const { userId, boardId } = req.params as { userId: string; boardId: string };
    const body = req.body as UpsertSavedBoardRequest;

    if (!body.hash || !body.title) {
      res.status(400).json({ error: 'hash and title are required' });
      return;
    }

    const board = store.upsert(userId, boardId, body);
    const response: UpsertSavedBoardResponse = { board };
    res.json(response);
  });

  router.delete('/:boardId', (req: Request, res: Response) => {
    const { userId, boardId } = req.params as { userId: string; boardId: string };
    const deleted = store.delete(userId, boardId);
    if (!deleted) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.status(204).send();
  });

  return router;
}
