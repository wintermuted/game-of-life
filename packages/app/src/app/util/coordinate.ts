import { toNumber, forEach } from "lodash";
import { getCellColor, isLiveCell, LifeGrid } from "@game-of-life/core";
import { ColorPalette } from "../constants/colors";

export function handleXCoord(x: string, gridSize: number, offsetX: number = 0) {
  const xNumber = toNumber(x);
  const half = Math.floor(gridSize / 2);
  return xNumber + half - offsetX;
}

export function handleYCoord(y: string, gridSize: number, offsetY: number = 0) {
  const yNumber = toNumber(y);
  const half = Math.floor(gridSize / 2);
  return half - 1 - yNumber - offsetY;
}

export function translateGridToViewport(
  grid: LifeGrid,
  gridWidth: number,
  gridHeight: number,
  offsetX: number = 0,
  offsetY: number = 0
): LifeGrid {
  const translatedGrid: LifeGrid = {} as LifeGrid;

  forEach(grid, (entry, key) => {
    const [x, y] = key.split(',');
    const xOffset = handleXCoord(x, gridWidth, offsetX);
    const yOffset = handleYCoord(y, gridHeight, offsetY);
    const newKey = `${xOffset},${yOffset}`;
    translatedGrid[newKey] = entry;
  });

  return translatedGrid;
}

export function translateGrid (grid: LifeGrid, gridSize: number, offsetX: number = 0, offsetY: number = 0): LifeGrid {
  return translateGridToViewport(grid, gridSize, gridSize, offsetX, offsetY);
}

export function getCellFillColor(
  cellColor: string | undefined,
  _palette?: ColorPalette,
  isDark?: boolean
): string {
  if (isLiveCell(cellColor)) {
    return getCellColor(cellColor);
  }

  return isDark ? '#161b22' : '#ebedf0';
}