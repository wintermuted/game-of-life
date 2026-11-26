import { useCallback, useRef, useState } from 'react';
import { getCellColor, isLiveCell, LifeGrid } from '@game-of-life/core';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useMinimapGeometry, {
  MINIMAP_SIZE,
  MINIMAP_PADDING,
  parseCoordinateKey,
  ViewportMetrics,
} from './useMinimapGeometry';

export interface GridMinimapProps {
  gameStatus: LifeGrid;
  viewportMetrics: ViewportMetrics | null;
  cellSize: number;
  minCellSize: number;
  maxCellSize: number;
  handlePanUp: () => void;
  handlePanDown: () => void;
  handlePanLeft: () => void;
  handlePanRight: () => void;
  handleCenter: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  panViewportToWorldCoordinate: (x: number, y: number) => void;
  isBoardMaximized: boolean;
  toggleBoardMaximized?: () => void;
}

// Inline SVG icons for grid controls
const IconUp = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconDown = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconLeft = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconRight = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconCenter = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);
const IconZoomIn = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const IconZoomOut = (): React.JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export default function GridMinimap({
  gameStatus,
  viewportMetrics,
  cellSize,
  minCellSize,
  maxCellSize,
  handlePanUp,
  handlePanDown,
  handlePanLeft,
  handlePanRight,
  handleCenter,
  handleZoomIn,
  handleZoomOut,
  panViewportToWorldCoordinate,
  isBoardMaximized,
  toggleBoardMaximized,
}: GridMinimapProps): React.JSX.Element | null {
  const miniMapGeometry = useMinimapGeometry(gameStatus, viewportMetrics);
  const [isMiniMapPanning, setIsMiniMapPanning] = useState(false);
  const isMiniMapPanningRef = useRef(false);
  const { t } = useTranslation();
  const panUpLabel = t('controls.panUp');
  const panLeftLabel = t('controls.panLeft');
  const centerViewLabel = t('controls.centerView');
  const panRightLabel = t('controls.panRight');
  const panDownLabel = t('controls.panDown');
  const zoomOutLabel = t('controls.zoomOut');
  const zoomInLabel = t('controls.zoomIn');
  const maximizeViewLabel = t('controls.maximizeBoard');
  const restoreViewLabel = t('controls.restoreBoard');
  const miniMapLabel = t('controls.miniMap');
  const miniMapViewportLabel = t('controls.miniMapViewport');

  const handleMiniMapPointer = useCallback(
    (clientX: number, clientY: number, svg: SVGSVGElement) => {
      if (!miniMapGeometry) return;

      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const viewBoxX = ((clientX - rect.left) / rect.width) * MINIMAP_SIZE;
      const viewBoxY = ((clientY - rect.top) / rect.height) * MINIMAP_SIZE;
      const clampedX = Math.max(
        MINIMAP_PADDING,
        Math.min(MINIMAP_SIZE - MINIMAP_PADDING, viewBoxX),
      );
      const clampedY = Math.max(
        MINIMAP_PADDING,
        Math.min(MINIMAP_SIZE - MINIMAP_PADDING, viewBoxY),
      );
      const worldX =
        miniMapGeometry.contentBounds.minX + (clampedX - MINIMAP_PADDING) / miniMapGeometry.scale;
      const worldY =
        miniMapGeometry.contentBounds.maxY - (clampedY - MINIMAP_PADDING) / miniMapGeometry.scale;

      panViewportToWorldCoordinate(worldX, worldY);
    },
    [miniMapGeometry, panViewportToWorldCoordinate],
  );

  const handleMiniMapMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      event.preventDefault();
      isMiniMapPanningRef.current = true;
      setIsMiniMapPanning(true);
      handleMiniMapPointer(event.clientX, event.clientY, event.currentTarget);
    },
    [handleMiniMapPointer],
  );

  const handleMiniMapMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!isMiniMapPanningRef.current || (event.buttons & 1) === 0) return;
      handleMiniMapPointer(event.clientX, event.clientY, event.currentTarget);
    },
    [handleMiniMapPointer],
  );

  const handleMiniMapPanEnd = useCallback(() => {
    isMiniMapPanningRef.current = false;
    setIsMiniMapPanning(false);
  }, []);

  if (!miniMapGeometry) return null;

  return (
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

        <span
          className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-up"
          data-tooltip={panUpLabel}
        >
          <button
            className="grid-overlay-btn"
            aria-label={panUpLabel}
            onClick={handlePanUp}
            type="button"
          >
            <IconUp />
          </button>
        </span>
        <span
          className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-left"
          data-tooltip={panLeftLabel}
        >
          <button
            className="grid-overlay-btn"
            aria-label={panLeftLabel}
            onClick={handlePanLeft}
            type="button"
          >
            <IconLeft />
          </button>
        </span>
        <span
          className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-right"
          data-tooltip={panRightLabel}
        >
          <button
            className="grid-overlay-btn"
            aria-label={panRightLabel}
            onClick={handlePanRight}
            type="button"
          >
            <IconRight />
          </button>
        </span>
        <span
          className="control-tooltip-trigger grid-overlay-minimap-pan-btn grid-overlay-minimap-pan-down"
          data-tooltip={panDownLabel}
        >
          <button
            className="grid-overlay-btn"
            aria-label={panDownLabel}
            onClick={handlePanDown}
            type="button"
          >
            <IconDown />
          </button>
        </span>
      </div>
      <div
        className="grid-overlay-minimap-zoom-row"
        role="group"
        aria-label="Minimap view controls"
      >
        <div
          className="grid-overlay-minimap-zoom-group"
          role="group"
          aria-label="Minimap zoom controls"
        >
          <span className="control-tooltip-trigger" data-tooltip={zoomOutLabel}>
            <button
              className="grid-overlay-btn"
              aria-label={zoomOutLabel}
              onClick={handleZoomOut}
              disabled={cellSize <= minCellSize}
              type="button"
            >
              <IconZoomOut />
            </button>
          </span>
          <span
            className="grid-overlay-btn grid-overlay-btn-static grid-overlay-minimap-zoom-value"
            aria-live="polite"
          >
            {cellSize}
          </span>
          <span className="control-tooltip-trigger" data-tooltip={zoomInLabel}>
            <button
              className="grid-overlay-btn"
              aria-label={zoomInLabel}
              onClick={handleZoomIn}
              disabled={cellSize >= maxCellSize}
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
            <span
              className="control-tooltip-trigger"
              data-tooltip={isBoardMaximized ? restoreViewLabel : maximizeViewLabel}
            >
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
  );
}
