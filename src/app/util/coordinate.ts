import { toNumber, forEach } from "lodash";
import { LifeGrid } from "../../interfaces";

export function handleXCoord(x: string, gridSize: number) {
  const xNumber = toNumber(x);

  if (xNumber >= 0) {
    return xNumber + (gridSize / 2);
  } else if (xNumber < 0) {
    return (gridSize / 2) + xNumber;
  } else {
    return xNumber;
  }
}

export function handleYCoord(y: string, gridSize: number) {
  const yNumber = toNumber(y);

  return (gridSize / 2) - 1 - yNumber;
}

export function translateGrid (grid: LifeGrid, gridSize: number): LifeGrid {
  const translatedGrid: LifeGrid = {} as LifeGrid;

  forEach(grid, (entry, key) => {
      const [x, y] = key.split(",")
      const xOffset = handleXCoord(x, gridSize);
      const yOffset = handleYCoord(y, gridSize);
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

export function getCellFillColor(isAlive: boolean, rowIndex: number, columnIndex: number, gridSize: number) {
  const { nwQuad, swQuad, neQuad, seQuad } = getCenterPointSquares(columnIndex, rowIndex, gridSize);
  const centerCells = nwQuad || swQuad || neQuad || seQuad;
  const defaultCells = centerCells ? "#888" : "#CCC";
  const color = isAlive ? "green" : defaultCells;
  return color;
}