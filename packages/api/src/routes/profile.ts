import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ProfileStore } from '../store/profileStore';
import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../models/profile';

export function createProfileRouter(store: ProfileStore): Router {
  const router = Router({ mergeParams: true });

  router.get('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const profile = store.get(userId);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    const response: GetProfileResponse = { profile };
    res.json(response);
  });

  router.put('/', (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const body = req.body as UpdateProfileRequest;

    if (typeof body.clientUpdatedAt !== 'number') {
      res.status(400).json({ error: 'clientUpdatedAt is required' });
      return;
    }

    const profile = store.update(userId, body);
    const response: UpdateProfileResponse = { profile };
    res.json(response);
  });

  return router;
}
