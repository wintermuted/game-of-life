import { toNumber, forEach } from "lodash";
import { LifeGrid } from "../../interfaces";

export function handleXCoord(x: string) {
  const xNumber = toNumber(x);

  if (xNumber >= 0) {
    return xNumber + 15;
  } else if (xNumber < 0) {
    return 15 + xNumber;
  } else {
    return xNumber;
  }
}

export function handleYCoord(y: string) {
  const yNumber = toNumber(y);

  return 14 - yNumber;
}

export function translateGrid (grid: LifeGrid): LifeGrid {
  const translatedGrid: LifeGrid = {} as LifeGrid;

  forEach(grid, (entry, key) => {
      const [x, y] = key.split(",")
      const xOffset = handleXCoord(x);
      const yOffset = handleYCoord(y);
      const newKey = `${xOffset},${yOffset}`;
      translatedGrid[newKey] = true;
  });

  return translatedGrid;
}

export function getCenterPointSquares(columnIndex: number, rowIndex: number) {
  const nwQuad = columnIndex === 14 && rowIndex === 14;
  const swQuad = columnIndex === 15 && rowIndex === 14;
  const neQuad = columnIndex === 14 && rowIndex === 15;
  const seQuad = columnIndex === 15 && rowIndex === 15;
  return { nwQuad, swQuad, neQuad, seQuad };
}

export function getCellFillColor(isAlive: boolean, rowIndex: number, columnIndex: number) {
  const { nwQuad, swQuad, neQuad, seQuad } = getCenterPointSquares(columnIndex, rowIndex);
  const centerCells = nwQuad || swQuad || neQuad || seQuad;
  const defaultCells = centerCells ? "#888" : "#CCC";
  const color = isAlive ? "green" : defaultCells;
  return color;
}