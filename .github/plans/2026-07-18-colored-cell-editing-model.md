# Colored Cell Editing Model

## Overview

Update the Game of Life data model so each live cell stores its assigned color instead of a boolean value. Rework editing so the palette selector becomes a draw-color picker, add pencil/eraser edit tools, preserve simulation behavior with colored cells, and keep serialization/storage compatible with existing board URLs when possible.

## Phases

1. [x] Update the core cell-state model and simulation helpers.
   - Replace boolean `LifeGrid` values with per-cell color values.
   - Add core helpers for live-cell checks, default cell creation, and birth-color selection.
   - Update game logic and coordinate helpers to use the new cell value type.
2. [x] Update app serialization, parsing, and board mutation paths.
   - Adjust URL encoding/decoding and coordinate parsing.
   - Normalize legacy boolean grids into the new colored-cell model.
   - Update board editing and pattern insertion to write colored cell values.
3. [x] Rework editing UI for colored drawing.
   - Add pencil and eraser controls.
   - Change the palette selector into the active draw-color selector.
   - Render stored cell colors on the canvas and keep hover/readout behavior intact.
4. [x] Validate and follow up.
   - Run a focused build/test validation pass.
   - Update plan checkboxes and log the completed work.

## Relevant Files

- `packages/core/src/interfaces/index.ts`
- `packages/core/src/core/game.ts`
- `packages/core/src/core/coordinates.ts`
- `packages/core/src/class/Game.ts`
- `packages/core/src/core/coordinateParser.ts`
- `packages/core/src/data/*.ts`
- `packages/app/src/app/components/Home.tsx`
- `packages/app/src/app/components/Grid.tsx`
- `packages/app/src/app/components/GridControls.tsx`
- `packages/app/src/app/components/CanvasGrid.tsx`
- `packages/app/src/app/util/coordinate.ts`
- `packages/app/src/app/util/urlState.ts`
- `packages/app/src/app/constants/colors.ts`

## Verification

- `CI=1 NX_TUI=false npm run build:app -- --outputStyle=static`
- Add focused test/build follow-up if core type changes surface narrower failures.

## Decisions

- Store each live cell as its color value in the grid dictionary.
- Keep the simulation rules based on cell presence; color is cell metadata that survives transitions.
- Normalize legacy boolean grids at decode/load boundaries instead of preserving the old interface shape.