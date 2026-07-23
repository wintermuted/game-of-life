import { useEffect, useRef, useState } from "react";
import { DEFAULT_LIVE_CELL_COLOR, LifeGrid } from '@game-of-life/core';
import { getCellFillColor, translateGridToViewport } from '../util/coordinate';
import { ColorPalette } from '../constants/colors';
import { useThemeMode } from '../ThemeContext';

const CELL_GAP = 1;

function getCoordinate(rowIndex: number, cellSize: number) {
  return rowIndex + (cellSize * rowIndex);
}

interface Props {
  grid: LifeGrid;
  gridSize: number; // should only be even numbers (not used directly, calculated from cellSize)
  cellSize: number;
  onHoverCoordinateChange?: (coordinate: string | null) => void;
  onContextCoordinateRequest?: (coordinate: string) => void;
  onPaintStart?: () => void;
  selectionGrid?: LifeGrid | null;
  selectionStartCoordinate?: string | null;
  selectionEndCoordinate?: string | null;
  onSelectionStart?: (coordinate: string) => void;
  onSelectionChange?: (coordinate: string) => void;
  onSelectionEnd?: () => void;
  offsetX?: number;
  offsetY?: number;
  palette?: ColorPalette;
  isEditMode?: boolean;
  onCellPaint?: (coordinate: string, nextCellColor: string | null) => void;
  activeDrawColor?: string;
  activeEditTool?: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
  stampPattern?: LifeGrid | null;
  onStampPatternAtCoordinate?: (coordinate: string) => void;
  onPanByDrag?: (deltaX: number, deltaY: number) => void;
  onViewportMetricsChange?: (metrics: {
    columns: number;
    rows: number;
    offsetX: number;
    offsetY: number;
  }) => void;
}

interface HoveredCell {
  canvasRowIndex: number;
  canvasColumnIndex: number;
  coordinate: string;
}

interface ParsedCoordinate {
  x: number;
  y: number;
}

function parseCoordinateKey(coordinate: string): ParsedCoordinate | null {
  const [xString, yString] = coordinate.split(',');
  const x = Number(xString);
  const y = Number(yString);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return { x, y };
}

function getGridBounds(grid: LifeGrid): { minX: number; maxX: number; minY: number; maxY: number } | null {
  const coordinates = Object.keys(grid)
    .map(parseCoordinateKey)
    .filter((entry): entry is ParsedCoordinate => entry !== null);

  if (coordinates.length === 0) return null;

  return coordinates.reduce(
    (bounds, coordinate) => ({
      minX: Math.min(bounds.minX, coordinate.x),
      maxX: Math.max(bounds.maxX, coordinate.x),
      minY: Math.min(bounds.minY, coordinate.y),
      maxY: Math.max(bounds.maxY, coordinate.y),
    }),
    {
      minX: coordinates[0].x,
      maxX: coordinates[0].x,
      minY: coordinates[0].y,
      maxY: coordinates[0].y,
    },
  );
}

function CanvasGrid({ onHoverCoordinateChange, onContextCoordinateRequest, onPaintStart, selectionGrid = null, selectionStartCoordinate = null, selectionEndCoordinate = null, onSelectionStart, onSelectionChange, onSelectionEnd, grid, cellSize, offsetX = 0, offsetY = 0, palette, isEditMode = false, onCellPaint, activeDrawColor = DEFAULT_LIVE_CELL_COLOR, activeEditTool = 'pencil', stampPattern = null, onStampPatternAtCoordinate, onPanByDrag, onViewportMetricsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerDownRef = useRef(false);
  const isGrabPanningRef = useRef(false);
  const lastGrabPointerRef = useRef<{ x: number; y: number } | null>(null);
  const grabRemainderRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const strokeCellColorRef = useRef<string | null>(null);
  const paintedCoordinatesRef = useRef<Set<string>>(new Set());
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

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
  const cellStride = cellSize + CELL_GAP;
  const calculatedGridColumns = Math.max(2, Math.floor(canvasWidth / cellStride));
  const calculatedGridRows = Math.max(2, Math.floor(canvasHeight / cellStride));
  const centerReferenceGridSize = Math.min(calculatedGridColumns, calculatedGridRows);

  function getCanvasPositionFromCoordinate(coordinate: string) {
    const [xString, yString] = coordinate.split(',');
    const x = Number(xString);
    const y = Number(yString);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }

    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const canvasRowIndex = x + halfCols - offsetX;
    const canvasColumnIndex = halfRows - 1 - y - offsetY;

    return { canvasRowIndex, canvasColumnIndex };
  }

  function getHoveredCellFromPointer(event: React.MouseEvent<HTMLCanvasElement>): HoveredCell | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvasRowIndex = Math.floor(x / cellStride);
    const canvasColumnIndex = Math.floor(y / cellStride);

    if (
      canvasRowIndex < 0 ||
      canvasColumnIndex < 0 ||
      canvasRowIndex >= calculatedGridColumns ||
      canvasColumnIndex >= calculatedGridRows
    ) {
      return null;
    }

    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const gridX = canvasRowIndex - halfCols + offsetX;
    const gridY = halfRows - 1 - canvasColumnIndex - offsetY;

    return {
      canvasRowIndex,
      canvasColumnIndex,
      coordinate: `${gridX},${gridY}`,
    };
  }

  function endPaintStroke(): void {
    isPointerDownRef.current = false;
    isGrabPanningRef.current = false;
    lastGrabPointerRef.current = null;
    grabRemainderRef.current = { x: 0, y: 0 };
    strokeCellColorRef.current = null;
    paintedCoordinatesRef.current.clear();
  }

  function paintHoveredCell(nextHoveredCell: HoveredCell | null): void {
    if (!isEditMode || !onCellPaint || !nextHoveredCell) return;

    if (!paintedCoordinatesRef.current.has(nextHoveredCell.coordinate)) {
      paintedCoordinatesRef.current.add(nextHoveredCell.coordinate);
      onCellPaint(nextHoveredCell.coordinate, strokeCellColorRef.current);
    }
  }

  function getStampPreviewCanvasCells(nextHoveredCell: HoveredCell): Array<{ rowIndex: number; columnIndex: number }> {
    if (!stampPattern) return [];

    const target = parseCoordinateKey(nextHoveredCell.coordinate);
    const bounds = getGridBounds(stampPattern);
    if (!target || !bounds) return [];

    const halfCols = Math.floor(calculatedGridColumns / 2);
    const halfRows = Math.floor(calculatedGridRows / 2);
    const anchorX = Math.floor((bounds.minX + bounds.maxX) / 2);
    const anchorY = Math.floor((bounds.minY + bounds.maxY) / 2);
    const deltaX = target.x - anchorX;
    const deltaY = target.y - anchorY;
    const stampCells: Array<{ rowIndex: number; columnIndex: number }> = [];

    for (const coordinate of Object.keys(stampPattern)) {
      const parsed = parseCoordinateKey(coordinate);
      if (!parsed) continue;

      const worldX = parsed.x + deltaX;
      const worldY = parsed.y + deltaY;
      const rowIndex = worldX + halfCols - offsetX;
      const columnIndex = halfRows - 1 - worldY - offsetY;

      if (
        rowIndex < 0 ||
        columnIndex < 0 ||
        rowIndex >= calculatedGridColumns ||
        columnIndex >= calculatedGridRows
      ) {
        continue;
      }

      stampCells.push({ rowIndex, columnIndex });
    }

    return stampCells;
  }

  useEffect(() => {
    const handleWindowMouseUp = () => {
      endPaintStroke();
    };

    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  useEffect(() => {
    onViewportMetricsChange?.({
      columns: calculatedGridColumns,
      rows: calculatedGridRows,
      offsetX,
      offsetY,
    });
  }, [calculatedGridColumns, calculatedGridRows, offsetX, offsetY, onViewportMetricsChange]);

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
    const translatedSelectionGrid = selectionGrid
      ? translateGridToViewport(selectionGrid, calculatedGridColumns, calculatedGridRows, offsetX, offsetY)
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
    const selectionRectStrokeColor = isDark ? 'rgba(147, 197, 253, 0.95)' : 'rgba(29, 78, 216, 0.95)';
    const selectionRectFillColor = isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(37, 99, 235, 0.08)';
    const stampPreviewFillColor = isDark ? 'rgba(248, 250, 252, 0.09)' : 'rgba(15, 23, 42, 0.07)';
    const stampPreviewStrokeColor = isDark ? 'rgba(248, 250, 252, 0.96)' : 'rgba(30, 41, 59, 0.92)';

    // Draw all visible cells using the currently available canvas space.
    for (let columnIndex = 0; columnIndex < calculatedGridRows; columnIndex++) {
      for (let rowIndex = 0; rowIndex < calculatedGridColumns; rowIndex++) {
        const x = getCoordinate(rowIndex, cellSize);
        const y = getCoordinate(columnIndex, cellSize);
        const cellColor = translatedGrid[`${rowIndex},${columnIndex}`];
        const color = getCellFillColor(
          cellColor,
          palette,
          isDark
        );

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

    if (hoveredCell) {
      const hoverX = getCoordinate(hoveredCell.canvasRowIndex, cellSize);
      const hoverY = getCoordinate(hoveredCell.canvasColumnIndex, cellSize);
      ctx.fillStyle = hoverFillColor;
      ctx.fillRect(hoverX, hoverY, cellSize, cellSize);
      ctx.strokeStyle = hoverStrokeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hoverX + 0.5, hoverY + 0.5, Math.max(0, cellSize - 1), Math.max(0, cellSize - 1));
    }

    if (selectionStartCoordinate && selectionEndCoordinate) {
      const startPosition = getCanvasPositionFromCoordinate(selectionStartCoordinate);
      const endPosition = getCanvasPositionFromCoordinate(selectionEndCoordinate);

      if (startPosition && endPosition) {
        const minRowIndex = Math.min(startPosition.canvasRowIndex, endPosition.canvasRowIndex);
        const maxRowIndex = Math.max(startPosition.canvasRowIndex, endPosition.canvasRowIndex);
        const minColumnIndex = Math.min(startPosition.canvasColumnIndex, endPosition.canvasColumnIndex);
        const maxColumnIndex = Math.max(startPosition.canvasColumnIndex, endPosition.canvasColumnIndex);
        const rectX = getCoordinate(minRowIndex, cellSize);
        const rectY = getCoordinate(minColumnIndex, cellSize);
        const rectWidth = getCoordinate(maxRowIndex, cellSize) + cellSize - rectX;
        const rectHeight = getCoordinate(maxColumnIndex, cellSize) + cellSize - rectY;

        ctx.fillStyle = selectionRectFillColor;
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeStyle = selectionRectStrokeColor;
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rectX + 0.5, rectY + 0.5, Math.max(0, rectWidth - 1), Math.max(0, rectHeight - 1));
        ctx.setLineDash([]);
      }
    }

    if (isEditMode && activeEditTool === 'stamp' && stampPattern && hoveredCell) {
      const stampPreviewCells = getStampPreviewCanvasCells(hoveredCell);

      if (stampPreviewCells.length > 0) {
        ctx.fillStyle = stampPreviewFillColor;
        ctx.strokeStyle = stampPreviewStrokeColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);

        for (const previewCell of stampPreviewCells) {
          const previewX = getCoordinate(previewCell.rowIndex, cellSize);
          const previewY = getCoordinate(previewCell.columnIndex, cellSize);
          ctx.fillRect(previewX, previewY, cellSize, cellSize);
          ctx.strokeRect(previewX + 0.5, previewY + 0.5, Math.max(0, cellSize - 1), Math.max(0, cellSize - 1));
        }

        ctx.setLineDash([]);
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
    hoveredCell,
    isEditMode,
    activeEditTool,
    stampPattern,
  ]);

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    if (!isEditMode && activeEditTool !== 'grab') return;

    const nextHoveredCell = getHoveredCellFromPointer(event);
    if (activeEditTool === 'grab') {
      isPointerDownRef.current = true;
      isGrabPanningRef.current = true;
      lastGrabPointerRef.current = { x: event.clientX, y: event.clientY };
      grabRemainderRef.current = { x: 0, y: 0 };
      return;
    }

    if (!nextHoveredCell) return;

    if (activeEditTool === 'stamp') {
      if (stampPattern && onPaintStart) {
        onPaintStart();
      }
      onStampPatternAtCoordinate?.(nextHoveredCell.coordinate);
      return;
    }

    if (activeEditTool === 'selection') {
      isPointerDownRef.current = true;
      onSelectionStart?.(nextHoveredCell.coordinate);
      return;
    }

    if (!onCellPaint) return;

    onPaintStart?.();
    isPointerDownRef.current = true;
    strokeCellColorRef.current = activeEditTool === 'eraser' ? null : activeDrawColor;
    paintedCoordinatesRef.current = new Set();
    paintHoveredCell(nextHoveredCell);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const nextHoveredCell = getHoveredCellFromPointer(event);

    setHoveredCell((previous) => {
      if (previous?.coordinate === nextHoveredCell?.coordinate) {
        return previous;
      }

      return nextHoveredCell;
    });

    onHoverCoordinateChange?.(nextHoveredCell?.coordinate ?? null);

    if (isPointerDownRef.current && activeEditTool === 'grab' && isGrabPanningRef.current && lastGrabPointerRef.current) {
      const movementX = event.clientX - lastGrabPointerRef.current.x;
      const movementY = event.clientY - lastGrabPointerRef.current.y;
      const pendingX = movementX + grabRemainderRef.current.x;
      const pendingY = movementY + grabRemainderRef.current.y;
      const deltaCellsX = Math.trunc(pendingX / cellStride);
      const deltaCellsY = Math.trunc(pendingY / cellStride);

      if (deltaCellsX !== 0 || deltaCellsY !== 0) {
        onPanByDrag?.(-deltaCellsX, -deltaCellsY);
      }

      grabRemainderRef.current = {
        x: pendingX - (deltaCellsX * cellStride),
        y: pendingY - (deltaCellsY * cellStride),
      };
      lastGrabPointerRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    if (isPointerDownRef.current) {
      if (activeEditTool === 'selection') {
        if (nextHoveredCell) {
          onSelectionChange?.(nextHoveredCell.coordinate);
        }
      } else {
        paintHoveredCell(nextHoveredCell);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (activeEditTool === 'selection') {
      onSelectionEnd?.();
    }
    endPaintStroke();
  };

  const handleCanvasContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const nextHoveredCell = getHoveredCellFromPointer(event);
    if (!nextHoveredCell) return;

    setHoveredCell(nextHoveredCell);
    onHoverCoordinateChange?.(nextHoveredCell.coordinate);
    onContextCoordinateRequest?.(nextHoveredCell.coordinate);
  };

  const handleCanvasMouseLeave = () => {
    if (activeEditTool === 'selection') {
      onSelectionEnd?.();
    }
    endPaintStroke();
    setHoveredCell(null);
    onHoverCoordinateChange?.(null);
  };

  return (
    <div className="CanvasGrid" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`canvas-grid-surface${isEditMode || activeEditTool === 'grab' ? ' canvas-grid-surface-editable' : ''}${isEditMode || activeEditTool === 'grab' ? ` canvas-grid-surface-tool-${activeEditTool}` : ''}${isGrabPanningRef.current ? ' canvas-grid-surface-tool-grab-active' : ''}`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onContextMenu={handleCanvasContextMenu}
        onMouseLeave={handleCanvasMouseLeave}
      />
    </div>
  );
}

export default CanvasGrid;
