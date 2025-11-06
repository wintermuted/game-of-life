Conway's Game of Life
-----

[![Unit Tests](https://github.com/wintermuted/game-of-life/actions/workflows/run-tests.yml/badge.svg)](https://github.com/wintermuted/game-of-life/actions/workflows/run-tests.yml)

This project is an implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) written in [Typescript](https://www.typescriptlang.org/).

## Goals
- Provide a succinct example of my programming skill in TypeScript vis-a-vis a known programming problem.
- Demonstrate my understanding of [Big O notation](https://en.wikipedia.org/wiki/Big_O_notation).
- Provide myself an opportunity to learn HTML5 Canvas.

## Current State
- The rules of the Game of Life have been implemented.  
  - A Dictionary is used as the primary datastructure.
  - The implementation of the core logic can be found in [`packages/core/src/core/game.ts`](https://github.com/wintermuted/game-of-life/blob/master/packages/core/src/core/game.ts).
  - A class [`Game`](https://github.com/wintermuted/game-of-life/blob/master/packages/core/src/class/Game.ts) can be used to start a game and step through it.
- The game rules are backed with unit tests.
- The game has been tested with common Still Life & Oscillator patterns.
- A rudimentary UI built with React has been added, however it is poorly optimized.  A rewrite is necessary for it to be performant with larger grids.

## Architecture

This project is organized as an **NX monorepo** with TypeScript composite builds:

### Packages

- **`@game-of-life/core`** (`packages/core/`) - Core game logic library
  - Pure TypeScript implementation of Conway's Game of Life rules
  - Game state management (Grid class)
  - Pattern definitions (oscillators, still lifes, spaceships, methuselahs)
  - Type definitions and interfaces
  - No dependencies on UI frameworks
  
- **`@game-of-life/app`** (`packages/app/`) - React UI application
  - Vite-based React application
  - Material-UI components
  - Canvas-based grid rendering
  - Pattern selector and game controls
  - Depends on `@game-of-life/core`

### TypeScript Composite Builds

The project uses TypeScript's [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) for incremental builds:

- Root `tsconfig.json` references both packages
- `packages/core/tsconfig.json` has `composite: true` and outputs to `dist/`
- `packages/app/tsconfig.json` references the core package

This enables:
- Faster incremental builds
- Better IDE performance
- Clear dependency boundaries between packages

## Technology

- **Build System**: [NX](https://nx.dev) - Smart monorepo build system with caching
- **Language**: TypeScript 5.0
- **UI Framework**: React 18 with Vite
- **UI Components**: Material-UI (MUI)
- **Testing**: Vitest (unit tests), Playwright (E2E tests)
- **Bundler**: Vite

## Development

### Prerequisites

```bash
npm install
```

### Available Commands

```bash
# Development
npm run dev          # Start development server
npm start            # Alias for dev

# Building
npm run build        # Build all packages
npm run build:app    # Build only the app package

# Testing
npm test             # Run tests for all packages
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Open Vitest UI

# End-to-End Testing with Playwright
npm run test:e2e         # Run Playwright tests (headless)
npm run test:e2e:ui      # Run Playwright tests with UI mode
npm run test:e2e:headed  # Run Playwright tests in headed mode (see browser)
npm run test:e2e:debug   # Run Playwright tests in debug mode

# Linting
npm run lint         # Lint the app package

# Preview
npm run preview      # Preview production build
```

### NX Commands

You can also use NX directly for more control:

```bash
# Run tasks for specific packages
npx nx run @game-of-life/core:build
npx nx run @game-of-life/core:test
npx nx run @game-of-life/app:dev

# Run tasks for all packages
npx nx run-many --target=test --all
npx nx run-many --target=build --all

# View project graph
npx nx graph
```

### Package Structure

```
game-of-life/
├── packages/
│   ├── core/                 # Core game logic library
│   │   ├── src/
│   │   │   ├── core/        # Game rules and calculations
│   │   │   ├── class/       # Game class
│   │   │   ├── data/        # Pattern definitions
│   │   │   ├── interfaces/  # TypeScript types
│   │   │   └── index.ts     # Public API
│   │   ├── dist/            # Compiled output
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── app/                  # React UI application
│       ├── src/
│       │   ├── app/         # React components
│       │   ├── index.tsx    # Entry point
│       │   └── ...
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── package.json              # Root package.json (workspace)
├── tsconfig.json            # Root TypeScript config (project references)
├── nx.json                  # NX workspace configuration
├── e2e/                     # Playwright end-to-end tests
├── playwright.config.ts     # Playwright configuration
└── .github/mcp.json         # MCP configuration for Playwright
```

## End-to-End Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing of the UI.

### Running E2E Tests

Before running tests for the first time, install Playwright browsers:

```bash
npx playwright install
```

Run E2E tests:

```bash
npm run test:e2e         # Run tests headless
npm run test:e2e:ui      # Run with Playwright UI mode (recommended for development)
npm run test:e2e:headed  # Run in headed mode (see the browser)
npm run test:e2e:debug   # Run in debug mode
```

### Test Organization

E2E tests are located in the `e2e/` directory:

- `home.spec.ts` - Tests for the home page, canvas, controls, and diagnostics
- `game-interactions.spec.ts` - Tests for navigation (Home, About, GitHub links)
- `patterns-and-controls.spec.ts` - Tests for pattern selection and game controls
- `theme.spec.ts` - Tests for dark/light mode toggle

### Playwright Configuration

The Playwright configuration includes:

- **Browser**: Chromium (desktop)
- **Base URL**: http://localhost:5173 (Vite dev server)
- **Web Server**: Automatically starts the dev server before running tests
- **Reporter**: HTML report (view with `npx playwright show-report`)
- **Retries**: 2 retries on CI, 0 locally

### MCP Integration

This repository is configured with Playwright MCP (Model Context Protocol) for enhanced development workflows. The configuration is in `.github/mcp.json`.

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions:

- **Production Deployment**: Automatically deployed to GitHub Pages when changes are merged to the `main` or `master` branch.
  - 🌐 **Live Site**: https://wintermuted.github.io/game-of-life/
- **PR Previews**: Each pull request receives a preview deployment which is automatically cleaned up when the PR is closed. The preview URL is posted as a comment on the PR.

The deployment workflows are located in `.github/workflows/`:
- `deploy-pages.yml` - Main production deployment
- `deploy-pr-preview.yml` - PR preview deployments
- `cleanup-pr-preview.yml` - PR preview cleanup
