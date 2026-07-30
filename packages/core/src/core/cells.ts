import { LifeGrid } from '../interfaces';

export const DEFAULT_LIVE_CELL_COLOR = '#22c55e';
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function createLiveCell(color: string = DEFAULT_LIVE_CELL_COLOR): string {
  return color;
}

export function isLiveCell(cell: unknown): cell is string {
  return typeof cell === 'string' && HEX_COLOR_PATTERN.test(cell);
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