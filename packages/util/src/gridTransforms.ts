import { getCellColor, getNeighborCoordinates, LifeGrid } from '@game-of-life/core';
import { parseCoordinateKey, getGridBounds } from './gridGeometry';
export type StampRotation = 0 | 90 | 180 | 270;

export function mergeGridAtCoordinate(
  baseGrid: LifeGrid,
  additionGrid: LifeGrid,
  targetCoordinate: string,
): LifeGrid {
  const target = parseCoordinateKey(targetCoordinate);
  const bounds = getGridBounds(additionGrid);

  if (!target || !bounds) {
    return baseGrid;
  }

  const anchorX = Math.floor((bounds.minX + bounds.maxX) / 2);
  const anchorY = Math.floor((bounds.minY + bounds.maxY) / 2);
  const deltaX = target.x - anchorX;
  const deltaY = target.y - anchorY;
  const nextGrid = { ...baseGrid };

  for (const key of Object.keys(additionGrid)) {
    const parsed = parseCoordinateKey(key);
    if (!parsed) continue;

    nextGrid[`${parsed.x + deltaX},${parsed.y + deltaY}`] = additionGrid[key];
  }

  return nextGrid;
}

export function tintGridCells(grid: LifeGrid, color: string): LifeGrid {
  const tintedGrid: LifeGrid = {} as LifeGrid;

  for (const coordinate of Object.keys(grid)) {
    tintedGrid[coordinate] = color;
  }

  return tintedGrid;
}

export function getContiguousLiveRegionByColor(grid: LifeGrid, startCoordinate: string): string[] {
  const startCell = grid[startCoordinate];
  if (!startCell) {
    return [];
  }

  const targetColor = getCellColor(startCell);
  const queue: string[] = [startCoordinate];
  const visited = new Set<string>();
  const region: string[] = [];

  while (queue.length > 0) {
    const coordinate = queue.shift();
    if (!coordinate || visited.has(coordinate)) {
      continue;
    }

    visited.add(coordinate);
    const cell = grid[coordinate];
    if (!cell || getCellColor(cell) !== targetColor) {
      continue;
    }

    region.push(coordinate);
    for (const neighbor of getNeighborCoordinates(coordinate)) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return region;
}

export function rotateGridAroundBoundsCenter(grid: LifeGrid, rotation: StampRotation): LifeGrid {
  if (rotation === 0) {
    return grid;
  }

  const bounds = getGridBounds(grid);
  if (!bounds) {
    return grid;
  }

  const anchorX = Math.floor((bounds.minX + bounds.maxX) / 2);
  const anchorY = Math.floor((bounds.minY + bounds.maxY) / 2);
  const quarterTurns = rotation / 90;
  const rotatedGrid: LifeGrid = {} as LifeGrid;

  for (const coordinate of Object.keys(grid)) {
    const parsed = parseCoordinateKey(coordinate);
    if (!parsed) continue;

    const dx = parsed.x - anchorX;
    const dy = parsed.y - anchorY;
    let rotatedX = dx;
    let rotatedY = dy;

    if (quarterTurns === 1) {
      rotatedX = dy;
      rotatedY = -dx;
    } else if (quarterTurns === 2) {
      rotatedX = -dx;
      rotatedY = -dy;
    } else if (quarterTurns === 3) {
      rotatedX = -dy;
      rotatedY = dx;
    }

    const nextX = anchorX + rotatedX;
    const nextY = anchorY + rotatedY;
    rotatedGrid[`${nextX},${nextY}`] = grid[coordinate];
  }

  return rotatedGrid;
}

export function rotateStampRotationClockwise(rotation: StampRotation): StampRotation {
  if (rotation === 0) return 90;
  if (rotation === 90) return 180;
  if (rotation === 180) return 270;
  return 0;
}

export function rotateStampRotationCounterClockwise(rotation: StampRotation): StampRotation {
  if (rotation === 0) return 270;
  if (rotation === 270) return 180;
  if (rotation === 180) return 90;
  return 0;
}
