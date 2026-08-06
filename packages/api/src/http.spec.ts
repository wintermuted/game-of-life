import { afterEach, describe, expect, it } from 'vitest';

import { createGameOfLifeServer } from './http';
import { InMemoryGameOfLifeRepository } from './inMemoryRepository';

describe('game of life api', () => {
  let server: ReturnType<typeof createGameOfLifeServer> | null = null;

  afterEach(() => {
    server?.close();
    server = null;
  });

  it('boots anonymous sessions and serves a bootstrap snapshot', async () => {
    const repository = new InMemoryGameOfLifeRepository();
    server = createGameOfLifeServer(repository);

    await new Promise<void>((resolve) => server!.listen(0, resolve));
    const address = server!.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected a bound TCP address');
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    const sessionResponse = await fetch(`${baseUrl}/api/v1/sessions/anonymous`, { method: 'POST' });
    expect(sessionResponse.status).toBe(201);

    const sessionPayload = await sessionResponse.json() as {
      session: { sessionId: string };
    };

    const bootstrapResponse = await fetch(`${baseUrl}/api/v1/bootstrap`, {
      headers: {
        cookie: `gol.sid=${sessionPayload.session.sessionId}`,
      },
    });

    expect(bootstrapResponse.status).toBe(200);
    const bootstrapPayload = await bootstrapResponse.json() as {
      session: { sessionId: string };
      boards: unknown[];
    };
    expect(bootstrapPayload.session.sessionId).toBe(sessionPayload.session.sessionId);
    expect(bootstrapPayload.boards).toEqual([]);
  });
});