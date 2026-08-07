# Backend Board CRUD Hardening: Grid Persistence and Validation

## Overview
This plan hardens the existing board CRUD backend by persisting board grid state directly in board records, tightening request validation for board writes, and expanding API tests to cover invalid payloads and full CRUD behavior. The goal is to align the API contract with frontend board state needs while reducing malformed data acceptance.

## Phases

### Phase A: API Contract and Domain Updates
- [x] 1. Add a `grid` field to board domain models so board records persist the LifeGrid payload.
- [x] 2. Update board upsert input types to require `grid` on writes.
- [x] 3. Keep compatibility fields (`hash`, metadata, rules) unchanged to avoid frontend breakage.

### Phase B: Validation and Request Handling
- [x] 1. Add server-side validators for board payload shape:
  - `hash` and `title` must be non-empty strings.
  - `grid` must be an object with `x,y` coordinate keys and hex color string values.
- [x] 2. Update `POST /api/v1/boards` parsing to reject malformed inputs with 400 responses.
- [x] 3. Preserve existing auth/session behavior and response shape.

### Phase C: Repository Persistence Semantics
- [x] 1. Persist `grid` in `upsertBoard` and ensure updates overwrite grid and metadata consistently.
- [x] 2. Keep existing board ownership checks and list/get/delete semantics.

### Phase D: Test Coverage Expansion
- [x] 1. Expand API tests for successful create/get/update/delete lifecycle including `grid` assertions.
- [x] 2. Add negative tests for invalid board payloads (missing grid, invalid coordinate key, invalid cell color, empty title/hash).
- [x] 3. Ensure tests continue to validate bootstrap/session behavior.

## Relevant Files

| File | Purpose |
| --- | --- |
| `packages/api/src/domain.ts` | Board and upsert model definitions |
| `packages/api/src/http.ts` | Request parsing and validation for board endpoints |
| `packages/api/src/inMemoryRepository.ts` | In-memory persistence behavior for boards |
| `packages/api/src/http.spec.ts` | API integration tests for CRUD and validation |

## Verification
- Run API tests: `npm run test --workspace @game-of-life/api`
- Optionally run workspace tests: `npm test`
- Confirm tests assert persisted `grid` data on create/read/update and expected 400s for invalid payloads.

## Decisions
- Include `grid` persistence in the board record to make API board retrieval self-contained.
- Enforce strict validation at the HTTP boundary rather than accepting loose casts.
- Avoid introducing new dependencies; implement validation with lightweight local helpers.
- Keep route set and response envelope unchanged to minimize client migration cost.
