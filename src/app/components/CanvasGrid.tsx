import { useEffect, useRef } from "react";
import { LifeGrid } from '../../interfaces';
import { getCellFillColor, translateGrid } from '../util/coordinate';

const CELL_STROKE_COLOR = '#777';
const CELL_STROKE_WIDTH = 1;

function getCoordinate(rowIndex: number, cellSize: number) {
  return rowIndex + (cellSize * rowIndex);
}

interface Props {
  grid: LifeGrid;
  gridSize: number; // should only be even numbers
  cellSize: number;
  onMouseOver: (e: React.MouseEvent) => void;
  offsetX?: number;
  offsetY?: number;
}

function CanvasGrid({ onMouseOver, grid, gridSize, cellSize, offsetX = 0, offsetY = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate canvas dimensions based on grid size and cell size
  // Each cell takes cellSize pixels plus 1 pixel for stroke
  const canvasWidth = gridSize * (cellSize + CELL_STROKE_WIDTH);
  const canvasHeight = gridSize * (cellSize + CELL_STROKE_WIDTH);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const translatedGrid = translateGrid(grid, gridSize, offsetX, offsetY);

    // Draw all cells
    for (let columnIndex = 0; columnIndex < gridSize; columnIndex++) {
      for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        const x = getCoordinate(rowIndex, cellSize);
        const y = getCoordinate(columnIndex, cellSize);
        const alive = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(alive, rowIndex, columnIndex, gridSize);

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw the stroke
        ctx.strokeStyle = CELL_STROKE_COLOR;
        ctx.lineWidth = CELL_STROKE_WIDTH;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }, [grid, gridSize, cellSize, canvasWidth, canvasHeight, offsetX, offsetY]);

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
