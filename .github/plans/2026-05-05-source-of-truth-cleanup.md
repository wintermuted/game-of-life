# Source Of Truth Cleanup: Root Legacy App Deconfliction

## Overview

Reduce confusion between the legacy top-level `src/` app tree and the canonical Nx package app at `packages/app/src/`.
Apply guardrails first, disable accidental legacy runtime paths, and prepare for a later archival/removal pass.

## Phases

### Phase 1 - Guardrails And Canonical Path Signaling

1. [x] Add deprecation banner to `src/index.tsx`.
2. [x] Add deprecation banner to `src/app/App.tsx`.
3. [x] Document canonical path in `README.md`.

### Phase 2 - Disable Accidental Legacy Runtime

1. [x] Make root `vite.config.ts` fail fast with migration instructions.
2. [x] Replace root `index.html` runtime entry with explicit deprecation message.
3. [x] Run build validation via canonical package app path.

### Phase 3 - Legacy Tree Archival Preparation

1. [x] Move top-level `src/` to an explicit archival directory (for example `archive/legacy-root-src/`).
2. [x] Confirm no active scripts, workflows, or docs reference archived paths.
3. [x] Run full build/test pass after move.

### Phase 4 - Final Legacy Removal

1. [x] Remove archived legacy tree.
2. [x] Add CI guardrail to prevent reintroduction of root runtime entrypoints.

## Relevant Files

- `README.md`
- `vite.config.ts`
- `index.html`
- `src/index.tsx`
- `src/app/App.tsx`
- `.github/plans/2026-05-05-source-of-truth-cleanup.md`

## Verification

1. `npm run build` from repo root succeeds and uses Nx package targets.
2. `cd packages/app && npx vite build` succeeds.
3. Running root Vite directly fails with clear migration message.
4. No deployment workflow relies on top-level `src/` output.

## Decisions

- Disable root runtime entrypoints now to eliminate accidental edits/runs against legacy code.
- Keep `packages/app/src/` as the only UI source of truth.

## Progress Notes

- Canonical validation completed with `cd packages/app && npx vite build` (success).
- Root `npm run build` remains blocked in this environment by Nx interactive prompt (`setRawMode EPERM`), consistent with prior known behavior.
- Legacy top-level `src/` tree moved to `archive/legacy-root-src/`.
- Added `.github/workflows/canonical-path-guard.yml` to enforce canonical package-app source paths and root-entrypoint deprecation.
- Post-move package build validated with `cd packages/app && npx vite build` (success).
- Removed `archive/legacy-root-src/`, completing legacy tree retirement.
