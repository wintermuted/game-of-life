import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Game, getCellColor, isLiveCell, LifeGrid, GameRules, calculateNextGeneration, DEFAULT_RULES } from "@game-of-life/core";
import '../styles/Grid.css';
import CanvasGrid from './CanvasGrid';
import { ColorPalette } from '../constants/colors';
import { useThemeMode } from '../ThemeContext';
import { Maximize2, Minimize2 } from 'lucide-react';
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
const MINIMAP_SIZE = 152;
const MINIMAP_PADDING = 6;
const MINIMAP_PAN_SENSITIVITY = 0.075;
const MINIMAP_MAX_HALF_WORLD = 500;
const MINIMAP_ZOOM_FACTOR = 8 / 3;
const MINIMAP_FOLLOW_PADDING = 2;
const MAX_BOARD_OFFSET = 20000;
const MAX_MINIMAP_COORDINATE = 1000000;

interface ParsedCoordinate {
  x: number;
  y: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface ViewportMetrics {
  columns: number;
  rows: number;
  offsetX: number;
  offsetY: number;
}

interface MinimapCenter {
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

  if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) {
    return null;
  }

  if (Math.abs(x) > MAX_MINIMAP_COORDINATE || Math.abs(y) > MAX_MINIMAP_COORDINATE) {
    return null;
  }

  return { x, y };
}

function clampBoardOffset(value: number): number {
  return Math.max(-MAX_BOARD_OFFSET, Math.min(MAX_BOARD_OFFSET, value));
}

function getGridBounds(grid: LifeGrid): Bounds | null {
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

function isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tagName);
}

// Inline SVG icons for grid controls
const IconUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;
const IconDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IconLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const IconRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const IconCenter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>;
const IconZoomIn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const IconZoomOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;

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
}: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [viewportMetrics, setViewportMetrics] = useState<ViewportMetrics | null>(null);
  const [isMiniMapPanning, setIsMiniMapPanning] = useState(false);
  const isMiniMapPanningRef = useRef(false);
  const miniMapBoundsRef = useRef<Bounds | null>(null);
  const miniMapCenterRef = useRef<MinimapCenter>({ x: 0, y: 0 });
  const miniMapBoundsViewportKeyRef = useRef<string | null>(null);
  const { mode } = useThemeMode();
  const { t } = useTranslation();

  if (!game) return null;

  const gameStatus = game.getStatus ? game.getStatus() : {};
  const birthDeathPreviewGrid = showBirthDeathPreview ? calculateNextGeneration(gameStatus, rules) : null;

  const handlePanUp = () => setOffsetY(prev => clampBoardOffset(prev - PAN_AMOUNT));
  const handlePanDown = () => setOffsetY(prev => clampBoardOffset(prev + PAN_AMOUNT));
  const handlePanLeft = () => setOffsetX(prev => clampBoardOffset(prev - PAN_AMOUNT));
  const handlePanRight = () => setOffsetX(prev => clampBoardOffset(prev + PAN_AMOUNT));
  const handleCenter = () => { setOffsetX(0); setOffsetY(0); };
  const handleZoomIn = () => setCellSize(prev => Math.min(prev + ZOOM_STEP, MAX_CELL_SIZE));
  const handleZoomOut = () => setCellSize(prev => Math.max(prev - ZOOM_STEP, MIN_CELL_SIZE));
  const panUpLabel = t('controls.panUp');
  const panLeftLabel = t('controls.panLeft');
  const centerViewLabel = t('controls.centerView');
  const panRightLabel = t('controls.panRight');
  const panDownLabel = t('controls.panDown');
  const zoomOutLabel = t('controls.zoomOut');
  const zoomInLabel = t('controls.zoomIn');
  const maximizeViewLabel = t('controls.maximizeBoard');
  const restoreViewLabel = t('controls.restoreBoard');
  const cursorLabel = t('controls.hoveredCell');
  const hoveredCellValue = hoveredCoordinate ?? t('controls.hoveredCellNone');
  const miniMapLabel = t('controls.miniMap');
  const miniMapViewportLabel = t('controls.miniMapViewport');
  const selectedLiveCellsLabel = t('controls.liveCellsSelected', { count: selectionCount });

  const viewportCenter = useMemo(() => {
    if (!viewportMetrics) {
      return { x: 0, y: 0 };
    }

    const halfCols = Math.floor(viewportMetrics.columns / 2);
    const halfRows = Math.floor(viewportMetrics.rows / 2);
    const centerX = ((viewportMetrics.columns - 1) / 2) - halfCols + viewportMetrics.offsetX;
    const centerY = (halfRows - 1) - ((viewportMetrics.rows - 1) / 2) - viewportMetrics.offsetY;

    return {
      x: Math.round(centerX),
      y: Math.round(centerY),
    };
  }, [viewportMetrics]);

  const miniMapGeometry = useMemo(() => {
    if (!viewportMetrics) return null;

    const viewportKey = `${viewportMetrics.columns}:${viewportMetrics.rows}:${viewportMetrics.offsetX}:${viewportMetrics.offsetY}`;

    const halfCols = Math.floor(viewportMetrics.columns / 2);
    const halfRows = Math.floor(viewportMetrics.rows / 2);

    const viewportBounds: Bounds = {
      minX: -halfCols + viewportMetrics.offsetX,
      maxX: -halfCols + viewportMetrics.offsetX + viewportMetrics.columns - 1,
      minY: halfRows - viewportMetrics.offsetY - viewportMetrics.rows,
      maxY: halfRows - 1 - viewportMetrics.offsetY,
    };

    const liveBounds = getGridBounds(gameStatus);
    const viewportCenterX = (viewportBounds.minX + viewportBounds.maxX) / 2;
    const viewportCenterY = (viewportBounds.minY + viewportBounds.maxY) / 2;

    const viewportHalfWidth = viewportMetrics.columns / 2;
    const viewportHalfHeight = viewportMetrics.rows / 2;

    const minHalfWidthFromViewport = Math.min(
      Math.ceil(viewportHalfWidth * MINIMAP_ZOOM_FACTOR) + MINIMAP_FOLLOW_PADDING,
      MINIMAP_MAX_HALF_WORLD,
    );
    const minHalfHeightFromViewport = Math.min(
      Math.ceil(viewportHalfHeight * MINIMAP_ZOOM_FACTOR) + MINIMAP_FOLLOW_PADDING,
      MINIMAP_MAX_HALF_WORLD,
    );

    const applyFollowAxis = (
      currentCenter: number,
      viewportCenter: number,
      halfWorld: number,
      viewportHalf: number,
    ): number => {
      const visibleHalfWorld = Math.max(viewportHalf, halfWorld / MINIMAP_ZOOM_FACTOR);
      const followThreshold = Math.max(0, visibleHalfWorld - viewportHalf - MINIMAP_FOLLOW_PADDING);

      if (viewportCenter > currentCenter + followThreshold) {
        return viewportCenter - followThreshold;
      }

      if (viewportCenter < currentCenter - followThreshold) {
        return viewportCenter + followThreshold;
      }

      return currentCenter;
    };

    const previousCenter = miniMapCenterRef.current;
    let nextCenterX = applyFollowAxis(previousCenter.x, viewportCenterX, minHalfWidthFromViewport, viewportHalfWidth);
    let nextCenterY = applyFollowAxis(previousCenter.y, viewportCenterY, minHalfHeightFromViewport, viewportHalfHeight);

    const minHalfWidthFromLiveRaw = liveBounds
      ? Math.ceil(Math.max(Math.abs(liveBounds.minX - nextCenterX), Math.abs(liveBounds.maxX - nextCenterX)))
      : 0;
    const minHalfHeightFromLiveRaw = liveBounds
      ? Math.ceil(Math.max(Math.abs(liveBounds.minY - nextCenterY), Math.abs(liveBounds.maxY - nextCenterY)))
      : 0;

    const minHalfWidthFromLive = Math.min(minHalfWidthFromLiveRaw, MINIMAP_MAX_HALF_WORLD);
    const minHalfHeightFromLive = Math.min(minHalfHeightFromLiveRaw, MINIMAP_MAX_HALF_WORLD);

    const halfWorldWidth = Math.max(minHalfWidthFromViewport, minHalfWidthFromLive) + 2;
    const halfWorldHeight = Math.max(minHalfHeightFromViewport, minHalfHeightFromLive) + 2;

    nextCenterX = applyFollowAxis(nextCenterX, viewportCenterX, halfWorldWidth, viewportHalfWidth);
    nextCenterY = applyFollowAxis(nextCenterY, viewportCenterY, halfWorldHeight, viewportHalfHeight);
    miniMapCenterRef.current = { x: nextCenterX, y: nextCenterY };

    const nextContentBounds: Bounds = {
      minX: nextCenterX - halfWorldWidth,
      maxX: nextCenterX + halfWorldWidth,
      minY: nextCenterY - halfWorldHeight,
      maxY: nextCenterY + halfWorldHeight,
    };

    if (!miniMapBoundsRef.current || miniMapBoundsViewportKeyRef.current !== viewportKey) {
      miniMapBoundsRef.current = nextContentBounds;
      miniMapBoundsViewportKeyRef.current = viewportKey;
    }

    const contentBounds = miniMapBoundsRef.current;
    if (!contentBounds) return null;

    const worldWidth = Math.max(1, contentBounds.maxX - contentBounds.minX);
    const worldHeight = Math.max(1, contentBounds.maxY - contentBounds.minY);
    const drawableSize = MINIMAP_SIZE - (MINIMAP_PADDING * 2);
    const baseScale = Math.min(drawableSize / worldWidth, drawableSize / worldHeight);
    const scale = Math.max(0.0001, baseScale * MINIMAP_ZOOM_FACTOR);
    const scaledWorldWidth = worldWidth * scale;
    const scaledWorldHeight = worldHeight * scale;
    const contentOffsetX = MINIMAP_PADDING + ((drawableSize - scaledWorldWidth) / 2);
    const contentOffsetY = MINIMAP_PADDING + ((drawableSize - scaledWorldHeight) / 2);

    const worldToMiniMap = (x: number, y: number) => {
      const miniX = contentOffsetX + ((x - contentBounds.minX) * scale);
      const miniY = contentOffsetY + ((contentBounds.maxY - y) * scale);
      return { miniX, miniY };
    };

    const cellPixelSize = Math.max(1, Math.floor(scale));
    
    // Viewport outline: map the actual viewport bounds to minimap coordinates
    // This ensures the outline is positioned correctly even when panned away from center
    const halfViewportWidth = viewportMetrics.columns / 2;
    const halfViewportHeight = viewportMetrics.rows / 2;
    
    // Map viewport corners to minimap
    const viewportTopLeft = worldToMiniMap(viewportCenterX - halfViewportWidth, viewportCenterY + halfViewportHeight);
    const viewportBottomRight = worldToMiniMap(viewportCenterX + halfViewportWidth, viewportCenterY - halfViewportHeight);
    
    const viewportOutlineX = viewportTopLeft.miniX;
    const viewportOutlineY = viewportTopLeft.miniY;
    const outlineWidth = viewportBottomRight.miniX - viewportTopLeft.miniX;
    const outlineHeight = viewportBottomRight.miniY - viewportTopLeft.miniY;

    return {
      worldToMiniMap,
      contentBounds,
      scale,
      cellPixelSize,
      viewportX: viewportOutlineX,
      viewportY: viewportOutlineY,
      viewportWidth: outlineWidth,
      viewportHeight: outlineHeight,
    };
  }, [gameStatus, viewportMetrics]);

  function handlePanByDrag(deltaX: number, deltaY: number) {
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

  const centerViewportOnWorldCoordinate = useCallback((targetX: number, targetY: number) => {
    if (!viewportMetrics) return;

    const halfCols = Math.floor(viewportMetrics.columns / 2);
    const halfRows = Math.floor(viewportMetrics.rows / 2);
    const nextOffsetX = Math.round(targetX + halfCols - ((viewportMetrics.columns - 1) / 2));
    const nextOffsetY = Math.round((halfRows - 1) - ((viewportMetrics.rows - 1) / 2) - targetY);

    setOffsetX(clampBoardOffset(nextOffsetX));
    setOffsetY(clampBoardOffset(nextOffsetY));
  }, [viewportMetrics]);

  const panViewportToWorldCoordinate = useCallback((targetX: number, targetY: number) => {
    if (!viewportMetrics) return;

    const halfCols = Math.floor(viewportMetrics.columns / 2);
    const halfRows = Math.floor(viewportMetrics.rows / 2);

    const currentCenterX = ((viewportMetrics.columns - 1) / 2) - halfCols + viewportMetrics.offsetX;
    const currentCenterY = (halfRows - 1) - ((viewportMetrics.rows - 1) / 2) - viewportMetrics.offsetY;
    const blendedCenterX = currentCenterX + ((targetX - currentCenterX) * MINIMAP_PAN_SENSITIVITY);
    const blendedCenterY = currentCenterY + ((targetY - currentCenterY) * MINIMAP_PAN_SENSITIVITY);
    const nextOffsetX = Math.round(blendedCenterX + halfCols - ((viewportMetrics.columns - 1) / 2));
    const nextOffsetY = Math.round((halfRows - 1) - ((viewportMetrics.rows - 1) / 2) - blendedCenterY);

    setOffsetX(clampBoardOffset(nextOffsetX));
    setOffsetY(clampBoardOffset(nextOffsetY));
  }, [viewportMetrics]);

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

  const handleMiniMapPointer = useCallback((clientX: number, clientY: number, svg: SVGSVGElement) => {
    if (!miniMapGeometry) return;

    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const viewBoxX = ((clientX - rect.left) / rect.width) * MINIMAP_SIZE;
    const viewBoxY = ((clientY - rect.top) / rect.height) * MINIMAP_SIZE;
    const clampedX = Math.max(MINIMAP_PADDING, Math.min(MINIMAP_SIZE - MINIMAP_PADDING, viewBoxX));
    const clampedY = Math.max(MINIMAP_PADDING, Math.min(MINIMAP_SIZE - MINIMAP_PADDING, viewBoxY));
    const worldX = miniMapGeometry.contentBounds.minX + ((clampedX - MINIMAP_PADDING) / miniMapGeometry.scale);
    const worldY = miniMapGeometry.contentBounds.maxY - ((clampedY - MINIMAP_PADDING) / miniMapGeometry.scale);

    panViewportToWorldCoordinate(worldX, worldY);
  }, [miniMapGeometry, panViewportToWorldCoordinate]);

  const handleMiniMapMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    isMiniMapPanningRef.current = true;
    setIsMiniMapPanning(true);
    handleMiniMapPointer(event.clientX, event.clientY, event.currentTarget);
  }, [handleMiniMapPointer]);

  const handleMiniMapMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isMiniMapPanningRef.current || (event.buttons & 1) === 0) return;
    handleMiniMapPointer(event.clientX, event.clientY, event.currentTarget);
  }, [handleMiniMapPointer]);

  const handleMiniMapPanEnd = useCallback(() => {
    isMiniMapPanningRef.current = false;
    setIsMiniMapPanning(false);
  }, []);

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
        {miniMapGeometry && (
          <div className="grid-overlay-minimap" aria-label={miniMapLabel} role="img">
            <div className="grid-overlay-minimap-frame">
              <svg
                width={MINIMAP_SIZE}
                height={MINIMAP_SIZE}
                viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
                className={`grid-overlay-minimap-canvas${isMiniMapPanning ? ' grid-overlay-minimap-canvas-panning' : ''}`}
                onMouseDown={handleMiniMapMouseDown}
                onMouseMove={handleMiniMapMouseMove}
                onMouseUp={handleMiniMapPanEnd}
                onMouseLeave={handleMiniMapPanEnd}
              >
                {Object.keys(gameStatus).map((coordinate) => {
                  const parsed = parseCoordinateKey(coordinate);
                  if (!parsed) return null;

                  if (
                    parsed.x < miniMapGeometry.contentBounds.minX ||
                    parsed.x > miniMapGeometry.contentBounds.maxX ||
                    parsed.y < miniMapGeometry.contentBounds.minY ||
                    parsed.y > miniMapGeometry.contentBounds.maxY
                  ) {
                    return null;
                  }

                  const rawCellValue = gameStatus[coordinate];
                  if (!isLiveCell(rawCellValue)) return null;

                  const { miniX, miniY } = miniMapGeometry.worldToMiniMap(parsed.x, parsed.y);
                  return (
                    <rect
                      key={coordinate}
                      x={miniX}
                      y={miniY}
                      width={miniMapGeometry.cellPixelSize}
                      height={miniMapGeometry.cellPixelSize}
                      fill={getCellColor(rawCellValue)}
                    />
                  );
                })}
                {/* Grid origin lines (x=0 and y=0) */}
                {miniMapGeometry.contentBounds.minX <= 0 && miniMapGeometry.contentBounds.maxX >= 0 && (
                  <line
                    x1={miniMapGeometry.worldToMiniMap(0, miniMapGeometry.contentBounds.minY).miniX}
                    y1={MINIMAP_PADDING}
                    x2={miniMapGeometry.worldToMiniMap(0, miniMapGeometry.contentBounds.minY).miniX}
                    y2={MINIMAP_SIZE - MINIMAP_PADDING}
                    className="grid-overlay-minimap-origin-line"
                  />
                )}
                {miniMapGeometry.contentBounds.minY <= 0 && miniMapGeometry.contentBounds.maxY >= 0 && (
                  <line
                    x1={MINIMAP_PADDING}
                    y1={miniMapGeometry.worldToMiniMap(miniMapGeometry.contentBounds.minX, 0).miniY}
                    x2={MINIMAP_SIZE - MINIMAP_PADDING}
                    y2={miniMapGeometry.worldToMiniMap(miniMapGeometry.contentBounds.minX, 0).miniY}
                    className="grid-overlay-minimap-origin-line"
                  />
                )}
                <rect
                  x={miniMapGeometry.viewportX}
                  y={miniMapGeometry.viewportY}
                  width={miniMapGeometry.viewportWidth}
                  height={miniMapGeometry.viewportHeight}
                  className="grid-overlay-minimap-viewport"
                  aria-label={miniMapViewportLabel}
                />
              </svg>

              <span className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-up" data-tooltip={panUpLabel}>
                <button className="grid-overlay-btn" aria-label={panUpLabel} onClick={handlePanUp} type="button"><IconUp /></button>
              </span>
              <span className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-left" data-tooltip={panLeftLabel}>
                <button className="grid-overlay-btn" aria-label={panLeftLabel} onClick={handlePanLeft} type="button"><IconLeft /></button>
              </span>
              <span className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-right" data-tooltip={panRightLabel}>
                <button className="grid-overlay-btn" aria-label={panRightLabel} onClick={handlePanRight} type="button"><IconRight /></button>
              </span>
              <span className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-down" data-tooltip={panDownLabel}>
                <button className="grid-overlay-btn" aria-label={panDownLabel} onClick={handlePanDown} type="button"><IconDown /></button>
              </span>
            </div>
            <div className="grid-overlay-minimap-zoom-row" role="group" aria-label="Minimap view controls">
              <div className="grid-overlay-minimap-zoom-group" role="group" aria-label="Minimap zoom controls">
                <span className="control-tooltip-trigger" data-tooltip={zoomOutLabel}>
                  <button
                    className="grid-overlay-btn"
                    aria-label={zoomOutLabel}
                    onClick={handleZoomOut}
                    disabled={cellSize <= MIN_CELL_SIZE}
                    type="button"
                  >
                    <IconZoomOut />
                  </button>
                </span>
                <span className="grid-overlay-btn grid-overlay-btn-static grid-overlay-minimap-zoom-value" aria-live="polite">
                  {cellSize}
                </span>
                <span className="control-tooltip-trigger" data-tooltip={zoomInLabel}>
                  <button
                    className="grid-overlay-btn"
                    aria-label={zoomInLabel}
                    onClick={handleZoomIn}
                    disabled={cellSize >= MAX_CELL_SIZE}
                    type="button"
                  >
                    <IconZoomIn />
                  </button>
                </span>
              </div>
              <div className="grid-overlay-minimap-actions-right">
                <span className="control-tooltip-trigger" data-tooltip={centerViewLabel}>
                  <button
                    className="grid-overlay-btn"
                    aria-label={centerViewLabel}
                    onClick={handleCenter}
                    type="button"
                  >
                    <IconCenter />
                  </button>
                </span>
                {toggleBoardMaximized && (
                  <span className="control-tooltip-trigger" data-tooltip={isBoardMaximized ? restoreViewLabel : maximizeViewLabel}>
                    <button
                      className="grid-overlay-btn"
                      aria-label={isBoardMaximized ? restoreViewLabel : maximizeViewLabel}
                      onClick={toggleBoardMaximized}
                      type="button"
                    >
                      {isBoardMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {selectionCount > 0 && (
          <div className="grid-overlay-selection-banner" aria-live="polite">
            <span>{selectedLiveCellsLabel}</span>
          </div>
        )}
        <div className="grid-overlay-readout grid-overlay-readout-bottom-right" aria-live="polite">
          <span className="grid-overlay-readout-coordinates">Center: ({viewportCenter.x}, {viewportCenter.y})</span>
          <span className="grid-overlay-readout-coordinates">{cursorLabel}: {hoveredCellValue}</span>
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