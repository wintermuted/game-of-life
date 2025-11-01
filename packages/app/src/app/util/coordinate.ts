import { toNumber, forEach } from "lodash";
import { LifeGrid } from "@game-of-life/core";
import { ColorPalette } from "../constants/colors";

export function handleXCoord(x: string, gridSize: number, offsetX: number = 0) {
  const xNumber = toNumber(x);

  if (xNumber >= 0) {
    return xNumber + (gridSize / 2) - offsetX;
  } else if (xNumber < 0) {
    return (gridSize / 2) + xNumber - offsetX;
  } else {
    return xNumber;
  }
}

export function handleYCoord(y: string, gridSize: number, offsetY: number = 0) {
  const yNumber = toNumber(y);

  return (gridSize / 2) - 1 - yNumber - offsetY;
}

export function translateGrid (grid: LifeGrid, gridSize: number, offsetX: number = 0, offsetY: number = 0): LifeGrid {
  const translatedGrid: LifeGrid = {} as LifeGrid;

  forEach(grid, (_entry, key) => {
      const [x, y] = key.split(",")
      const xOffset = handleXCoord(x, gridSize, offsetX);
      const yOffset = handleYCoord(y, gridSize, offsetY);
      const newKey = `${xOffset},${yOffset}`;
      translatedGrid[newKey] = true;
  });

  return translatedGrid;
}

export function getCenterPointSquares(columnIndex: number, rowIndex: number, gridSize: number) {
  const halfGridSize = (gridSize / 2);
  const halfGridSizeMinusOne = halfGridSize - 1;

  const nwQuad = columnIndex === halfGridSizeMinusOne && rowIndex === halfGridSizeMinusOne;
  const swQuad = columnIndex === halfGridSize && rowIndex === halfGridSizeMinusOne;
  const neQuad = columnIndex === halfGridSizeMinusOne && rowIndex === halfGridSize;
  const seQuad = columnIndex === halfGridSize && rowIndex === halfGridSize;
  return { nwQuad, swQuad, neQuad, seQuad };
}

export function getCellFillColor(
  isAlive: boolean, 
  rowIndex: number, 
  columnIndex: number, 
  gridSize: number,
  palette?: ColorPalette
): string {
  const { nwQuad, swQuad, neQuad, seQuad } = getCenterPointSquares(columnIndex, rowIndex, gridSize);
  const centerCells = nwQuad || swQuad || neQuad || seQuad;
  
  if (palette) {
    const defaultCells = centerCells ? palette.centerCell : palette.deadCell;
    return isAlive ? palette.liveCell : defaultCells;
  }
  
  // Fallback to original colors if no palette provided
  const defaultCells = centerCells ? "#888" : "#CCC";
  const color = isAlive ? "green" : defaultCells;
  return color;
}