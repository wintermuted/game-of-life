# Core Game Logic - Copilot Instructions

## Purpose
This directory contains the pure, side-effect-free implementation of Conway's Game of Life rules. All code here should be testable in isolation without any UI or external dependencies.

## Key Files
- `game.ts` - Main game logic, calculates next generation
- `coordinates.ts` - Coordinate utilities and neighbor calculations
- `tests/` - Integration tests for game patterns

## Data Structure: LifeGrid

The game state uses a hash-based sparse grid representation:
```typescript
interface LifeGrid {
  [coordinate: string]: boolean;
}
```

**Key Points:**
- Only stores **live cells** (dead cells are implicit)
- Coordinates are strings: "x,y" format (e.g., "0,0", "-5,10")
- Value is always `true` for live cells
- Missing keys represent dead cells
- Grid is infinite (no boundaries)

**Why this approach?**
- Memory efficient for sparse grids (most Game of Life patterns are sparse)
- O(n) complexity where n = number of live cells (not grid size)
- Fast lookups via hash map

## Conway's Rules Implementation

From `game.ts - calculateNextGeneration()`:

1. **For each live cell**: Check if it survives (2 or 3 neighbors)
2. **For each neighbor of live cells**: Check if it should be born (exactly 3 neighbors)

```typescript
// Survival rule
const statusQuo = liveNeighbors === 2 || liveNeighbors === 3;

// Birth rule  
if (!isAlive && getLiveNeighborCount(coordinate, grid) === 3) {
  nextGrid[coordinate] = value;
}
```

## Coordinate System

Coordinates use standard Cartesian plane:
- Format: "x,y" (comma-separated, no spaces)
- X increases rightward, Y increases upward
- Origin is "0,0"
- Negative coordinates are valid: "-1,-1"

**Eight Neighbors:**
```
NW  N  NE
 W  •  E
SW  S  SE
```

## Critical Functions

### `calculateNextGeneration(grid: LifeGrid): LifeGrid`
**Purpose:** Apply Conway's rules to get the next generation
**Input:** Current game state
**Output:** New game state (does NOT mutate input)
**Algorithm:**
1. Iterate over all live cells
2. For cells with 2-3 neighbors, keep alive
3. For all neighbors of live cells, check for birth (3 neighbors)
4. Return new grid

**Important:** Returns a NEW grid object, does not modify the input

### `getNeighborCoordinates(coordinate: string): LifeGrid`
**Purpose:** Get all 8 neighboring coordinates
**Input:** A coordinate string like "5,3"
**Output:** LifeGrid object with 8 neighbor coordinates as keys
**Note:** Returns a LifeGrid for easy set operations, not an array

### `getLiveNeighborCount(coordinate: string, grid: LifeGrid): number`
**Purpose:** Count how many neighbors are alive
**Input:** Coordinate to check, current grid state
**Output:** Integer count (0-8)
**Algorithm:** Uses lodash `intersection()` to find overlap between neighbor coords and grid keys

## Testing Requirements

### Every function must have tests covering:
1. **Base cases** - Simple, obvious inputs
2. **Edge cases** - Empty grid, single cell, boundary conditions
3. **Rule verification** - Each Conway rule tested separately
4. **Pattern validation** - Known patterns (blinker, beacon, etc.) behave correctly

### Test Structure
```typescript
describe('high-level behavior description', () => {
  test('specific case', () => {
    const base = { "0,0": true };
    const result = gameOfLife(base);
    expect(result).toStrictEqual(expectedGrid);
  });
});
```

### Pattern Tests (in tests/ directory)
- Import patterns from `src/data/`
- Verify multi-generation behavior
- Test period for oscillators
- Test stability for still lifes

## Common Pitfalls

### ❌ Don't mutate the input grid
```typescript
// BAD
function calculateNextGeneration(grid: LifeGrid): LifeGrid {
  grid["0,0"] = true; // Mutating input!
  return grid;
}

// GOOD
function calculateNextGeneration(grid: LifeGrid): LifeGrid {
  const nextGrid: LifeGrid = {};
  // ... populate nextGrid
  return nextGrid;
}
```

### ❌ Don't forget to check dead neighbors
```typescript
// Birth rule must check neighbors of live cells
// Not just the live cells themselves
```

### ❌ Don't use array coordinates
```typescript
// BAD
const coord = [0, 0];

// GOOD  
const coord = "0,0";
```

## Performance Notes

- Current implementation is O(n × 8) where n = live cells
- Lodash functions (`forEach`, `intersection`, `keys`) are used for clarity
- Could be optimized further but clarity is prioritized
- The sparse grid representation is the main performance optimization

## Adding New Functionality

### To add a new game rule variant:
1. Create new function in `game.ts` (don't modify existing)
2. Follow same pure function pattern
3. Add comprehensive tests
4. Document the rule differences

### To add coordinate utilities:
1. Add to `coordinates.ts`
2. Keep functions pure
3. Return new objects, don't mutate
4. Add tests in `coordinates.spec.ts`

## Dependencies
- **Lodash**: Used for `forEach`, `keys`, `intersection`
  - Could be replaced with native JS but lodash is already a dependency
  - Provides consistent iteration behavior
