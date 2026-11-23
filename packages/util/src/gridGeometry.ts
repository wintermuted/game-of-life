import { LifeGrid } from '@game-of-life/core';
export interface ParsedCoordinate {
  x: number;
  y: number;
}

export function parseCoordinateKey(coordinate: string): ParsedCoordinate | null {
  const [xString, yString] = coordinate.split(',');
  const x = Number(xString);
  const y = Number(yString);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return { x, y };
}

export function getGridBounds(
  grid: LifeGrid,
): { minX: number; maxX: number; minY: number; maxY: number } | null {
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

export function getSelectionGrid(
  grid: LifeGrid,
  startCoordinate: string,
  endCoordinate: string,
): LifeGrid {
  const start = parseCoordinateKey(startCoordinate);
  const end = parseCoordinateKey(endCoordinate);

  if (!start || !end) {
    return {};
  }

  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  const selectedGrid: LifeGrid = {} as LifeGrid;

  for (const [coordinate, cellColor] of Object.entries(grid)) {
    if (!cellColor) continue;

    const parsed = parseCoordinateKey(coordinate);
    if (!parsed) continue;

    if (parsed.x >= minX && parsed.x <= maxX && parsed.y >= minY && parsed.y <= maxY) {
      selectedGrid[coordinate] = cellColor;
    }
  }

  return selectedGrid;
}
