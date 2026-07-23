import { LifeGrid } from '../interfaces';

export const DEFAULT_LIVE_CELL_COLOR = '#22c55e';

export function createLiveCell(color: string = DEFAULT_LIVE_CELL_COLOR): string {
  return color;
}

export function isLiveCell(cell: unknown): cell is string {
  return typeof cell === 'string' && cell.length > 0;
}

export function getCellColor(cell: unknown, fallback: string = DEFAULT_LIVE_CELL_COLOR): string {
  return isLiveCell(cell) ? cell : fallback;
}

export function createLifeGrid(
  seed: Record<string, boolean | string>,
  defaultColor: string = DEFAULT_LIVE_CELL_COLOR,
): LifeGrid {
  const grid: LifeGrid = {};

  for (const [coordinate, value] of Object.entries(seed)) {
    if (value === true) {
      grid[coordinate] = defaultColor;
      continue;
    }

    if (isLiveCell(value)) {
      grid[coordinate] = value;
    }
  }

  return grid;
}