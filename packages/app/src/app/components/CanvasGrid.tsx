import { useEffect, useRef } from "react";
import { LifeGrid } from '@game-of-life/core';
import { getCellFillColor, translateGrid } from '../util/coordinate';
import { ColorPalette } from '../constants/colors';

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
  palette?: ColorPalette;
  isEditMode?: boolean;
  onCellClick?: (coordinate: string) => void;
}

function CanvasGrid({ onMouseOver, grid, cellSize, offsetX = 0, offsetY = 0, palette, isEditMode = false, onCellClick }: Props) {
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
        const color = getCellFillColor(alive, rowIndex, columnIndex, calculatedGridSize, palette);

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        // Draw the stroke
        ctx.strokeStyle = CELL_STROKE_COLOR;
        ctx.lineWidth = CELL_STROKE_WIDTH;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }, [grid, calculatedGridSize, cellSize, canvasWidth, canvasHeight, offsetX, offsetY, palette]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !onCellClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate which cell was clicked
    const cellWithStroke = cellSize + CELL_STROKE_WIDTH;
    const rowIndex = Math.floor(x / cellWithStroke);
    const columnIndex = Math.floor(y / cellWithStroke);

    // Convert back to actual grid coordinates considering offset
    const actualRow = rowIndex - offsetX;
    const actualColumn = columnIndex - offsetY;

    const coordinate = `${actualRow},${actualColumn}`;
    onCellClick(coordinate);
  };

  return (
    <div className="CanvasGrid">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseOver={onMouseOver}
        onClick={handleCanvasClick}
        style={{ cursor: isEditMode ? 'pointer' : 'default' }}
      />
    </div>
  );
}

export default CanvasGrid;
