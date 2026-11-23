import { getCellColor, getNeighborCoordinates, LifeGrid, GameRules } from '@game-of-life/core';
import { GenerationInteractionMetrics } from './playgroundTypes';
export const EMPTY_GENERATION_INTERACTION_METRICS: GenerationInteractionMetrics = {
  overcrowdingDeathsByPressureColor: {},
  experimentalBirthsByColor: {},
  tieBreakBirthsByColor: {},
};

export function incrementColorCount(counter: Record<string, number>, color: string): void {
  const normalized = color.toLowerCase();
  counter[normalized] = (counter[normalized] ?? 0) + 1;
}

export function getColorCounts(colors: string[]): Record<string, number> {
  return colors.reduce<Record<string, number>>((accumulator, color) => {
    const normalized = color.toLowerCase();
    accumulator[normalized] = (accumulator[normalized] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function getDominantColor(colorCounts: Record<string, number>): string | null {
  const sorted = Object.entries(colorCounts).sort((left, right) => {
    if (left[1] === right[1]) {
      return left[0].localeCompare(right[0]);
    }

    return right[1] - left[1];
  });

  return sorted[0]?.[0] ?? null;
}

export function analyzeGenerationInteractions(
  previousGrid: LifeGrid,
  nextGrid: LifeGrid,
  rules: GameRules,
): GenerationInteractionMetrics {
  const metrics: GenerationInteractionMetrics = {
    overcrowdingDeathsByPressureColor: {},
    experimentalBirthsByColor: {},
    tieBreakBirthsByColor: {},
  };

  const deadCoordinates = Object.keys(previousGrid).filter((coordinate) => !nextGrid[coordinate]);
  for (const coordinate of deadCoordinates) {
    const ownColor = getCellColor(previousGrid[coordinate]);
    const liveNeighborColors = getNeighborCoordinates(coordinate)
      .map((neighborCoordinate) => previousGrid[neighborCoordinate])
      .filter((neighborCell): neighborCell is string => typeof neighborCell === 'string')
      .map((neighborCell) => getCellColor(neighborCell));

    if (liveNeighborColors.length <= 3) {
      continue;
    }

    const foreignNeighborColors = liveNeighborColors.filter(
      (neighborColor) => neighborColor !== ownColor,
    );
    if (foreignNeighborColors.length === 0) {
      continue;
    }

    const dominantPressureColor = getDominantColor(getColorCounts(foreignNeighborColors));
    if (!dominantPressureColor) {
      continue;
    }

    incrementColorCount(metrics.overcrowdingDeathsByPressureColor, dominantPressureColor);
  }

  if (!rules.experimentalSpeciesCompetitionBirth.enabled) {
    return metrics;
  }

  const bornCoordinates = Object.keys(nextGrid).filter((coordinate) => !previousGrid[coordinate]);
  for (const coordinate of bornCoordinates) {
    const liveNeighborColors = getNeighborCoordinates(coordinate)
      .map((neighborCoordinate) => previousGrid[neighborCoordinate])
      .filter((neighborCell): neighborCell is string => typeof neighborCell === 'string')
      .map((neighborCell) => getCellColor(neighborCell));

    const uniqueNeighborColors = Array.from(new Set(liveNeighborColors));
    if (uniqueNeighborColors.length <= 1) {
      continue;
    }

    const bornColor = getCellColor(nextGrid[coordinate]);
    incrementColorCount(metrics.experimentalBirthsByColor, bornColor);

    if (!rules.experimentalSpeciesCompetitionTieBreakBirth.enabled) {
      continue;
    }

    const colorCounts = getColorCounts(liveNeighborColors);
    const highestCount = Math.max(...Object.values(colorCounts));
    const tiedColors = Object.values(colorCounts).filter((count) => count === highestCount);

    if (tiedColors.length > 1) {
      incrementColorCount(metrics.tieBreakBirthsByColor, bornColor);
    }
  }

  return metrics;
}

export function mergeColorCountLedger(
  previousLedger: Record<string, number>,
  nextCounts: Record<string, number>,
): Record<string, number> {
  const nextEntries = Object.entries(nextCounts);
  if (nextEntries.length === 0) {
    return previousLedger;
  }

  const merged = { ...previousLedger };
  for (const [color, count] of nextEntries) {
    merged[color] = (merged[color] ?? 0) + count;
  }

  return merged;
}
