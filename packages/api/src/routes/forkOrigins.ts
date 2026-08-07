import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ForkOriginStore } from '../store/forkOriginStore';
import type {
  ListForkOriginsResponse,
  AddForkOriginRequest,
  AddForkOriginResponse,
  GetForkOriginResponse,
} from '../models/forkOrigin';

export function createForkOriginsRouter(store: ForkOriginStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const response: ListForkOriginsResponse = { forks: store.list(userId) };
    res.json(response);
  });

  router.get('/:hash', (req: Request, res: Response) => {
    const { userId, hash } = req.params as { userId: string; hash: string };
    const fork = store.get(userId, hash);
    if (!fork) {
      res.status(404).json({ error: 'Fork origin not found' });
      return;
    }
    const response: GetForkOriginResponse = { fork };
    res.json(response);
  });

  router.post('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as AddForkOriginRequest;

    if (!body.hash || !body.parentHash || !body.parentTitle || !body.parentSource) {
      res.status(400).json({ error: 'hash, parentHash, parentTitle, and parentSource are required' });
      return;
    }

    const fork = store.add(userId, body);
    const response: AddForkOriginResponse = { fork };
    res.status(201).json(response);
  });

  return router;
}
