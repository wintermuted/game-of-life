# Game of Life Backend Architecture

## Overview
Build a Node/TypeScript backend that takes over stateful persistence from browser storage, while keeping the current UI usable during migration by caching locally and syncing to the server in the background.

The current app stores boards, favorites, profile data, recent history, template names, fork lineage, theme mode, and custom color preferences in browser storage. The new backend should make the server the source of truth for authenticated users, support anonymous-first use, preserve offline/local caching, and provide a clean API boundary so the React app can stop treating localStorage/sessionStorage as its primary datastore.

## Progress

- Implemented the first backend package scaffold under `packages/api/` with an in-memory repository, HTTP server entry point, bootstrap route, and smoke test.
- Added profile, preferences, and import endpoints so the backend owns more than just board saves and favorites.
- Added an opt-in browser bridge in the app that bootstraps the backend session and syncs theme preferences when the API base URL is configured.
- Expanded ticket descriptions across existing UI issues and backend project draft items to include product requirements and acceptance criteria.
- Added PRD coverage in `docs/prd/backend-migration-and-ui-baseline.md` for ticket mapping, milestones, dependencies, and shipped UI features.

## Task Ledger

Project sync target: [GitHub project 3, `Game of Life UI`](https://github.com/users/wintermuted/projects/3).

Milestones:

- [Backend Discovery](https://github.com/wintermuted/game-of-life/milestone/2)
- [Backend API and Auth](https://github.com/wintermuted/game-of-life/milestone/3)
- [Migration and Rollout](https://github.com/wintermuted/game-of-life/milestone/4)

| Milestone | Status | Task | GitHub Project Item | Depends On |
|---|---|---|---|---|
| [Backend Discovery](https://github.com/wintermuted/game-of-life/milestone/2) | Created | [Discovery and scope lock](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGRk` | — |
| [Backend Discovery](https://github.com/wintermuted/game-of-life/milestone/2) | Created | [Domain model and data architecture](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGTA` | Discovery and scope lock |
| [Backend API and Auth](https://github.com/wintermuted/game-of-life/milestone/3) | Created | [Authentication and authorization](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGT0` | Domain model and data architecture |
| [Backend API and Auth](https://github.com/wintermuted/game-of-life/milestone/3) | Created | [API design and contract](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGUo` | Authentication and authorization |
| [Backend API and Auth](https://github.com/wintermuted/game-of-life/milestone/3) | Created | [Client integration and local cache migration](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGVQ` | API design and contract |
| [Migration and Rollout](https://github.com/wintermuted/game-of-life/milestone/4) | Created | [Migration, testing, and rollout](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGVw` | Client integration and local cache migration |
| [Migration and Rollout](https://github.com/wintermuted/game-of-life/milestone/4) | Created | [Operational and platform concerns](https://github.com/users/wintermuted/projects/3) | `PVTI_lAHOACOqLc4AAxzmzg1fGW4` | Migration, testing, and rollout |

The corresponding project draft items are now queued in the board and can be elaborated into execution details as the backend work continues.

PRD references:

- `docs/prd/backend-migration-and-ui-baseline.md`

Execution order:

1. Discovery and scope lock.
2. Domain model and data architecture.
3. Authentication and authorization.
4. API design and contract.
5. Client integration and local cache migration.
6. Migration, testing, and rollout.
7. Operational and platform concerns.

Dependency rule: each step starts only after the previous step in the list is sufficiently defined or implemented for the next step to use as its input boundary.

## Phases

### Phase A: Discovery and scope lock
1. Reconfirm which current browser-persisted entities are in scope for backend ownership and which should remain client-only, especially URL share state and ephemeral UI state.
2. Decide whether board content, favorites, recents, templates, profile, preferences, and fork lineage all live in the same backend boundary or are split across services.
3. Define the transition rule for hybrid mode: what reads come from local cache first, when the client refreshes from the server, and when optimistic updates are allowed.

### Phase B: Domain model and data architecture
1. Model the persisted entities currently represented in `packages/app/src/app/util/browserStorage.ts` as server records with explicit ownership, timestamps, visibility, and version metadata.
2. Recommend a Postgres-backed schema with JSON-capable board payloads, relational ownership tables for users/sessions/boards, and separate tables or documents for favorites, forks, recents, templates, preferences, and audit history.
3. Define whether immutable board revisions are required or whether the system can start with a mutable current-state record plus change history fields.
4. Specify migration identifiers so local records can be deduplicated and merged when a guest later claims an account.

### Phase C: Authentication and authorization
1. Use anonymous-first sign-in with a server-issued session identity on first visit, then allow upgrade to a registered account later.
2. Define session strategy, cookie policy, token rotation, and logout semantics for browser-based clients.
3. Set authorization rules by resource type: owner-only board edits, public read access for shared boards, private board isolation, user-scoped preferences, and per-user favorites/recents/templates.
4. Decide whether moderation/admin capabilities are in scope now or deferred.

### Phase D: API design and contract
1. Design a versioned REST API, or a thin BFF-style API if the frontend needs request aggregation, with consistent error envelopes and pagination/filtering patterns.
2. Include endpoints for auth/session bootstrap, profile and preferences, boards CRUD, board search/listing, favorite toggles, recent-board tracking, template name storage, fork origin tracking, and sync/bootstrap operations.
3. Define idempotency and conflict handling for repeated saves, offline retries, and last write wins versus server-merging semantics.
4. Document how public board URLs, pattern hashes, and board IDs map to server resources so old links continue to resolve.

### Phase E: Client integration and local cache migration
1. Replace the synchronous browser-storage utility with an async repository/API client and a local cache layer that preserves the current UI behavior.
2. Update `ThemeContext` and profile flows so they read from the backend when signed in, while still booting from local cache before the network round-trip completes.
3. Convert board save/edit actions in `Home.tsx` to async mutations with loading, retry, and optimistic update paths where safe.
4. Keep URL-based pattern state client-side, but make board persistence, favorites, recent items, and profile state server-backed.

### Phase F: Migration, testing, and rollout
1. Add a bootstrap or import endpoint that can ingest existing localStorage data on first sign-in or first server contact.
2. Define a migration plan that preserves user-created boards and favorites without duplication, including fallback behavior if the import partially fails.
3. Add contract tests for the API, integration tests for auth and authorization, and focused UI tests around save/favorite/profile flows.
4. Roll out behind a feature flag or environment gate so local-only behavior can remain available until the backend is stable.

### Phase G: Operational and platform concerns
1. Add validation, rate limiting, audit logging, structured error handling, observability, and API versioning from the start.
2. Define deployment, secrets, environment variables, backups, and data retention for the database and session store.
3. Decide whether Redis is needed for sessions, cache, or rate limiting, and keep the plan explicit if it is only an optimization rather than a hard dependency.
4. Clarify whether file/object storage is needed only if future features add uploads or generated artifacts.

## Relevant Files

| File | Purpose |
|---|---|
| `README.md` | Current architecture summary and the persistence model to replace |
| `packages/app/src/app/util/browserStorage.ts` | Central local persistence layer and best source for the server entity inventory |
| `packages/app/src/app/ThemeContext.tsx` | Theme preference persistence path that may move to user preferences |
| `packages/app/src/app/components/Home.tsx` | Main board save/edit flows that currently write to browser storage |
| `packages/app/src/app/components/Profile.tsx` | Profile/account UI that should become auth-aware |
| `packages/app/src/app/util/urlState.ts` | Client-side shareable pattern state that should remain local |
| planned backend service area under the game-of-life repo | API routes, persistence layer, auth/session middleware, and migration jobs |

## Verification

1. Cross-check the final entity list against the browser-storage module so no persisted state class is omitted from the backend plan.
2. Confirm the auth and offline-fallback choices are reflected consistently in the data model, API design, and client integration phases.
3. Validate that every API mutation has a clear authorization rule, error contract, and migration path.
4. After implementation later, verify with backend tests, client tests, and a small end-to-end save/login flow.

## Decisions

1. Use a Node/TypeScript backend.
2. Assume anonymous-first onboarding with later account upgrade, not mandatory registration up front.
3. Keep a hybrid local-cache plus server-source-of-truth model so the client remains usable during network outages and while syncing.
4. Treat URL-based sharing as client-local unless a later requirement explicitly needs server-hosted share links.
5. Prefer Postgres as the primary database, with Redis only if session, cache, or rate-limiting needs justify it.
6. Keep the plan scoped to backend architecture and client integration points, not implementation details of unrelated UI features.

## Further Considerations

1. Should the backend live in the same repo as the app or be split into a separate service/repo?
2. Do you want to standardize on REST only, or allow a thin BFF layer if it simplifies the React client?
3. Do you want a one-time import of old local data on first sign-in, or an ongoing sync/merge path for anonymous sessions that later become registered accounts?