import { forEach } from 'lodash';
import { LifeGrid } from '../interfaces';
import { getLiveNeighborCount, getNeighborCoordinates } from './coordinates';

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

export function calculateNextGeneration(grid: LifeGrid): LifeGrid {
  const nextGrid: LifeGrid = {};

  forEach(grid, (value: boolean, coordinate: string) => {
    const neighborCoordinates = getNeighborCoordinates(coordinate);
    const liveNeighbors = getLiveNeighborCount(coordinate, grid)

    // Status Quo
    const statusQuo = liveNeighbors === 2 || liveNeighbors === 3;
    
    if (statusQuo) {
      nextGrid[coordinate] = value;
    }

    // Cell Birth
    forEach(neighborCoordinates, (value: boolean, coordinate: string) => {
      const isAlive = !!grid[coordinate];

      if (!isAlive && getLiveNeighborCount(coordinate, grid) === 3) {
        nextGrid[coordinate] = value;
      }
    });    
  });

  return nextGrid;
}

function gameOfLife (grid: LifeGrid): LifeGrid {
  return calculateNextGeneration(grid)
}

export default gameOfLife;
