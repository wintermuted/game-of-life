import { useEffect, useRef, useState } from "react";
import { LifeGrid } from '@game-of-life/core';
import { getCellFillColor, translateGridToViewport } from '../util/coordinate';
import { ColorPalette } from '../constants/colors';
import { useThemeMode } from '../ThemeContext';

const CELL_STROKE_WIDTH = 0.5;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCanvasSize = () => {
      const nextWidth = Math.max(1, Math.floor(container.clientWidth));
      const nextHeight = Math.max(1, Math.floor(container.clientHeight));

      setCanvasSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const cellWithStroke = cellSize + CELL_STROKE_WIDTH;
  const calculatedGridColumns = Math.max(2, Math.floor(canvasWidth / cellWithStroke));
  const calculatedGridRows = Math.max(2, Math.floor(canvasHeight / cellWithStroke));
  const centerReferenceGridSize = Math.min(calculatedGridColumns, calculatedGridRows);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasWidth || !canvasHeight) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const translatedGrid = translateGridToViewport(
      grid,
      calculatedGridColumns,
      calculatedGridRows,
      offsetX,
      offsetY
    );

    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const axisXCanvasIndex = halfCols - offsetX;
    const axisYCanvasIndex = halfRows - 1 - offsetY;
    const axisStrokeColor = palette
      ? (isDark ? palette.centerCellDark : palette.centerCell)
      : (isDark ? 'rgba(88, 166, 255, 0.85)' : 'rgba(9, 105, 218, 0.7)');

    // Draw all visible cells using the currently available canvas space.
    for (let columnIndex = 0; columnIndex < calculatedGridRows; columnIndex++) {
      for (let rowIndex = 0; rowIndex < calculatedGridColumns; rowIndex++) {
        const x = getCoordinate(rowIndex, cellSize);
        const y = getCoordinate(columnIndex, cellSize);
        const alive = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(
          alive,
          rowIndex,
          columnIndex,
          centerReferenceGridSize,
          palette,
          isDark
        );

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }

    // Draw the y-axis as the left border of the x=0 column.
    if (axisXCanvasIndex >= 0 && axisXCanvasIndex < calculatedGridColumns) {
      const axisLeftX = getCoordinate(axisXCanvasIndex, cellSize);
      ctx.strokeStyle = axisStrokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(axisLeftX, 0);
      ctx.lineTo(axisLeftX, canvasHeight);
      ctx.stroke();
    }

    // Draw the x-axis as the bottom border of the y=0 row.
    if (axisYCanvasIndex >= 0 && axisYCanvasIndex < calculatedGridRows) {
      const axisBottomY = getCoordinate(axisYCanvasIndex, cellSize) + cellSize;
      ctx.strokeStyle = axisStrokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, axisBottomY);
      ctx.lineTo(canvasWidth, axisBottomY);
      ctx.stroke();
    }
  }, [
    grid,
    calculatedGridColumns,
    calculatedGridRows,
    centerReferenceGridSize,
    cellSize,
    canvasWidth,
    canvasHeight,
    offsetX,
    offsetY,
    palette,
    isDark,
  ]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !onCellClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate which cell was clicked
    const canvasRowIndex = Math.floor(x / cellWithStroke);
    const canvasColumnIndex = Math.floor(y / cellWithStroke);

    if (
      canvasRowIndex < 0 ||
      canvasColumnIndex < 0 ||
      canvasRowIndex >= calculatedGridColumns ||
      canvasColumnIndex >= calculatedGridRows
    ) {
      return;
    }

    // Convert back to actual grid coordinates
    // The canvas uses rowIndex for x-axis and columnIndex for y-axis
    // We need to reverse the translation that was applied in translateGridToViewport
    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const gridX = canvasRowIndex - halfCols + offsetX;
    const gridY = halfRows - 1 - canvasColumnIndex + offsetY;

    const coordinate = `${gridX},${gridY}`;
    onCellClick(coordinate);
  };

  return (
    <div className="CanvasGrid" ref={containerRef}>
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
