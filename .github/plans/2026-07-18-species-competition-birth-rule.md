# Species Competition Birth Rule

## Overview

Add a toggleable experimental rule that makes color/species competition affect reproduction outcomes. When enabled, births should require a dominant neighboring species so users can observe competing cell populations rather than treating mixed-color births the same as ordinary births.

## Phases

1. [x] Extend the core rule model.
   - Add a new experimental birth rule to `GameRules` and `DEFAULT_RULES`.
   - Keep the rule toggleable through the existing rules UI.
2. [x] Implement reproduction competition behavior.
   - Update birth-color resolution so dominant species can win births.
   - Prevent births from ambiguous mixed-species neighborhoods when the experimental rule is enabled.
3. [x] Update tests and validate.
   - Extend core and rules-panel coverage for the new rule.
   - Run focused validation.

## Relevant Files

- `packages/core/src/interfaces/index.ts`
- `packages/core/src/core/game.ts`
- `packages/core/src/core/game.rules.spec.ts`
- `packages/app/src/app/components/RulesPanel.tsx`
- `packages/app/src/app/components/RulesPanel.test.tsx`

## Verification

- `npx nx run @game-of-life/core:build --outputStyle=static`
- `CI=1 NX_TUI=false npm run build:app -- --outputStyle=static`

## Decisions

- Scope the experiment to reproduction only, since that is the user’s stated interest.
- Use a dominant-species birth rule: if all three parent neighbors are different colors, no birth occurs while the rule is enabled.