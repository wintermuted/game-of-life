import { forEach } from 'lodash';
import { LifeGrid, GameRule, GameRuleKey, GameStats, GameRules, GameRulesetDefinition } from '../interfaces';
import { getLiveNeighborCount, getNeighborCoordinates } from './coordinates';
import { createLiveCell, getCellColor, isLiveCell } from './cells';

// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

export const DEFAULT_RULES: GameRules = {
  survival2: {
    id: 'survival2',
    name: 'Underpopulation',
    description: 'Live cells with fewer than two live neighbors die, as if by underpopulation.',
    enabled: true
  },
  survival3: {
    id: 'survival3',
    name: 'Survival',
    description: 'Live cells with two or three live neighbors live on to the next generation.',
    enabled: true
  },
  birth3: {
    id: 'birth3',
    name: 'Reproduction',
    description: 'Dead cells with exactly three live neighbors become live cells, as if by reproduction.',
    enabled: true
  },
  birth6: {
    id: 'birth6',
    name: 'HighLife Reproduction (B6)',
    description: 'Dead cells with exactly six live neighbors become live cells (HighLife B6 rule).',
    enabled: false
  },
  experimentalSpeciesCompetitionBirth: {
    id: 'experimentalSpeciesCompetitionBirth',
    name: 'Experimental Species Competition Birth',
    description: 'Mixed-species births use competition modifiers instead of default color assignment',
    enabled: false
  },
  experimentalSpeciesCompetitionDominantBirth: {
    id: 'experimentalSpeciesCompetitionDominantBirth',
    name: 'Experimental Species Competition Dominant Birth',
    description: 'When mixed-species births occur, the color with the highest neighbor count wins reproduction',
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
    name: 'Overpopulation',
    description: 'Live cells with more than three live neighbors die, as if by overpopulation.',
    enabled: true
  }
};

function cloneRules(rules: GameRules): GameRules {
  const entries = Object.entries(DEFAULT_RULES) as Array<[GameRuleKey, GameRule]>;
  const nextRules = Object.fromEntries(
    entries.map(([ruleKey, defaultRule]) => [ruleKey, { ...(rules[ruleKey] ?? defaultRule) }]),
  ) as unknown as GameRules;

  if (rules.lifeLikeProfile) {
    nextRules.lifeLikeProfile = {
      birth: [...rules.lifeLikeProfile.birth],
      survival: [...rules.lifeLikeProfile.survival],
    };
  }

  return nextRules;
}

export const STANDARD_RULESET: GameRulesetDefinition = {
  id: 'standard',
  name: "Conway's Game of Life",
  classification: 'B3/S23',
  implemented: true,
  rules: cloneRules(DEFAULT_RULES),
};

export const HIGHLIFE_RULESET: GameRulesetDefinition = {
  id: 'highlife',
  name: 'HighLife',
  classification: 'B36/S23',
  implemented: true,
  rules: {
    ...cloneRules(DEFAULT_RULES),
    birth6: {
      ...DEFAULT_RULES.birth6,
      enabled: true,
    },
  },
};

// Backward-compatible alias for earlier references.
export const HIGHLIFE_RULESET_STUB = HIGHLIFE_RULESET;

export const DAY_AND_NIGHT_RULESET: GameRulesetDefinition = {
  id: 'day-and-night',
  name: 'Day & Night',
  classification: 'B3678/S34678',
  implemented: true,
  rules: {
    ...cloneRules(DEFAULT_RULES),
    lifeLikeProfile: {
      birth: [3, 6, 7, 8],
      survival: [3, 4, 6, 7, 8],
    },
  },
};

export const LIFE_WITHOUT_DEATH_RULESET: GameRulesetDefinition = {
  id: 'life-without-death',
  name: 'Life without Death',
  classification: 'B3/S012345678',
  implemented: true,
  rules: {
    ...cloneRules(DEFAULT_RULES),
    lifeLikeProfile: {
      birth: [3],
      survival: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
  },
};

export const RULESETS: GameRulesetDefinition[] = [
  STANDARD_RULESET,
  HIGHLIFE_RULESET,
  DAY_AND_NIGHT_RULESET,
  LIFE_WITHOUT_DEATH_RULESET,
];

// Note: The 'death' rule is informational and describes the default behavior.
// Death occurs implicitly when survival conditions aren't met.
// This rule is included for UI completeness but doesn't affect execution.

export function calculateNextGeneration(grid: LifeGrid, rules: GameRules = DEFAULT_RULES): LifeGrid {
  const nextGrid: LifeGrid = {};

  forEach(grid, (value: string, coordinate: string) => {
    const neighborCoordinates = getNeighborCoordinates(coordinate);
    const liveNeighbors = getLiveNeighborCount(coordinate, grid)

    // Status Quo - check if cell survives
    const survives = rules.lifeLikeProfile
      ? rules.lifeLikeProfile.survival.includes(liveNeighbors)
      : (rules.survival2.enabled && liveNeighbors === 2) ||
        (rules.survival3.enabled && liveNeighbors === 3);
    
    if (survives) {
      nextGrid[coordinate] = value;
    }

    // Cell Birth
    forEach(neighborCoordinates, (neighborCoordinate: string) => {
      const isAlive = isLiveCell(grid[neighborCoordinate]);

      if (!isAlive) {
        const liveNeighborCount = getLiveNeighborCount(neighborCoordinate, grid);
        const isBirth = rules.lifeLikeProfile
          ? rules.lifeLikeProfile.birth.includes(liveNeighborCount)
          : (rules.birth3.enabled && liveNeighborCount === 3) ||
            (rules.birth6.enabled && liveNeighborCount === 6);

        if (!isBirth) {
          return;
        }

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
    const uniqueNeighborColors = Array.from(new Set(liveNeighborColors));
    if (uniqueNeighborColors.length <= 1) {
      return selectedColor;
    }

    if (!rules.experimentalSpeciesCompetitionDominantBirth.enabled) {
      return null;
    }

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
