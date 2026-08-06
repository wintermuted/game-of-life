# Game of Life Product Requirements: UI Baseline and Backend Migration

## Table of Contents
- [1. Overview](#1-overview)
- [2. Product Goals](#2-product-goals)
- [3. Scope Boundaries](#3-scope-boundaries)
- [4. UI Baseline Requirements (Completed)](#4-ui-baseline-requirements-completed)
	- [4.1 Issue 15: Create Base UI](#41-issue-15-create-base-ui)
	- [4.2 Issue 16: UI Grid Can Be Set By User](#42-issue-16-ui-grid-can-be-set-by-user)
	- [4.3 Issue 17: User Can Click Coordinates To Create Live Cells](#43-issue-17-user-can-click-coordinates-to-create-live-cells)
	- [4.4 Issue 18: User Can Select Preset Forms](#44-issue-18-user-can-select-preset-forms)
	- [4.5 Issue 19: Grid Can Be Cleared](#45-issue-19-grid-can-be-cleared)
	- [4.6 Issue 20: Grid Can Be Reset To Initial Generation](#46-issue-20-grid-can-be-reset-to-initial-generation)
	- [4.7 Issue 21: Browser Execution Performance](#47-issue-21-browser-execution-performance)
- [5. Backend Migration Requirements (In Progress)](#5-backend-migration-requirements-in-progress)
	- [5.1 Milestones](#51-milestones)
	- [5.2 Task Chain (Project 3)](#52-task-chain-project-3)
- [6. Implemented Backend Features So Far](#6-implemented-backend-features-so-far)
- [7. Acceptance Criteria For This PRD Snapshot](#7-acceptance-criteria-for-this-prd-snapshot)
- [8. Risks and Mitigations](#8-risks-and-mitigations)

## 1. Overview
This document captures product requirements for:

1. Completed baseline UI capabilities in the Game of Life app.
2. In-progress backend migration that moves persisted entities from browser storage to server-owned state.

Project board: https://github.com/users/wintermuted/projects/3  
Backend implementation PR: https://github.com/wintermuted/game-of-life/pull/104

## 2. Product Goals
- Preserve a simple, playable Game of Life experience.
- Keep existing UI behavior intact while introducing backend persistence behind configuration.
- Move durable user state from browser storage to backend ownership safely.

## 3. Scope Boundaries
In scope:
- UI play/edit features already shipped and tracked as completed issues.
- Backend API scaffolding for session bootstrap, profile/preferences, boards, favorites, recents, forks, and bootstrap import.
- Incremental app integration behind `VITE_GAME_OF_LIFE_API_BASE_URL`.

Out of scope:
- Multi-user collaboration.
- Full production hardening of infrastructure in this phase.
- Mandatory authentication before app usage.

## 4. UI Baseline Requirements (Completed)

### 4.1 Issue 15: Create Base UI
Link: https://github.com/wintermuted/game-of-life/issues/15

Requirement summary:
- Provide a usable primary UI with grid and controls.
- Expose game interactions from one screen.

Acceptance summary:
- Grid and controls render on load.
- User can start/stop simulation.

### 4.2 Issue 16: UI Grid Can Be Set By User
Link: https://github.com/wintermuted/game-of-life/issues/16

Requirement summary:
- User can configure grid dimensions.

Acceptance summary:
- Grid dimensions are configurable with validation and predictable rerender behavior.

### 4.3 Issue 17: User Can Click Coordinates To Create Live Cells
Link: https://github.com/wintermuted/game-of-life/issues/17

Requirement summary:
- User can author custom patterns by interacting with grid cells.

Acceptance summary:
- Clicking an empty cell marks it live and updates view immediately.

### 4.4 Issue 18: User Can Select Preset Forms
Link: https://github.com/wintermuted/game-of-life/issues/18

Requirement summary:
- User can apply predefined patterns quickly.

Acceptance summary:
- Presets are selectable and render correctly into the grid.

### 4.5 Issue 19: Grid Can Be Cleared
Link: https://github.com/wintermuted/game-of-life/issues/19

Requirement summary:
- User can clear all live cells in one action.

Acceptance summary:
- Grid clears and remains immediately usable.

### 4.6 Issue 20: Grid Can Be Reset To Initial Generation
Link: https://github.com/wintermuted/game-of-life/issues/20

Requirement summary:
- User can restore baseline generation state for replay.

Acceptance summary:
- Reset consistently restores initial arrangement.

### 4.7 Issue 21: Browser Execution Performance
Link: https://github.com/wintermuted/game-of-life/issues/21

Requirement summary:
- Simulation and controls remain responsive at practical grid sizes.

Acceptance summary:
- Start/stop/step remains usable while simulation is running.

## 5. Backend Migration Requirements (In Progress)

### 5.1 Milestones
- Backend Discovery: https://github.com/wintermuted/game-of-life/milestone/2
- Backend API and Auth: https://github.com/wintermuted/game-of-life/milestone/3
- Migration and Rollout: https://github.com/wintermuted/game-of-life/milestone/4

### 5.2 Task Chain (Project 3)
All tasks are tracked in project 3 and currently represented as draft issues with requirement-rich descriptions.

1. Discovery and scope lock
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGRk`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46R0`
- Requirement: finalize persisted-entity scope and hybrid sync behavior.

2. Domain model and data architecture
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGTA`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46R4`
- Requirement: define canonical entities and storage shape.

3. Authentication and authorization
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGT0`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46R8`
- Requirement: anonymous-first session model and per-resource access rules.

4. API design and contract
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGUo`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46SA`
- Requirement: versioned API, validation, errors, idempotency/conflict behavior.

5. Client integration and local cache migration
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGVQ`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46SE`
- Requirement: async client integration while preserving local-only fallback.

6. Migration, testing, and rollout
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGVw`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46SI`
- Requirement: import/bootstrap migration and verification coverage.

7. Operational and platform concerns
- Project item ID: `PVTI_lAHOACOqLc4AAxzmzg1fGW4`
- Draft content ID: `DI_lAHOACOqLc4AAxzmzgK46SM`
- Requirement: readiness controls (logging, rate limiting, env/secrets, retention).

Dependency rule:
- Execute the chain in order; each step depends on completion/sign-off of the prior step.

## 6. Implemented Backend Features So Far
Backend scaffold currently provides:
- Anonymous session bootstrap endpoint.
- Profile and preferences retrieval/update endpoints.
- Boards list/upsert endpoints.
- Favorites, recents, and fork lineage endpoints.
- Bootstrap import endpoint for migration.

Client integration currently provides:
- Opt-in backend usage gated by `VITE_GAME_OF_LIFE_API_BASE_URL`.
- Session initialization through backend when enabled.
- Theme preference and profile hydration/sync paths via backend.
- Local-only behavior preserved when backend is disabled.

## 7. Acceptance Criteria For This PRD Snapshot
- Ticket descriptions for backend tasks and historical UI issues include product requirement structure.
- Project board and milestone links are documented in-repo.
- Current implementation state (done vs in-progress) is explicit and traceable.

## 8. Risks and Mitigations
- Risk: behavior divergence between local-only and backend-enabled modes.
- Mitigation: keep backend behind configuration and validate parity flows.

- Risk: migration duplicates or missing records.
- Mitigation: explicit import semantics and deterministic deduplication rules in Phase B/F.

- Risk: unclear ownership of URL share state.
- Mitigation: lock scope in Phase A and keep URL state client-local unless explicitly changed.
