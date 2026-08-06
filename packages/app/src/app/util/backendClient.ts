type FetchInit = RequestInit;

interface SessionIdentity {
  sessionId: string;
  kind: 'anonymous' | 'registered';
  userId: string;
  createdAt: string;
}

interface UserPreferences {
  themeMode: 'light' | 'dark';
  customColors: Record<string, string>;
  storageMode: 'local' | 'session';
}

interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  timezone: string;
  favoritePalette: string;
  avatarInitials: string;
  memberSince: string;
}

interface MePayload {
  session: SessionIdentity;
  profile: UserProfile;
  preferences: UserPreferences;
}

const sessionBootstrapPromise = new Map<string, Promise<void>>();

function getApiBaseUrl(): string {
  return import.meta.env.VITE_GAME_OF_LIFE_API_BASE_URL?.trim() ?? '';
}

function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

async function requestJson<T>(path: string, init?: FetchInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function isBackendEnabled(): boolean {
  return getApiBaseUrl().length > 0;
}

export async function ensureBackendSession(): Promise<void> {
  if (!isBackendEnabled()) {
    return;
  }

  const cacheKey = getApiBaseUrl() || 'same-origin';
  const existing = sessionBootstrapPromise.get(cacheKey);
  if (existing) {
    return existing;
  }

  const bootstrap = (async () => {
    await requestJson<{ session: SessionIdentity }>('/api/v1/sessions/anonymous', { method: 'POST' });
  })();

  sessionBootstrapPromise.set(cacheKey, bootstrap);

  try {
    await bootstrap;
  } finally {
    sessionBootstrapPromise.delete(cacheKey);
  }
}

export async function loadCurrentUserPreferences(): Promise<UserPreferences | null> {
  if (!isBackendEnabled()) {
    return null;
  }

  try {
    await ensureBackendSession();
    const payload = await requestJson<MePayload>('/api/v1/me');
    return payload.preferences;
  } catch {
    return null;
  }
}

export async function loadCurrentUserProfile(): Promise<UserProfile | null> {
  if (!isBackendEnabled()) {
    return null;
  }

  try {
    await ensureBackendSession();
    const payload = await requestJson<MePayload>('/api/v1/me');
    return payload.profile;
  } catch {
    return null;
  }
}

export async function updateCurrentUserPreferences(next: Partial<UserPreferences>): Promise<UserPreferences | null> {
  if (!isBackendEnabled()) {
    return null;
  }

  try {
    await ensureBackendSession();
    const payload = await requestJson<{ preferences: UserPreferences }>('/api/v1/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(next),
    });
    return payload.preferences;
  } catch {
    return null;
  }
}