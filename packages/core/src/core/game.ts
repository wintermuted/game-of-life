import { forEach } from 'lodash';
import { LifeGrid, GameStats, GameRules } from '../interfaces';
import { getLiveNeighborCount, getNeighborCoordinates } from './coordinates';
import { createLiveCell, getCellColor, isLiveCell } from './cells';

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

export const DEFAULT_RULES: GameRules = {
  survival2: {
    id: 'survival2',
    name: 'Survival (2 neighbors)',
    description: 'Live cells with 2 neighbors survive',
    enabled: true
  },
  survival3: {
    id: 'survival3',
    name: 'Survival (3 neighbors)',
    description: 'Live cells with 3 neighbors survive',
    enabled: true
  },
  birth3: {
    id: 'birth3',
    name: 'Birth (3 neighbors)',
    description: 'Dead cells with 3 neighbors become alive',
    enabled: true
  },
  experimentalSpeciesCompetitionBirth: {
    id: 'experimentalSpeciesCompetitionBirth',
    name: 'Experimental Species Competition Birth',
    description: 'Mixed-species births require a dominant color; evenly split species do not reproduce',
    enabled: false
  },
  experimentalSpeciesCompetitionTieBreakBirth: {
    id: 'experimentalSpeciesCompetitionTieBreakBirth',
    name: 'Experimental Species Competition Tie-Break Birth',
    description: 'When species competition ties, births randomly choose among the tied colors instead of failing',
    enabled: false
  },
  death: {
    id: 'death',
    name: 'Death (underpopulation / overpopulation)',
    description: 'Live cells with <2 or >3 neighbors die',
    enabled: true
  }
};

// Note: The 'death' rule is informational and describes the default behavior.
// Death occurs implicitly when survival conditions aren't met.
// This rule is included for UI completeness but doesn't affect execution.

export function calculateNextGeneration(grid: LifeGrid, rules: GameRules = DEFAULT_RULES): LifeGrid {
  const nextGrid: LifeGrid = {};

  forEach(grid, (value: string, coordinate: string) => {
    const neighborCoordinates = getNeighborCoordinates(coordinate);
    const liveNeighbors = getLiveNeighborCount(coordinate, grid)

    // Status Quo - check if cell survives
    let survives = false;
    if (rules.survival2.enabled && liveNeighbors === 2) {
      survives = true;
    }
    if (rules.survival3.enabled && liveNeighbors === 3) {
      survives = true;
    }
    
    if (survives) {
      nextGrid[coordinate] = value;
    }

    // Cell Birth
    forEach(neighborCoordinates, (neighborCoordinate: string) => {
      const isAlive = isLiveCell(grid[neighborCoordinate]);

      if (!isAlive && rules.birth3.enabled && getLiveNeighborCount(neighborCoordinate, grid) === 3) {
        const birthColor = getBirthColor(neighborCoordinate, grid, rules);
        if (birthColor) {
          nextGrid[neighborCoordinate] = birthColor;
        }
      }
    });    
  });

  return nextGrid;
}

export function calculateStats(previousGrid: LifeGrid, nextGrid: LifeGrid): GameStats {
  const previousCells = Object.keys(previousGrid);
  const nextCells = Object.keys(nextGrid);
  
  const liveCells = nextCells.length;
  
  // Births: cells that are in nextGrid but not in previousGrid
  const births = nextCells.filter(coord => !previousGrid[coord]).length;
  
  // Deaths: cells that are in previousGrid but not in nextGrid
  const deaths = previousCells.filter(coord => !nextGrid[coord]).length;
  
  return { liveCells, births, deaths };
}

function gameOfLife (grid: LifeGrid, rules?: GameRules): LifeGrid {
  return calculateNextGeneration(grid, rules)
}

function getBirthColor(coordinate: string, grid: LifeGrid, rules: GameRules): string | null {
  const liveNeighborColors = getNeighborCoordinates(coordinate)
    .map((neighborCoordinate) => grid[neighborCoordinate])
    .filter(isLiveCell)
    .map((cell) => getCellColor(cell));

  if (liveNeighborColors.length === 0) {
    return createLiveCell();
  }

  const colorCounts = new Map<string, number>();
  let selectedColor = liveNeighborColors[0];
  let highestCount = 0;

  for (const color of liveNeighborColors) {
    const nextCount = (colorCounts.get(color) ?? 0) + 1;
    colorCounts.set(color, nextCount);

    if (nextCount > highestCount) {
      highestCount = nextCount;
      selectedColor = color;
    }
  }

  if (rules.experimentalSpeciesCompetitionBirth.enabled) {
    const tiedColors = Array.from(colorCounts.entries())
      .filter(([, count]) => count === highestCount)
      .map(([color]) => color);

    if (tiedColors.length > 1) {
      if (rules.experimentalSpeciesCompetitionTieBreakBirth.enabled) {
        const randomIndex = Math.floor(Math.random() * tiedColors.length);
        return tiedColors[randomIndex];
      }

      return null;
    }
  }

  return selectedColor;
}

export default gameOfLife;
