import { Router } from 'express';
import type { Request, Response } from 'express';
import type { TemplateNamesStore } from '../store/templateNamesStore';
import type {
  GetTemplateNamesResponse,
  UpdateTemplateNamesRequest,
  UpdateTemplateNamesResponse,
} from '../models/templateNames';

export function createTemplateNamesRouter(store: TemplateNamesStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const templateNames = store.get(userId);
    if (!templateNames) {
      res.status(404).json({ error: 'Template names not found' });
      return;
    }
    const response: GetTemplateNamesResponse = { templateNames };
    res.json(response);
  });

  router.put('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as UpdateTemplateNamesRequest;

    if (!body.names || typeof body.clientUpdatedAt !== 'number') {
      res.status(400).json({ error: 'names and clientUpdatedAt are required' });
      return;
    }

    const templateNames = store.update(userId, body);
    const response: UpdateTemplateNamesResponse = { templateNames };
    res.json(response);
  });

  return router;
}
