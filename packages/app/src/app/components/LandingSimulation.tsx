import { useEffect, useRef, useState } from 'react';
import { Game, LifeGrid } from '@game-of-life/core';
import CanvasGrid from './CanvasGrid';

const CELL_SIZE = 10;
const STEP_MS = 120;

interface Props {
  initialGrid: LifeGrid;
}

function LandingSimulation({ initialGrid }: Props) {
  const gameRef = useRef<Game | null>(null);
  const [grid, setGrid] = useState<LifeGrid>({});

  useEffect(() => {
    gameRef.current = new Game(initialGrid);
    setGrid(gameRef.current.getStatus());

    const id = window.setInterval(() => {
      const game = gameRef.current;
      if (!game) return;

      setGrid(game.next());
    }, STEP_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [initialGrid]);

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