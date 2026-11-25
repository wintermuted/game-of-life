import { useMemo, useRef } from 'react';
import { LifeGrid } from '@game-of-life/core';

export const MINIMAP_SIZE = 152;
export const MINIMAP_PADDING = 6;
const MINIMAP_MAX_HALF_WORLD = 500;
const MINIMAP_ZOOM_FACTOR = 8 / 3;
const MINIMAP_FOLLOW_PADDING = 2;
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

export interface ViewportMetrics {
  columns: number;
  rows: number;
  offsetX: number;
  offsetY: number;
}

interface MinimapCenter {
  x: number;
  y: number;
}

interface MinimapGeometry {
  worldToMiniMap: (x: number, y: number) => { miniX: number; miniY: number };
  contentBounds: Bounds;
  scale: number;
  cellPixelSize: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
}

export function parseCoordinateKey(coordinate: string): ParsedCoordinate | null {
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

export default function useMinimapGeometry(
  gameStatus: LifeGrid,
  viewportMetrics: ViewportMetrics | null,
): MinimapGeometry | null {
  const miniMapBoundsRef = useRef<Bounds | null>(null);
  const miniMapCenterRef = useRef<MinimapCenter>({ x: 0, y: 0 });
  const miniMapBoundsViewportKeyRef = useRef<string | null>(null);
  return useMemo((): MinimapGeometry | null => {
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
    let nextCenterX = applyFollowAxis(
      previousCenter.x,
      viewportCenterX,
      minHalfWidthFromViewport,
      viewportHalfWidth,
    );
    let nextCenterY = applyFollowAxis(
      previousCenter.y,
      viewportCenterY,
      minHalfHeightFromViewport,
      viewportHalfHeight,
    );

    const minHalfWidthFromLiveRaw = liveBounds
      ? Math.ceil(
          Math.max(
            Math.abs(liveBounds.minX - nextCenterX),
            Math.abs(liveBounds.maxX - nextCenterX),
          ),
        )
      : 0;
    const minHalfHeightFromLiveRaw = liveBounds
      ? Math.ceil(
          Math.max(
            Math.abs(liveBounds.minY - nextCenterY),
            Math.abs(liveBounds.maxY - nextCenterY),
          ),
        )
      : 0;

    const minHalfWidthFromLive = Math.min(minHalfWidthFromLiveRaw, MINIMAP_MAX_HALF_WORLD);
    const minHalfHeightFromLive = Math.min(minHalfHeightFromLiveRaw, MINIMAP_MAX_HALF_WORLD);

    const halfWorldWidth = Math.max(minHalfWidthFromViewport, minHalfWidthFromLive) + 2;
    const halfWorldHeight = Math.max(minHalfHeightFromViewport, minHalfHeightFromLive) + 2;

    nextCenterX = applyFollowAxis(nextCenterX, viewportCenterX, halfWorldWidth, viewportHalfWidth);
    nextCenterY = applyFollowAxis(
      nextCenterY,
      viewportCenterY,
      halfWorldHeight,
      viewportHalfHeight,
    );
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
    const drawableSize = MINIMAP_SIZE - MINIMAP_PADDING * 2;
    const baseScale = Math.min(drawableSize / worldWidth, drawableSize / worldHeight);
    const scale = Math.max(0.0001, baseScale * MINIMAP_ZOOM_FACTOR);
    const scaledWorldWidth = worldWidth * scale;
    const scaledWorldHeight = worldHeight * scale;
    const contentOffsetX = MINIMAP_PADDING + (drawableSize - scaledWorldWidth) / 2;
    const contentOffsetY = MINIMAP_PADDING + (drawableSize - scaledWorldHeight) / 2;

    const worldToMiniMap = (x: number, y: number): { miniX: number; miniY: number } => {
      const miniX = contentOffsetX + (x - contentBounds.minX) * scale;
      const miniY = contentOffsetY + (contentBounds.maxY - y) * scale;
      return { miniX, miniY };
    };

    const cellPixelSize = Math.max(1, Math.floor(scale));

    // Viewport outline: map the actual viewport bounds to minimap coordinates
    // This ensures the outline is positioned correctly even when panned away from center
    const halfViewportWidth = viewportMetrics.columns / 2;
    const halfViewportHeight = viewportMetrics.rows / 2;

    // Map viewport corners to minimap
    const viewportTopLeft = worldToMiniMap(
      viewportCenterX - halfViewportWidth,
      viewportCenterY + halfViewportHeight,
    );
    const viewportBottomRight = worldToMiniMap(
      viewportCenterX + halfViewportWidth,
      viewportCenterY - halfViewportHeight,
    );

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
}
