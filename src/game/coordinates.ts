import { keys, intersection, without, forEach } from 'lodash';
import { LifeGrid } from "./game";

export function getLiveNeighborCount(coordinate: string, grid: LifeGrid): number {  
  const neighborCoords = getNeighborCoordinates(coordinate)
  const neighborKeys = keys(neighborCoords);
  const gridKeys = keys(grid);
  const intersectedKeys = intersection(neighborKeys, gridKeys);
  
  return intersectedKeys.length;
}

export function getDeadNeighborCoordinates(coordinate: string, grid: LifeGrid) {
  const neighborCoords = getNeighborCoordinates(coordinate)
  const neighborKeys = keys(neighborCoords);
  const deadCells: string[] =[];

  forEach(neighborKeys, (value) => {
    const isAlive = !!grid[value];

    if (!isAlive) {
      deadCells.push(value);
    }
  })

  return deadCells;
}

export function getNeighborCoordinates(coordinate: string): LifeGrid {
  const [xCoord, yCoord]: string[] = coordinate.split(",");
  const x = parseInt(xCoord);
  const y = parseInt(yCoord);

  const north = [x, y + 1].join(",");
  const south = [x, y - 1].join(",");
  const east = [x + 1, y].join(",");
  const west = [x - 1, y].join(",");
  const southWest = [x - 1, y - 1].join(",");
  const northWest = [x - 1, y + 1].join(",");
  const soutEast = [x + 1, y - 1].join(",");
  const northEast = [x + 1, y + 1].join(",");

  const neighborCoords = {
      [north]: true,
      [south]: true,
      [east]: true,
      [west]: true,
      [southWest]: true,
      [northWest]: true,
      [soutEast]: true,
      [northEast]: true
  };

  return neighborCoords;
}