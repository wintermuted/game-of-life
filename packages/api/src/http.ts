import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { parse as parseUrl } from 'node:url';

import { GameRules, LifeGrid } from '@game-of-life/core';

import { ApiErrorShape, BootstrapSnapshot, ImportSnapshot, UpdatePreferencesInput, UpdateProfileInput } from './domain';
import { GameOfLifeRepository } from './storage';

interface RouteContext {
  repository: GameOfLifeRepository;
}

const COORDINATE_PATTERN = /^-?\d+,-?\d+$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function sendJson(response: ServerResponse, statusCode: number, body: unknown, headers: Record<string, string> = {}): void {
  const origin = headers['access-control-allow-origin'] ?? '*';
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origin,
    'access-control-allow-headers': 'content-type, x-gol-session',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    ...headers,
  });
  response.end(JSON.stringify(body));
}

function sendError(response: ServerResponse, statusCode: number, code: string, message: string): void {
  const payload: ApiErrorShape = { error: { code, message } };
  sendJson(response, statusCode, payload);
}

function readCookie(request: IncomingMessage, name: string): string | null {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!entry) return null;

  return decodeURIComponent(entry.slice(name.length + 1));
}

function getSessionId(request: IncomingMessage): string | null {
  return readCookie(request, 'gol.sid') ?? (typeof request.headers['x-gol-session'] === 'string' ? request.headers['x-gol-session'] : null);
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as Record<string, unknown>;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseLifeGrid(value: unknown): LifeGrid | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  const parsed = value as Record<string, unknown>;
  const normalized: LifeGrid = {};

  for (const [coordinate, cell] of Object.entries(parsed)) {
    if (!COORDINATE_PATTERN.test(coordinate)) {
      return null;
    }

    if (!isString(cell) || !HEX_COLOR_PATTERN.test(cell)) {
      return null;
    }

    normalized[coordinate] = cell;
  }

  return normalized;
}

function requireSession(context: RouteContext, request: IncomingMessage, response: ServerResponse) {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    sendError(response, 401, 'unauthorized', 'Missing session. Call POST /api/v1/sessions/anonymous first.');
    return null;
  }

  const session = context.repository.getSession(sessionId);
  if (!session) {
    sendError(response, 401, 'unauthorized', 'Unknown session.');
    return null;
  }

  return session;
}

async function handleRequest(context: RouteContext, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const parsed = parseUrl(request.url ?? '/', true);
  const pathname = parsed.pathname ?? '/';
  const boardMatch = pathname.match(/^\/api\/v1\/boards\/([^/]+)$/);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {}, request.headers.origin ? { 'access-control-allow-origin': request.headers.origin } : {});
    return;
  }

  if (request.method === 'GET' && pathname === '/healthz') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/sessions/anonymous') {
    const { session, profile } = context.repository.createAnonymousSession();
    sendJson(
      response,
      201,
      { session, profile },
      {
        ...(request.headers.origin ? { 'access-control-allow-origin': request.headers.origin } : {}),
        'set-cookie': `gol.sid=${encodeURIComponent(session.sessionId)}; HttpOnly; Path=/; SameSite=Lax`,
      },
    );
    return;
  }

  const session = requireSession(context, request, response);
  if (!session) {
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/me') {
    sendJson(response, 200, {
      session,
      profile: context.repository.getProfile(session.userId),
      preferences: context.repository.getPreferences(session.userId),
    });
    return;
  }

  if (request.method === 'PATCH' && pathname === '/api/v1/me/profile') {
    const body = await readJsonBody(request);
    if (!body) {
      sendError(response, 400, 'invalid_request', 'Expected profile fields in request body.');
      return;
    }

    const input: UpdateProfileInput = {
      displayName: isString(body.displayName) ? body.displayName : undefined,
      email: isString(body.email) ? body.email : undefined,
      timezone: isString(body.timezone) ? body.timezone : undefined,
      favoritePalette: isString(body.favoritePalette) ? body.favoritePalette : undefined,
      avatarInitials: isString(body.avatarInitials) ? body.avatarInitials : undefined,
      memberSince: isString(body.memberSince) ? body.memberSince : undefined,
    };

    const profile = context.repository.upsertProfile({ ...input, userId: session.userId });
    sendJson(response, 200, { profile });
    return;
  }

  if (request.method === 'PATCH' && pathname === '/api/v1/me/preferences') {
    const body = await readJsonBody(request);
    if (!body) {
      sendError(response, 400, 'invalid_request', 'Expected preference fields in request body.');
      return;
    }

    const preferences: UpdatePreferencesInput = {
      themeMode: body.themeMode === 'dark' ? 'dark' : body.themeMode === 'light' ? 'light' : undefined,
      customColors: typeof body.customColors === 'object' && body.customColors !== null ? (body.customColors as Record<string, string>) : undefined,
      storageMode: body.storageMode === 'session' ? 'session' : body.storageMode === 'local' ? 'local' : undefined,
    };

    const next = context.repository.updatePreferences(session.userId, preferences);
    sendJson(response, 200, { preferences: next });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/bootstrap') {
    const bootstrap = context.repository.bootstrap(session.sessionId);
    sendJson(response, 200, bootstrap);
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/boards') {
    sendJson(response, 200, { boards: context.repository.listBoards(session.userId) });
    return;
  }

  if (request.method === 'GET' && boardMatch) {
    const boardId = decodeURIComponent(boardMatch[1]);
    const board = context.repository.getBoard(session.userId, boardId);

    if (!board) {
      sendError(response, 404, 'not_found', `Board '${boardId}' was not found.`);
      return;
    }

    sendJson(response, 200, { board });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/boards') {
    const body = await readJsonBody(request);
    const grid = body ? parseLifeGrid(body.grid) : null;

    if (!body || !isNonEmptyString(body.hash) || !isNonEmptyString(body.title) || grid === null) {
      sendError(response, 400, 'invalid_request', 'Expected non-empty hash, title, and a valid grid in request body.');
      return;
    }

    const board = context.repository.upsertBoard(session.userId, {
      boardId: isString(body.boardId) ? body.boardId : undefined,
      hash: body.hash.trim(),
      grid,
      title: body.title.trim(),
      category: isString(body.category) ? body.category : undefined,
      description: isString(body.description) ? body.description : undefined,
      tags: Array.isArray(body.tags) ? body.tags.filter(isString) : undefined,
      visibility: body.visibility === 'public' ? 'public' : 'private',
      rules: typeof body.rules === 'object' && body.rules !== null ? (body.rules as GameRules) : undefined,
      rulesLocked: typeof body.rulesLocked === 'boolean' ? body.rulesLocked : undefined,
    });

    sendJson(response, 200, { board });
    return;
  }

  if (request.method === 'DELETE' && boardMatch) {
    const boardId = decodeURIComponent(boardMatch[1]);
    const deleted = context.repository.deleteBoard(session.userId, boardId);

    if (!deleted) {
      sendError(response, 404, 'not_found', `Board '${boardId}' was not found.`);
      return;
    }

    sendJson(response, 200, { deleted: true });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/favorites/toggle') {
    const body = await readJsonBody(request);
    if (!body || !isString(body.hash) || !isString(body.title)) {
      sendError(response, 400, 'invalid_request', 'Expected hash and title in request body.');
      return;
    }

    const result = context.repository.toggleFavorite(session.userId, { hash: body.hash, title: body.title });
    sendJson(response, 200, result);
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/favorites') {
    sendJson(response, 200, { favorites: context.repository.listFavorites(session.userId) });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/recents') {
    sendJson(response, 200, { recents: context.repository.listRecents(session.userId) });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/recents') {
    const body = await readJsonBody(request);
    if (!body || !isString(body.boardId) || !isString(body.hash) || !isString(body.title)) {
      sendError(response, 400, 'invalid_request', 'Expected boardId, hash, and title in request body.');
      return;
    }

    const record = context.repository.trackRecent(session.userId, body.boardId, body.hash, body.title);
    sendJson(response, 200, { record });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/forks') {
    const body = await readJsonBody(request);
    if (!body || !isString(body.hash) || !isString(body.parentHash) || !isString(body.parentTitle) || !isString(body.forkerName)) {
      sendError(response, 400, 'invalid_request', 'Expected fork origin fields in request body.');
      return;
    }

    const record = context.repository.upsertForkOrigin({
      hash: body.hash,
      parentHash: body.parentHash,
      parentTitle: body.parentTitle,
      parentSource: body.parentSource === 'system' ? 'system' : 'user',
      parentCreatorName: isString(body.parentCreatorName) ? body.parentCreatorName : undefined,
      forkerName: body.forkerName,
      forkedPatternTitle: isString(body.forkedPatternTitle) ? body.forkedPatternTitle : undefined,
    });

    sendJson(response, 200, { record });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/v1/forks') {
    sendJson(response, 200, { forks: context.repository.listForkOrigins() });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/v1/bootstrap/import') {
    const body = await readJsonBody(request);
    if (!body || typeof body !== 'object') {
      sendError(response, 400, 'invalid_request', 'Expected import snapshot in request body.');
      return;
    }

    const snapshot: ImportSnapshot = {
      boards: Array.isArray(body.boards) ? (body.boards as ImportSnapshot['boards']) : undefined,
      favorites: Array.isArray(body.favorites) ? (body.favorites as ImportSnapshot['favorites']) : undefined,
      recents: Array.isArray(body.recents) ? (body.recents as ImportSnapshot['recents']) : undefined,
      forks: Array.isArray(body.forks) ? (body.forks as ImportSnapshot['forks']) : undefined,
      profile: typeof body.profile === 'object' && body.profile !== null ? (body.profile as ImportSnapshot['profile']) : undefined,
      preferences: typeof body.preferences === 'object' && body.preferences !== null ? (body.preferences as ImportSnapshot['preferences']) : undefined,
    };

    const imported = context.repository.importSnapshot(session.userId, snapshot);
    sendJson(response, 200, imported);
    return;
  }

  sendError(response, 404, 'not_found', `No route matches ${request.method ?? 'GET'} ${pathname}`);
}

export function createGameOfLifeServer(repository: GameOfLifeRepository) {
  return createServer((request, response) => {
    void handleRequest({ repository }, request, response).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unexpected server error';
      sendError(response, 500, 'internal_error', message);
    });
  });
}

export function parseBootstrapSnapshot(snapshot: BootstrapSnapshot): BootstrapSnapshot {
  return snapshot;
}