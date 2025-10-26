# Conway's Game of Life - Copilot Instructions

## Project Overview
This is a TypeScript implementation of Conway's Game of Life with a React-based UI. The project emphasizes clean code, testability, and performance optimization.

## Technology Stack
- **Language**: TypeScript 4.5+
- **UI Framework**: React 17
- **Testing**: Jest with React Testing Library
- **Build Tool**: Create React App (react-scripts)
- **Styling**: SCSS
- **Dependencies**: Lodash for utility functions

## Project Structure
```
src/
├── core/           # Pure game logic (no side effects)
├── class/          # Game class wrapper
├── app/            # React UI components
├── data/           # Predefined patterns (oscillators, still lifes, etc.)
└── interfaces/     # TypeScript type definitions
```

## Code Style Guidelines

### General Principles
- Write pure functions whenever possible
- Prefer immutability - avoid mutating inputs
- Use TypeScript types explicitly
- Follow functional programming patterns in core logic
- Keep business logic separate from UI logic

### TypeScript
- Always define explicit return types for functions
- Use interfaces for object shapes
- Avoid `any` type - use proper typing
- Export types/interfaces from `src/interfaces/`

### Testing
- Every core function must have unit tests
- Test files use `.spec.ts` or `.spec.tsx` extension
- Place tests next to the code they test
- Use descriptive test names that explain the behavior
- Follow the existing pattern: `describe` for groups, `test` for individual cases
- Use `toStrictEqual()` for object comparisons

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks or utility functions
- Use SCSS for styling
- Components go in `src/app/components/`

## Key Concepts

### Game Logic (src/core/)
The game state is represented as a `LifeGrid` - a hash map where keys are coordinates (e.g., "x,y") and values are boolean (true = alive).

**Conway's Rules** (implemented in `core/game.ts`):
1. Any live cell with 2-3 live neighbors survives
2. Any dead cell with exactly 3 live neighbors becomes alive
3. All other cells die or stay dead

### Coordinate System
- Coordinates are strings in format "x,y" (e.g., "0,0", "1,2")
- Use functions in `core/coordinates.ts` for neighbor calculations
- Grid is infinite in theory (no boundaries enforced)

### Performance Considerations
- The dictionary-based approach is O(n) where n = number of live cells
- Only track live cells to optimize for sparse grids
- The UI has known performance issues with large grids (mentioned in README)

## Development Workflow

### Running Tests
```bash
npm test                    # Run tests in watch mode
npm test -- --watchAll=false # Run tests once
```

### Building
```bash
npm run build              # Create production build
npm start                  # Run development server
```

### Adding New Features
1. Start with core logic in `src/core/`
2. Add comprehensive unit tests
3. If needed, update the Game class in `src/class/`
4. Add UI components in `src/app/` if user-facing
5. Ensure all tests pass before committing

## Common Tasks

### Adding a New Pattern
1. Define pattern in `src/data/` (oscillators, stillLifes, etc.)
2. Format: `{ "x,y": true, "x2,y2": true }`
3. Add tests in `src/core/tests/` to verify pattern behavior

### Modifying Game Rules
1. Update `calculateNextGeneration()` in `src/core/game.ts`
2. Update or add tests in `src/core/game.spec.ts`
3. Ensure existing patterns still work as expected

### Adding UI Features
1. Create component in `src/app/components/`
2. Add styles in `src/app/styles/`
3. Import and use in `App.tsx`
4. Keep game logic out of components

## Known Issues
- UI performance degrades with large grids (needs optimization)
- No current plans to address - noted in README

## Testing Requirements
- All core logic must be tested
- Aim for high coverage in `src/core/` and `src/class/`
- UI components should have basic smoke tests
- Test both standard rules and edge cases
