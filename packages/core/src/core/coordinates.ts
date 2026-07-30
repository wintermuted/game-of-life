import { LifeGrid } from '../interfaces';
import { isLiveCell } from './cells';

export function getLiveNeighborCount(coordinate: string, grid: LifeGrid): number {  
  return getNeighborCoordinates(coordinate).filter((neighborCoordinate) => isLiveCell(grid[neighborCoordinate])).length;
}

export function getDeadNeighborCoordinates(coordinate: string, grid: LifeGrid) {
  const deadCells: string[] =[];

  for (const neighborCoordinate of getNeighborCoordinates(coordinate)) {
    const isAlive = isLiveCell(grid[neighborCoordinate]);

    if (!isAlive) {
      deadCells.push(neighborCoordinate);
    }
  }

  return deadCells;
}

export function getNeighborCoordinates(coordinate: string): string[] {
  const [xCoord, yCoord]: string[] = coordinate.split(",");
  const x = parseInt(xCoord);
  const y = parseInt(yCoord);

  const north = [x, y + 1].join(",");
  const south = [x, y - 1].join(",");
  const east = [x + 1, y].join(",");
  const west = [x - 1, y].join(",");
  const southWest = [x - 1, y - 1].join(",");
  const northWest = [x - 1, y + 1].join(",");
  const southEast = [x + 1, y - 1].join(",");
  const northEast = [x + 1, y + 1].join(",");

  return [north, south, east, west, southWest, northWest, southEast, northEast];
}