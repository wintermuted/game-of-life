import { useEffect, useRef, useState } from 'react';
import { createLiveCell, Game, LifeGrid } from '@game-of-life/core';
import CanvasGrid from './CanvasGrid';

const CELL_SIZE = 10;
const STEP_MS = 180;
const MIN_LIVE_CELLS = 14;

function createSeed(): LifeGrid {
  const seed: LifeGrid = {};

  // Keep seed compact so interesting structures remain visible near viewport center.
  for (let x = -22; x <= 22; x++) {
    for (let y = -14; y <= 14; y++) {
      if (Math.random() < 0.23) {
        seed[`${x},${y}`] = createLiveCell();
      }
    }
  }

  return seed;
}

function LandingSimulation() {
  const gameRef = useRef<Game | null>(null);
  const [grid, setGrid] = useState<LifeGrid>({});

  useEffect(() => {
    gameRef.current = new Game(createSeed());
    setGrid(gameRef.current.getStatus());

    const id = window.setInterval(() => {
      const game = gameRef.current;
      if (!game) return;

      const nextGrid = game.next();

      // Re-seed when pattern goes mostly extinct to keep background motion alive.
      if (Object.keys(nextGrid).length < MIN_LIVE_CELLS) {
        gameRef.current = new Game(createSeed());
        setGrid(gameRef.current.getStatus());
        return;
      }

      setGrid(nextGrid);
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="landing-sim-canvas-wrap" aria-hidden="true">
      <CanvasGrid
        grid={grid}
        gridSize={100}
        cellSize={CELL_SIZE}
        onHoverCoordinateChange={() => {}}
      />
    </div>
  );
}

export default LandingSimulation;