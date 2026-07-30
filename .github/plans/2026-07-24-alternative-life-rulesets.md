# Alternative Life Rulesets

## Overview

Add Day & Night (`B3678/S34678`) and Life without Death (`B3/S012345678`) as implemented Life-like rulesets with representative starter patterns. Preserve the existing Conway, HighLife, and manual rule behavior while exposing each new pattern's Wikipedia source in Pattern info.

## Phases

### Phase A: Generalize Ruleset Execution

1. [x] Extend `GameRules` with an optional Life-like birth/survival count profile.
2. [x] Update cloning, comparison, persisted-ruleset detection, and generation calculation to handle count profiles without changing legacy boolean-rule behavior.
3. [x] Define and export Day & Night and Life without Death rulesets with their verified B/S classifications.
4. [x] Add focused core tests for each ruleset's birth and survival behavior.

### Phase B: Add Preset Patterns and Metadata

1. [x] Add representative deterministic seeds for Day & Night and Life without Death.
2. [x] Register both patterns with ruleset IDs, tags, descriptions, and Wikipedia reference URLs.
3. [x] Export the pattern data through the core package and add selector coverage that verifies the correct ruleset is loaded.

### Phase C: Integrate Rules and Pattern Info UI

1. [x] Add both rulesets to the active-ruleset selector and update ruleset ID typing.
2. [x] Present generalized B/S profiles accurately in the rules panel rather than showing misleading Conway-specific toggles.
3. [x] Carry pattern descriptions and reference URLs into play metadata and render external Wikipedia links in Pattern info.
4. [x] Verify Explore ruleset filters and badges include both new presets.

### Phase D: Validate and Finish

1. [x] Run focused core rules and pattern selector tests.
2. [x] Run the production app build.
3. [x] Verify both preset patterns, ruleset transitions, Pattern info descriptions, and Wikipedia links in the live app.
4. [x] Mark this plan completed and record the work in the daily log.

## Relevant Files

| File | Purpose |
| --- | --- |
| `packages/core/src/interfaces/index.ts` | Rules profile and pattern metadata types |
| `packages/core/src/core/game.ts` | Ruleset definitions and generation behavior |
| `packages/core/src/core/game.rules.spec.ts` | Focused ruleset behavior coverage |
| `packages/core/src/data/patterns.ts` | Starter pattern registration and metadata |
| `packages/core/src/data/alternativeRules.ts` | New representative preset seeds |
| `packages/core/src/index.ts` | Core exports |
| `packages/app/src/app/components/Home.tsx` | Ruleset restoration and Pattern info metadata/link rendering |
| `packages/app/src/app/components/RulesPanel.tsx` | Ruleset selector and generalized profile display |
| `packages/app/src/app/components/RulesPanel.test.tsx` | Selector/profile UI coverage |
| `packages/app/src/app/components/PatternSelector.test.tsx` | Starter pattern ruleset selection coverage |
| `packages/app/src/app/components/Explore.tsx` | Persisted ruleset detection and Explore metadata |

## Verification

- Core tests prove Day & Night births at 3/6/7/8 and survives at 3/4/6/7/8, while Life without Death births at 3 and preserves live cells at every neighbor count.
- Pattern selector tests prove each new pattern passes its matching ruleset ID.
- Production TypeScript/Vite build succeeds.
- Browser verification confirms the presets appear in Starter Patterns and Explore, open with the correct locked ruleset, and show the supplied Wikipedia reference in Pattern info.

## Decisions

- Use an optional generalized count profile instead of adding fifteen one-off rule booleans; this keeps the engine extensible and avoids bloating the manual rules UI.
- Keep Conway, HighLife, and existing custom toggles backward-compatible; count profiles are used only by generalized Life-like presets.
- Use a compact representative Day & Night seed and the published `4c/9` Life without Death ladder RLE so each preset visibly exercises its ruleset with accurately sourced pattern data.
- Store reference URLs as pattern metadata so Pattern info remains data-driven and future presets can add sources without component-specific conditionals.
