import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that validates the `:userId` route parameter is a non-empty string.
 * In a production environment this would be replaced by a proper auth middleware
 * that verifies a JWT/session token and sets `req.params.userId` from the
 * authenticated identity.
 */
export function requireUserId(req: Request, res: Response, next: NextFunction): void {
  const { userId } = req.params as { userId?: string };
  if (!userId || userId.trim().length === 0) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }
  next();
}
