import { afterEach, describe, expect, it } from 'vitest';

import { createGameOfLifeServer } from './http';
import { InMemoryGameOfLifeRepository } from './inMemoryRepository';

async function startServerWithSession() {
  const repository = new InMemoryGameOfLifeRepository();
  const server = createGameOfLifeServer(repository);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Expected a bound TCP address');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const sessionResponse = await fetch(`${baseUrl}/api/v1/sessions/anonymous`, { method: 'POST' });
  expect(sessionResponse.status).toBe(201);

  const sessionPayload = await sessionResponse.json() as {
    session: { sessionId: string };
  };

  return { server, baseUrl, sessionId: sessionPayload.session.sessionId };
}

describe('game of life api', () => {
  let server: ReturnType<typeof createGameOfLifeServer> | null = null;

  afterEach(() => {
    server?.close();
    server = null;
  });

  it('boots anonymous sessions and serves a bootstrap snapshot', async () => {
    const setup = await startServerWithSession();
    server = setup.server;
    const { baseUrl, sessionId } = setup;

    const bootstrapResponse = await fetch(`${baseUrl}/api/v1/bootstrap`, {
      headers: {
        cookie: `gol.sid=${sessionId}`,
      },
    });

    expect(bootstrapResponse.status).toBe(200);
    const bootstrapPayload = await bootstrapResponse.json() as {
      session: { sessionId: string };
      boards: unknown[];
    };
    expect(bootstrapPayload.session.sessionId).toBe(sessionId);
    expect(bootstrapPayload.boards).toEqual([]);
  });

  it('persists board grid across create, update, fetch, and delete', async () => {
    const setup = await startServerWithSession();
    server = setup.server;
    const { baseUrl, sessionId } = setup;

    const createBoardResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'my-board',
        hash: 'abc123',
        title: 'My Board',
        grid: {
          '0,0': '#22c55e',
          '1,0': '#16a34a',
        },
      }),
    });

    expect(createBoardResponse.status).toBe(200);
    const created = await createBoardResponse.json() as {
      board: { boardId: string; title: string; grid: Record<string, string> };
    };
    expect(created.board.boardId).toBe('my-board');
    expect(created.board.title).toBe('My Board');
    expect(created.board.grid).toEqual({
      '0,0': '#22c55e',
      '1,0': '#16a34a',
    });

    const updateBoardResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'my-board',
        hash: 'def456',
        title: ' Updated Board ',
        grid: {
          '2,2': '#14532d',
        },
      }),
    });

    expect(updateBoardResponse.status).toBe(200);
    const updated = await updateBoardResponse.json() as {
      board: { hash: string; title: string; grid: Record<string, string> };
    };
    expect(updated.board.hash).toBe('def456');
    expect(updated.board.title).toBe('Updated Board');
    expect(updated.board.grid).toEqual({
      '2,2': '#14532d',
    });

    const getBoardResponse = await fetch(`${baseUrl}/api/v1/boards/my-board`, {
      headers: {
        cookie: `gol.sid=${sessionId}`,
      },
    });

    expect(getBoardResponse.status).toBe(200);
    const getBoardPayload = await getBoardResponse.json() as {
      board: { boardId: string; hash: string; title: string; grid: Record<string, string> };
    };
    expect(getBoardPayload.board.boardId).toBe('my-board');
    expect(getBoardPayload.board.hash).toBe('def456');
    expect(getBoardPayload.board.title).toBe('Updated Board');
    expect(getBoardPayload.board.grid).toEqual({
      '2,2': '#14532d',
    });

    const deleteBoardResponse = await fetch(`${baseUrl}/api/v1/boards/my-board`, {
      method: 'DELETE',
      headers: {
        cookie: `gol.sid=${sessionId}`,
      },
    });

    expect(deleteBoardResponse.status).toBe(200);

    const getMissingBoardResponse = await fetch(`${baseUrl}/api/v1/boards/my-board`, {
      headers: {
        cookie: `gol.sid=${sessionId}`,
      },
    });

    expect(getMissingBoardResponse.status).toBe(404);
  });

  it('rejects malformed board payloads', async () => {
    const setup = await startServerWithSession();
    server = setup.server;
    const { baseUrl, sessionId } = setup;

    const missingGridResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'invalid-1',
        hash: 'abc123',
        title: 'Missing Grid',
      }),
    });

    expect(missingGridResponse.status).toBe(400);

    const invalidCoordinateResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'invalid-2',
        hash: 'abc123',
        title: 'Invalid Coordinate',
        grid: {
          '0|0': '#22c55e',
        },
      }),
    });

    expect(invalidCoordinateResponse.status).toBe(400);

    const invalidColorResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'invalid-3',
        hash: 'abc123',
        title: 'Invalid Color',
        grid: {
          '0,0': 'green',
        },
      }),
    });

    expect(invalidColorResponse.status).toBe(400);

    const emptyHashResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'invalid-4',
        hash: '   ',
        title: 'Invalid Hash',
        grid: {},
      }),
    });

    expect(emptyHashResponse.status).toBe(400);

    const emptyTitleResponse = await fetch(`${baseUrl}/api/v1/boards`, {
      method: 'POST',
      headers: {
        cookie: `gol.sid=${sessionId}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        boardId: 'invalid-5',
        hash: 'abc123',
        title: '   ',
        grid: {},
      }),
    });

    expect(emptyTitleResponse.status).toBe(400);
  });
});