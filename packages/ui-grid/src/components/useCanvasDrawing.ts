import { RefObject, useEffect } from 'react';
import { LifeGrid } from '@game-of-life/core';
import { ColorPalette } from '@game-of-life/ui';
import { translateGridToViewport } from '@game-of-life/util';
import { getCellFillColor } from '../util/cellColor';

export interface HoveredCell {
  canvasRowIndex: number;
  canvasColumnIndex: number;
  coordinate: string;
}

interface CanvasPosition {
  canvasRowIndex: number;
  canvasColumnIndex: number;
}

interface Options {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  grid: LifeGrid;
  calculatedGridColumns: number;
  calculatedGridRows: number;
  cellSize: number;
  canvasWidth: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
  palette?: ColorPalette;
  isDark: boolean;
  hoveredCell: HoveredCell | null;
  isEditMode: boolean;
  activeEditTool: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
  stampPattern: LifeGrid | null;
  activeDrawColor: string;
  birthDeathPreviewGrid: LifeGrid | null;
  selectionGrid: LifeGrid | null;
  selectionStartCoordinate: string | null;
  selectionEndCoordinate: string | null;
  getCanvasPositionFromCoordinate: (coordinate: string) => CanvasPosition | null;
  getStampPreviewCanvasCells: (
    cell: HoveredCell,
  ) => Array<{ rowIndex: number; columnIndex: number }>;
}

function getCoordinate(rowIndex: number, cellSize: number): number {
  return rowIndex + cellSize * rowIndex;
}

function drawCrossHatchCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  strokeColor: string,
  spacing = 4,
): void {
  if (size <= 1) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;

  for (let offset = -size; offset <= size * 2; offset += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + offset, y);
    ctx.lineTo(x + offset + size, y + size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + offset, y + size);
    ctx.lineTo(x + offset + size, y);
    ctx.stroke();
  }

  ctx.restore();
}

export default function useCanvasDrawing({
  canvasRef,
  grid,
  calculatedGridColumns,
  calculatedGridRows,
  cellSize,
  canvasWidth,
  canvasHeight,
  offsetX,
  offsetY,
  palette,
  isDark,
  hoveredCell,
  isEditMode,
  activeEditTool,
  stampPattern,
  activeDrawColor,
  birthDeathPreviewGrid,
  selectionGrid,
  selectionStartCoordinate,
  selectionEndCoordinate,
  getCanvasPositionFromCoordinate,
  getStampPreviewCanvasCells,
}: Options): void {
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
      offsetY,
    );
    const translatedBirthDeathPreviewGrid = birthDeathPreviewGrid
      ? translateGridToViewport(
          birthDeathPreviewGrid,
          calculatedGridColumns,
          calculatedGridRows,
          offsetX,
          offsetY,
        )
      : null;
    const translatedSelectionGrid = selectionGrid
      ? translateGridToViewport(
          selectionGrid,
          calculatedGridColumns,
          calculatedGridRows,
          offsetX,
          offsetY,
        )
      : null;

    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const axisXCanvasIndex = halfCols - offsetX;
    const axisYCanvasIndex = halfRows - 1 - offsetY;
    const axisStrokeColor = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(9, 105, 218, 0.35)';
    const hoverFillColor = isDark ? 'rgba(255, 196, 61, 0.24)' : 'rgba(176, 92, 0, 0.18)';
    const hoverStrokeColor = isDark ? 'rgba(255, 220, 110, 0.98)' : 'rgba(111, 58, 0, 0.96)';
    const selectionFillColor = isDark ? 'rgba(96, 165, 250, 0.22)' : 'rgba(37, 99, 235, 0.16)';
    const selectionStrokeColor = isDark ? 'rgba(147, 197, 253, 0.96)' : 'rgba(29, 78, 216, 0.88)';
    const selectionRectStrokeColor = isDark
      ? 'rgba(147, 197, 253, 0.95)'
      : 'rgba(29, 78, 216, 0.95)';
    const selectionRectFillColor = isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(37, 99, 235, 0.08)';
    const stampPreviewHatchColor = isDark ? 'rgba(248, 250, 252, 0.42)' : 'rgba(15, 23, 42, 0.28)';
    const previewBirthFillColor = isDark ? 'rgba(34, 197, 94, 0.38)' : 'rgba(34, 197, 94, 0.32)';
    const previewDeathStrokeColor = isDark
      ? 'rgba(248, 113, 113, 0.98)'
      : 'rgba(220, 38, 38, 0.94)';

    // Draw all visible cells using the currently available canvas space.
    for (let columnIndex = 0; columnIndex < calculatedGridRows; columnIndex++) {
      for (let rowIndex = 0; rowIndex < calculatedGridColumns; rowIndex++) {
        const x = getCoordinate(rowIndex, cellSize);
        const y = getCoordinate(columnIndex, cellSize);
        const cellColor = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(cellColor, palette, isDark);

        // Fill the cell
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);

        if (translatedSelectionGrid?.[`${rowIndex},${columnIndex}`]) {
          ctx.fillStyle = selectionFillColor;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = selectionStrokeColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, cellSize - 1), Math.max(0, cellSize - 1));
        }
      }
    }

    if (translatedBirthDeathPreviewGrid) {
      const currentCellCoordinates = new Set(Object.keys(translatedGrid));
      for (const coordinate of Object.keys(translatedBirthDeathPreviewGrid)) {
        if (!currentCellCoordinates.has(coordinate)) {
          const [rowString, columnString] = coordinate.split(',');
          const rowIndex = Number(rowString);
          const columnIndex = Number(columnString);
          if (!Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) continue;

          const x = getCoordinate(rowIndex, cellSize);
          const y = getCoordinate(columnIndex, cellSize);
          ctx.save();
          ctx.fillStyle = previewBirthFillColor;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.restore();
        }
      }

      const nextCellCoordinates = new Set(Object.keys(translatedBirthDeathPreviewGrid));
      for (const coordinate of Object.keys(translatedGrid)) {
        if (!nextCellCoordinates.has(coordinate)) {
          const [rowString, columnString] = coordinate.split(',');
          const rowIndex = Number(rowString);
          const columnIndex = Number(columnString);
          if (!Number.isFinite(rowIndex) || !Number.isFinite(columnIndex)) continue;

          const x = getCoordinate(rowIndex, cellSize);
          const y = getCoordinate(columnIndex, cellSize);
          ctx.save();
          ctx.strokeStyle = previewDeathStrokeColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, cellSize - 1), Math.max(0, cellSize - 1));
          ctx.restore();
        }
      }
    }

    if (isEditMode && hoveredCell) {
      const hoverX = getCoordinate(hoveredCell.canvasRowIndex, cellSize);
      const hoverY = getCoordinate(hoveredCell.canvasColumnIndex, cellSize);
      ctx.fillStyle = hoverFillColor;
      ctx.fillRect(hoverX, hoverY, cellSize, cellSize);
      ctx.strokeStyle = hoverStrokeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        hoverX + 0.5,
        hoverY + 0.5,
        Math.max(0, cellSize - 1),
        Math.max(0, cellSize - 1),
      );
    }

    if (selectionStartCoordinate && selectionEndCoordinate) {
      const startPosition = getCanvasPositionFromCoordinate(selectionStartCoordinate);
      const endPosition = getCanvasPositionFromCoordinate(selectionEndCoordinate);

      if (startPosition && endPosition) {
        const minRowIndex = Math.min(startPosition.canvasRowIndex, endPosition.canvasRowIndex);
        const maxRowIndex = Math.max(startPosition.canvasRowIndex, endPosition.canvasRowIndex);
        const minColumnIndex = Math.min(
          startPosition.canvasColumnIndex,
          endPosition.canvasColumnIndex,
        );
        const maxColumnIndex = Math.max(
          startPosition.canvasColumnIndex,
          endPosition.canvasColumnIndex,
        );
        const rectX = getCoordinate(minRowIndex, cellSize);
        const rectY = getCoordinate(minColumnIndex, cellSize);
        const rectWidth = getCoordinate(maxRowIndex, cellSize) + cellSize - rectX;
        const rectHeight = getCoordinate(maxColumnIndex, cellSize) + cellSize - rectY;

        ctx.fillStyle = selectionRectFillColor;
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeStyle = selectionRectStrokeColor;
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          rectX + 0.5,
          rectY + 0.5,
          Math.max(0, rectWidth - 1),
          Math.max(0, rectHeight - 1),
        );
        ctx.setLineDash([]);
      }
    }

    if (isEditMode && activeEditTool === 'stamp' && stampPattern && hoveredCell) {
      const stampPreviewCells = getStampPreviewCanvasCells(hoveredCell);

      if (stampPreviewCells.length > 0) {
        for (const previewCell of stampPreviewCells) {
          const previewX = getCoordinate(previewCell.rowIndex, cellSize);
          const previewY = getCoordinate(previewCell.columnIndex, cellSize);

          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = activeDrawColor;
          ctx.fillRect(previewX, previewY, cellSize, cellSize);
          ctx.restore();

          drawCrossHatchCell(
            ctx,
            previewX,
            previewY,
            cellSize,
            stampPreviewHatchColor,
            Math.max(3, Math.floor(cellSize / 3)),
          );
        }
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
    canvasRef,
    grid,
    calculatedGridColumns,
    calculatedGridRows,
    cellSize,
    canvasWidth,
    canvasHeight,
    offsetX,
    offsetY,
    palette,
    isDark,
    hoveredCell,
    isEditMode,
    activeEditTool,
    stampPattern,
    activeDrawColor,
    birthDeathPreviewGrid,
    selectionGrid,
    selectionStartCoordinate,
    selectionEndCoordinate,
    getCanvasPositionFromCoordinate,
    getStampPreviewCanvasCells,
  ]);
}
