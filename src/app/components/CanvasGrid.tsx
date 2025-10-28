import { useEffect, useRef } from "react";
import { LifeGrid } from '../../interfaces';
import { getCellFillColor, translateGrid } from '../util/coordinate';

const CELL_STROKE_COLOR = '#777';
const CELL_STROKE_WIDTH = 1;
const DISPLAY_SIZE = 800; // Fixed canvas size in pixels

function getCoordinate(rowIndex: number, cellSize: number) {
  return rowIndex + (cellSize * rowIndex);
}

interface Props {
  grid: LifeGrid;
  gridSize: number; // should only be even numbers (not used directly, calculated from cellSize)
  cellSize: number;
  onMouseOver: (e: React.MouseEvent) => void;
  offsetX?: number;
  offsetY?: number;
}

function CanvasGrid({ onMouseOver, grid, cellSize, offsetX = 0, offsetY = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate how many cells fit in the fixed display size based on cellSize
  // Smaller cellSize = more cells visible, larger cellSize = fewer cells visible
  const calculatedGridSize = Math.floor(DISPLAY_SIZE / (cellSize + CELL_STROKE_WIDTH));
  
  // Keep canvas size fixed
  const canvasWidth = DISPLAY_SIZE;
  const canvasHeight = DISPLAY_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const translatedGrid = translateGrid(grid, calculatedGridSize, offsetX, offsetY);

    // Draw all cells based on calculated grid size
    for (let columnIndex = 0; columnIndex < calculatedGridSize; columnIndex++) {
      for (let rowIndex = 0; rowIndex < calculatedGridSize; rowIndex++) {
        const x = getCoordinate(rowIndex, cellSize);
        const y = getCoordinate(columnIndex, cellSize);
        const alive = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(alive, rowIndex, columnIndex, calculatedGridSize);

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw the stroke
        ctx.strokeStyle = CELL_STROKE_COLOR;
        ctx.lineWidth = CELL_STROKE_WIDTH;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }, [grid, calculatedGridSize, cellSize, canvasWidth, canvasHeight, offsetX, offsetY]);

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
