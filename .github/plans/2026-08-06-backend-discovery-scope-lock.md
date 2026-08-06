# Game of Life Backend: Discovery and Scope Lock

Closes wintermuted/game-of-life#105

## Overview

Phase A establishes the backend migration contract for every browser-persisted entity that currently exists in the app. This document locks ownership boundaries, defines hybrid local/server behavior during migration, and sets explicit downstream scope for Phases B through G.

## Phase A Deliverables

### 1) Signed-off scope matrix

Sign-off status: **Approved for Phases B-G implementation**

| Persisted entity | Current storage | Scope decision | Migration ownership | Notes |
| --- | --- | --- | --- | --- |
| Saved boards (`savedBoards`) | local/session storage | **Server-owned** | Server canonical, local cached | User-generated board content and metadata are account data. |
| Favorites (`favoriteBoards`) | local/session storage | **Server-owned** | Server canonical, local cached | Favorite relationships are account + social graph data. |
| Recents (`recentBoards`) | local/session storage | **Server-owned** | Server canonical, local cached | Cross-device continuity expected for "recently opened" history. |
| Fork origins (`forkOrigins`) | local/session storage | **Server-owned** | Server canonical, local cached | Fork lineage is shared/social metadata and must be authoritative. |
| Profile (`profileUser`) | local/session storage | **Server-owned** | Server canonical, local cached | Account profile settings belong to authenticated identity. |
| Template names (`savedTemplateNames`) | local/session storage | **Server-owned** | Server canonical, local cached | User naming of board hashes is user library metadata. |
| Preferences: theme (`themeMode`) | local storage | **Client-only** | Client local only | Device/UI preference, not required for backend phase. |
| Preferences: language (i18n detector cache) | browser language cache | **Client-only** | Client local only | Browser-locale and per-device preference remain local. |
| Storage mode (`gol.storage.mode`) | local storage | **Client-only (migration toggle)** | Client local only | Temporary migration/testing control; removed after backend cutover. |
| Social seed flag (`socialSeed.v1`) | local/session storage | **Client-only (dev/demo seed)** | Client local only | Demo bootstrap helper; excluded from backend data model. |

### 2) Hybrid read/write migration behavior

#### Bootstrap and read path

1. On app start, read local cache first to render immediately (no blocking spinner for persisted entities).
2. If online and authenticated, request server snapshot for server-owned entities.
3. Reconcile local cache against server and write reconciled view back to local cache.
4. Client-only entities are never fetched from server and remain device-local.

#### Reconciliation timing

- **Initial reconciliation**: once after auth/session restoration on app boot.
- **Foreground reconciliation**: when app returns online (`offline -> online`) and user is authenticated.
- **Manual reconciliation**: when user triggers explicit refresh/retry after sync failure.

#### Conflict strategy (server-owned entities)

- **Saved boards / template names / profile**: last-write-wins using server `updatedAt` as source of truth.
- **Favorites**: set-union by board ID + actor identity; delete/toggle resolved by latest server timestamp.
- **Recents**: merge by board ID, keep max timestamp per board, trim to server limit.
- **Fork origins**: immutable append by fork ID/hash; duplicates collapsed by canonical fork key.

#### Offline fallback behavior

- Writes to server-owned entities while offline update local cache immediately (optimistic local UX).
- Offline writes are queued as pending mutations and replayed when online.
- If replay fails with conflict, server result wins and local cache is updated; user receives non-blocking sync notice.
- If unauthenticated, app operates local-only; server sync starts only after authentication.

### 3) Public-share URL and pattern-state boundaries

- Public share URLs remain stateless and include only URL-safe pattern/play context (for example `pattern`, `board`, `catalog`, `mode`, `ruleset`).
- URL state is **not** an authenticated persistence channel and must not include private profile/account fields.
- Opening a shared URL may hydrate runtime board state, but does not implicitly persist to backend until user performs an explicit save/favorite/fork action.
- Explore/Profile query params are treated as view/filter state only and are excluded from backend persisted entity models.

## Phase B-G scope lock (downstream)

### Phase B — Backend schema and API contracts

- [ ] Implement server models only for entities marked **Server-owned** in this matrix.
- [ ] Exclude all **Client-only** entities from backend schema/migrations.
- [ ] Add per-entity `updatedAt` and stable IDs required by conflict strategy.

### Phase C — Client data access layer

- [ ] Introduce repository layer with split handling: server-owned vs client-only.
- [ ] Keep bootstrap-first local reads, then reconcile from server.
- [ ] Persist reconciliation outputs back to local cache.

### Phase D — Sync engine and offline queue

- [ ] Add pending mutation queue for server-owned entity writes while offline.
- [ ] Trigger reconciliation on `offline -> online` transition and post-auth.
- [ ] Surface non-blocking sync status for replay success/conflicts.

### Phase E — URL/share integration hardening

- [ ] Enforce boundary that URL/query state never transports private account/profile data.
- [ ] Ensure share-link hydration does not auto-save to backend.
- [ ] Add regression coverage for allowed URL params and blocked private fields.

### Phase F — Migration rollout and compatibility

- [ ] Backfill server-owned records from existing local cache on first authenticated session.
- [ ] Keep local cache compatibility until rollout completion.
- [ ] Remove `gol.storage.mode` migration toggle after full cutover.

### Phase G — Verification and launch gates

- [ ] Add test matrix for online/offline transitions and conflict cases defined above.
- [ ] Validate server/client ownership boundaries per entity via integration tests.
- [ ] Sign off that Phase A scope decisions remain unchanged or explicitly versioned if modified.

## Testability checklist (Phase A outputs)

- [ ] Scenario: offline launch with populated cache, then online reconciliation merges server-owned entities.
- [ ] Scenario: offline edits to saved boards/favorites/recents replay after reconnect.
- [ ] Scenario: conflicting edits between two devices resolve per entity strategy.
- [ ] Scenario: URL share opens pattern without leaking profile/preferences to backend payloads.
- [ ] Scenario: client-only preferences (theme/language) never hit backend APIs.

## Source inventory references

- `packages/app/src/app/util/browserStorage.ts`
- `packages/app/src/app/ThemeContext.tsx`
- `packages/app/src/i18n/config.ts`
- `packages/app/src/app/util/urlState.ts`
- `packages/app/src/app/components/Home.tsx`
- `packages/app/src/app/components/Explore.tsx`
- `packages/app/src/app/components/Profile.tsx`
