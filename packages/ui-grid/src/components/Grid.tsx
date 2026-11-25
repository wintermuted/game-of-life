import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Game,
  LifeGrid,
  GameRules,
  calculateNextGeneration,
  DEFAULT_RULES,
} from '@game-of-life/core';
import '../styles/Grid.css';
import CanvasGrid from './CanvasGrid';
import { ColorPalette, useThemeMode } from '@game-of-life/ui';
import GridMinimap from './GridMinimap';
import { parseCoordinateKey, ViewportMetrics } from './useMinimapGeometry';
import { useTranslation } from 'react-i18next';

interface Props {
  game: Game;
  centerCoordinateRequest?: { coordinate: string; requestKey: number } | null;
  onHoverCoordinateChange?: (coordinate: string | null) => void;
  hoveredCoordinate?: string | null;
  onContextCoordinateRequest?: (coordinate: string) => void;
  onPaintStart?: () => void;
  selectionGrid?: LifeGrid | null;
  selectionStartCoordinate?: string | null;
  selectionEndCoordinate?: string | null;
  onSelectionStart?: (coordinate: string) => void;
  onSelectionChange?: (coordinate: string) => void;
  onSelectionEnd?: () => void;
  selectionCount?: number;
  palette?: ColorPalette;
  isEditMode?: boolean;
  rules?: GameRules;
  onCellPaint?: (coordinate: string, nextCellColor: string | null) => void;
  activeDrawColor?: string;
  activeEditTool?: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
  stampPattern?: LifeGrid | null;
  onStampPatternAtCoordinate?: (coordinate: string) => void;
  showBirthDeathPreview?: boolean;
  isBoardMaximized?: boolean;
  toggleBoardMaximized?: () => void;
  playOverlayContent?: ReactNode;
}

const PAN_AMOUNT = 10;
const DEFAULT_CELL_SIZE = 7;
const MIN_CELL_SIZE = 2;
const MAX_CELL_SIZE = 20;
const ZOOM_STEP = 1;
const MINIMAP_PAN_SENSITIVITY = 0.075;
const MAX_BOARD_OFFSET = 20000;

function clampBoardOffset(value: number): number {
  return Math.max(-MAX_BOARD_OFFSET, Math.min(MAX_BOARD_OFFSET, value));
}

function isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tagName);
}

function Grid({
  game,
  centerCoordinateRequest = null,
  onHoverCoordinateChange,
  hoveredCoordinate = null,
  onContextCoordinateRequest,
  onPaintStart,
  selectionGrid = null,
  selectionStartCoordinate = null,
  selectionEndCoordinate = null,
  onSelectionStart,
  onSelectionChange,
  onSelectionEnd,
  selectionCount = 0,
  palette,
  isEditMode = false,
  rules = DEFAULT_RULES,
  onCellPaint,
  activeDrawColor,
  activeEditTool,
  stampPattern = null,
  onStampPatternAtCoordinate,
  showBirthDeathPreview = true,
  isBoardMaximized = false,
  toggleBoardMaximized,
  playOverlayContent,
}: Props): React.JSX.Element {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [viewportMetrics, setViewportMetrics] = useState<ViewportMetrics | null>(null);
  const { mode } = useThemeMode();
  const { t } = useTranslation();

  const gameStatus = game.getStatus();
  const birthDeathPreviewGrid = showBirthDeathPreview
    ? calculateNextGeneration(gameStatus, rules)
    : null;

  const handlePanUp = () => setOffsetY((prev) => clampBoardOffset(prev - PAN_AMOUNT));
  const handlePanDown = () => setOffsetY((prev) => clampBoardOffset(prev + PAN_AMOUNT));
  const handlePanLeft = () => setOffsetX((prev) => clampBoardOffset(prev - PAN_AMOUNT));
  const handlePanRight = () => setOffsetX((prev) => clampBoardOffset(prev + PAN_AMOUNT));
  const handleCenter = () => {
    setOffsetX(0);
    setOffsetY(0);
  };
  const handleZoomIn = () => setCellSize((prev) => Math.min(prev + ZOOM_STEP, MAX_CELL_SIZE));
  const handleZoomOut = () => setCellSize((prev) => Math.max(prev - ZOOM_STEP, MIN_CELL_SIZE));
  const cursorLabel = t('controls.hoveredCell');
  const hoveredCellValue = hoveredCoordinate ?? t('controls.hoveredCellNone');
  const selectedLiveCellsLabel = t('controls.liveCellsSelected', { count: selectionCount });

  const viewportCenter = useMemo(() => {
    if (!viewportMetrics) {
      return { x: 0, y: 0 };
    }

    const halfCols = Math.floor(viewportMetrics.columns / 2);
    const halfRows = Math.floor(viewportMetrics.rows / 2);
    const centerX = (viewportMetrics.columns - 1) / 2 - halfCols + viewportMetrics.offsetX;
    const centerY = halfRows - 1 - (viewportMetrics.rows - 1) / 2 - viewportMetrics.offsetY;

    return {
      x: Math.round(centerX),
      y: Math.round(centerY),
    };
  }, [viewportMetrics]);

  function handlePanByDrag(deltaX: number, deltaY: number): void {
    if (deltaX !== 0) {
      setOffsetX((previous) => clampBoardOffset(previous + deltaX));
    }
    if (deltaY !== 0) {
      setOffsetY((previous) => clampBoardOffset(previous + deltaY));
    }
  }

  const handleViewportMetricsChange = useCallback((metrics: ViewportMetrics) => {
    setViewportMetrics((previous) => {
      if (
        previous &&
        previous.columns === metrics.columns &&
        previous.rows === metrics.rows &&
        previous.offsetX === metrics.offsetX &&
        previous.offsetY === metrics.offsetY
      ) {
        return previous;
      }

      return metrics;
    });
  }, []);

  const centerViewportOnWorldCoordinate = useCallback(
    (targetX: number, targetY: number) => {
      if (!viewportMetrics) return;

      const halfCols = Math.floor(viewportMetrics.columns / 2);
      const halfRows = Math.floor(viewportMetrics.rows / 2);
      const nextOffsetX = Math.round(targetX + halfCols - (viewportMetrics.columns - 1) / 2);
      const nextOffsetY = Math.round(halfRows - 1 - (viewportMetrics.rows - 1) / 2 - targetY);

      setOffsetX(clampBoardOffset(nextOffsetX));
      setOffsetY(clampBoardOffset(nextOffsetY));
    },
    [viewportMetrics],
  );

  const panViewportToWorldCoordinate = useCallback(
    (targetX: number, targetY: number) => {
      if (!viewportMetrics) return;

      const halfCols = Math.floor(viewportMetrics.columns / 2);
      const halfRows = Math.floor(viewportMetrics.rows / 2);

      const currentCenterX = (viewportMetrics.columns - 1) / 2 - halfCols + viewportMetrics.offsetX;
      const currentCenterY =
        halfRows - 1 - (viewportMetrics.rows - 1) / 2 - viewportMetrics.offsetY;
      const blendedCenterX = currentCenterX + (targetX - currentCenterX) * MINIMAP_PAN_SENSITIVITY;
      const blendedCenterY = currentCenterY + (targetY - currentCenterY) * MINIMAP_PAN_SENSITIVITY;
      const nextOffsetX = Math.round(blendedCenterX + halfCols - (viewportMetrics.columns - 1) / 2);
      const nextOffsetY = Math.round(
        halfRows - 1 - (viewportMetrics.rows - 1) / 2 - blendedCenterY,
      );

      setOffsetX(clampBoardOffset(nextOffsetX));
      setOffsetY(clampBoardOffset(nextOffsetY));
    },
    [viewportMetrics],
  );

  useEffect(() => {
    setOffsetX((previous) => clampBoardOffset(previous));
    setOffsetY((previous) => clampBoardOffset(previous));
  }, []);

  useEffect(() => {
    if (!centerCoordinateRequest) return;

    const parsed = parseCoordinateKey(centerCoordinateRequest.coordinate);
    if (!parsed) return;

    centerViewportOnWorldCoordinate(parsed.x, parsed.y);
  }, [centerCoordinateRequest, centerViewportOnWorldCoordinate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isInteractiveKeyboardTarget(event.target)) return;
      if (event.defaultPrevented) return;

      switch (event.key.toLowerCase()) {
        case 'q':
          event.preventDefault();
          handleZoomOut();
          return;
        case 'e':
          event.preventDefault();
          handleZoomIn();
          return;
        case 'r':
          event.preventDefault();
          handleCenter();
          return;
        case 'w':
          event.preventDefault();
          handlePanUp();
          return;
        case 'a':
          event.preventDefault();
          handlePanLeft();
          return;
        case 's':
          event.preventDefault();
          handlePanDown();
          return;
        case 'd':
          event.preventDefault();
          handlePanRight();
          return;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="Grid">
      <div className="grid-stage" data-theme-mode={mode}>
        <CanvasGrid
          grid={gameStatus}
          onHoverCoordinateChange={onHoverCoordinateChange}
          onContextCoordinateRequest={onContextCoordinateRequest}
          gridSize={100}
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
          onPaintStart={onPaintStart}
          selectionGrid={selectionGrid}
          selectionStartCoordinate={selectionStartCoordinate}
          selectionEndCoordinate={selectionEndCoordinate}
          onSelectionStart={onSelectionStart}
          onSelectionChange={onSelectionChange}
          onSelectionEnd={onSelectionEnd}
          palette={palette}
          isEditMode={isEditMode}
          onCellPaint={onCellPaint}
          activeDrawColor={activeDrawColor}
          activeEditTool={activeEditTool}
          stampPattern={stampPattern}
          onStampPatternAtCoordinate={onStampPatternAtCoordinate}
          birthDeathPreviewGrid={birthDeathPreviewGrid}
          onPanByDrag={handlePanByDrag}
          onViewportMetricsChange={handleViewportMetricsChange}
        />
        <GridMinimap
          gameStatus={gameStatus}
          viewportMetrics={viewportMetrics}
          cellSize={cellSize}
          minCellSize={MIN_CELL_SIZE}
          maxCellSize={MAX_CELL_SIZE}
          handlePanUp={handlePanUp}
          handlePanDown={handlePanDown}
          handlePanLeft={handlePanLeft}
          handlePanRight={handlePanRight}
          handleCenter={handleCenter}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          panViewportToWorldCoordinate={panViewportToWorldCoordinate}
          isBoardMaximized={isBoardMaximized}
          toggleBoardMaximized={toggleBoardMaximized}
        />
        {selectionCount > 0 && (
          <div className="grid-overlay-selection-banner" aria-live="polite">
            <span>{selectedLiveCellsLabel}</span>
          </div>
        )}
        <div className="grid-overlay-readout grid-overlay-readout-bottom-right" aria-live="polite">
          <span className="grid-overlay-readout-coordinates">
            Center: ({viewportCenter.x}, {viewportCenter.y})
          </span>
          <span className="grid-overlay-readout-coordinates">
            {cursorLabel}: {hoveredCellValue}
          </span>
        </div>
        {playOverlayContent && (
          <div className="grid-overlay-controls grid-overlay-controls-top-left">
            {playOverlayContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default Grid;
