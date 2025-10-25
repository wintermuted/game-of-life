import { useEffect, useRef } from "react";
import { LifeGrid } from '../../interfaces';
import { getCellFillColor, translateGrid } from '../util/coordinate';

interface Props {
  grid: LifeGrid;
  gridSize: number; // should only be even numbers
  cellSize: number;
  onMouseOver: (e: React.MouseEvent) => void;
}

function CanvasGrid({ onMouseOver, grid, gridSize, cellSize }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = gridSize * (cellSize + 1); // +1 for stroke
  const canvasHeight = gridSize * (cellSize + 1); // +1 for stroke

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const translatedGrid = translateGrid(grid, gridSize);

    // Draw all cells
    for (let columnIndex = 0; columnIndex < gridSize; columnIndex++) {
      for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        const x = rowIndex + (cellSize * rowIndex);
        const y = columnIndex + (cellSize * columnIndex);
        const alive = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(alive, rowIndex, columnIndex, gridSize);

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw the stroke
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }, [grid, gridSize, cellSize, canvasWidth, canvasHeight]);

  return (
    <div className="CanvasGrid">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseOver={onMouseOver}
      />
    </div>
  );
}

export default CanvasGrid;
