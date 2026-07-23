# Species Competition Tie-Break Rule

## Overview

Add a second experimental reproduction rule that allows tied species competitions to produce a birth by randomly choosing among tied colors instead of blocking the birth outright.

## Phases

1. [x] Extend the core rule model with a tie-break toggle.
2. [x] Update reproduction color selection for tie cases.
3. [x] Cover the new behavior with focused tests and validate core/app builds.

## Relevant Files

- `packages/core/src/interfaces/index.ts`
- `packages/core/src/core/game.ts`
- `packages/core/src/core/game.rules.spec.ts`
- `packages/app/src/app/components/RulesPanel.test.tsx`

## Verification

- `npx nx run @game-of-life/core:build --outputStyle=static`
- `CI=1 NX_TUI=false npm run build:app -- --outputStyle=static`

## Decisions

- Keep the new rule additive: it only affects reproduction ties when species competition is already enabled.
- Randomly choose among colors tied for highest influence instead of blocking the birth.