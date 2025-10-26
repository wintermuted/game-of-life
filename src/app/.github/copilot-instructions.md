# React UI Components - Copilot Instructions

## Purpose
This directory contains the React-based user interface for the Game of Life. Components here are responsible for rendering the grid, controls, and managing user interactions.

## Architecture

### Component Structure
```
app/
├── App.tsx              # Root component, game state management
├── components/          # UI components
│   ├── Grid.tsx         # Main grid rendering (DOM-based)
│   ├── CanvasGrid.tsx   # Alternative canvas-based rendering
│   ├── GridSquares.tsx  # Individual cell rendering
│   └── GridControls.tsx # Play/pause/speed controls
├── styles/              # SCSS stylesheets
└── util/                # UI utility functions
```

## Key Principles

### State Management
- Use React hooks (`useState`, `useEffect`)
- Game state is managed in `App.tsx`
- Game instance is stored at module level (not in state)
- State triggers are: generation count, speed, running status

### Separation of Concerns
- **App.tsx**: Orchestrates game loop, manages intervals
- **Components**: Pure presentation, receive props
- **Game class**: Business logic (imported from `src/class/`)
- Keep game logic OUT of components

## App.tsx - Main Component

### State Variables
```typescript
const [boardNeedsInitialization, setBoardInitialization] = useState(true);
const [generation, setGeneration] = useState(0);
const [generationSpeed, setGenerationSpeed] = useState(3);
const [isGameRunning, setIsGameRunning] = useState(false);
```

### Key Functions

#### `runGame()` / `stopGame()`
Controls the game loop using `setInterval`. When running, calls `game.next()` every N milliseconds based on speed setting.

#### `nextGeneration()`
Advances game by one step manually (when paused).

#### `resetBoard()`
Triggers re-initialization - sets `boardNeedsInitialization` to true.

#### `updateGenerationSpeed(value: number)`
Changes speed and restarts interval if game is running.

### Game Initialization
```typescript
useEffect(() => {
  if (boardNeedsInitialization) {
    game = new Game(baseGame)
    setBoardInitialization(false);
    setGeneration(0);
  }
}, [boardNeedsInitialization]);
```

## Components

### Grid.tsx
**Purpose:** Renders the game grid
- Takes `game` instance as prop
- Handles mouse events (onMouseOver for cell interaction)
- Currently uses DOM-based rendering
- **Performance Issue:** Slow with large grids (known limitation)

### CanvasGrid.tsx
**Purpose:** Alternative canvas-based renderer
- More performant for large grids
- Uses HTML5 Canvas API
- Not currently used in main App

### GridSquares.tsx
**Purpose:** Renders individual cells
- Helper component for Grid.tsx
- Displays each live cell as a square

### GridControls.tsx
**Purpose:** User controls panel
- Play/Pause/Reset buttons
- Speed slider
- Step forward (next generation) button

**Props:**
```typescript
{
  nextGeneration: () => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  runGame: () => void;
  stopGame: () => void;
}
```

## Styling (SCSS)

### File Organization
- One SCSS file per component in `styles/`
- Import in corresponding component
- Use BEM-like naming conventions

### Current Styles
- `App.scss` - Layout (two-column design)
- `Grid.scss` - Grid and cell styling
- `GridControls.scss` - Control panel styling

## Utilities (util/)

### `coordinate.ts`
Helper functions for coordinate manipulation in the UI context.

### `index.ts`
Exports utility functions including `getGenerationSpeed()` which converts slider value to milliseconds.

## Known Limitations

### Performance Issues
- **Problem:** Grid rendering is slow with many live cells
- **Cause:** DOM manipulation for each cell
- **Status:** Acknowledged in README, no current fix planned
- **Alternative:** CanvasGrid.tsx exists but not integrated

### Potential Solutions (future)
1. Use CanvasGrid instead of Grid
2. Virtualize grid (only render visible cells)
3. Batch DOM updates
4. Use React.memo for cell components

## Common Tasks

### Adding a Control Button
1. Add handler function in `App.tsx`
2. Pass as prop to `GridControls`
3. Add button in `GridControls.tsx`
4. Style in `GridControls.scss`

### Changing Initial Pattern
```typescript
// In App.tsx
import { yourPattern } from '../data/patterns';
const baseGame = yourPattern; // Change this line
```

### Modifying Grid Rendering
1. Edit `Grid.tsx` or switch to `CanvasGrid.tsx`
2. Update styles in `Grid.scss`
3. Test with various grid sizes
4. Check performance impact

### Adding Diagnostics
- Current diagnostics shown in right column
- Displays generation count and grid JSON
- Add to JSX in App.tsx return statement

## Event Handling

### Mouse Events
```typescript
function onMouseOver(e: React.MouseEvent) {
  // Currently just logs
  // Could be used to toggle cells
}
```

### Button Clicks
All control buttons pass event handler functions via props from App.tsx.

## Interval Management

### Critical: Clean up intervals
```typescript
function stopGame() {
  clearInterval(intervalID); // Must clear!
  setIsGameRunning(false);
}
```

### When speed changes:
```typescript
if (isGameRunning) {
  clearInterval(intervalID);  // Clear old interval
  runGameInterval();          // Start new with updated speed
}
```

## Best Practices

### ✅ Do
- Keep components focused and small
- Use functional components with hooks
- Pass game state down via props
- Clean up intervals in stopGame()
- Use TypeScript types for props
- Extract complex logic to utility functions

### ❌ Don't
- Don't implement game rules in components
- Don't mutate game state directly
- Don't forget to clear intervals
- Don't put business logic in render methods
- Don't use inline styles (use SCSS)

## Testing UI Components

Currently, UI components have minimal tests. When adding tests:
- Use React Testing Library
- Test user interactions (clicks, inputs)
- Mock the Game class
- Test state changes
- Verify correct prop passing

## Integration with Core

### Game Class Usage
```typescript
import Game from '../class/Game';

// Initialize
const game = new Game(initialGrid);

// Step forward
game.next();

// Get state
const grid = game.getStatus();

// Get generation count
const count = game.getGenerations();
```

### Data Import
```typescript
import { rPentomino } from '../data/methuselahs';
import { blinker } from '../data/oscillators';
```

## Future Enhancements
- Allow users to draw patterns
- Save/load game states
- Performance optimization
- Multiple pattern presets
- Canvas-based rendering integration
