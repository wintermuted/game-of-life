import { getGridSignature } from './playgroundRoute';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
export interface BoardDiagnostics {
  canSaveTemplate: boolean;
  gridJSON: string;
  cellDataEntries: [string, string][];
  liveColorLeaderboard: { color: string; count: number }[];
  maxLiveColorCount: number;
  overcrowdingPressureLeaderboard: { color: string; count: number }[];
  maxOvercrowdingPressureCount: number;
  experimentalBirthLeaderboard: { color: string; count: number; tieBreakCount: number }[];
  maxExperimentalBirthCount: number;
  hasExperimentalRulesEnabled: boolean;
}

export function useBoardDiagnostics(input: {
  board: Pick<
    PlaygroundBoardState,
    | 'generation'
    | 'currentPattern'
    | 'lastGenerationInteractions'
    | 'overcrowdingDeathLedgerByPressureColor'
    | 'rules'
    | 'game'
  >;
  metadata: Pick<PlaygroundMetadata, 'isSystemPattern'>;
}): BoardDiagnostics {
  const {
    generation,
    currentPattern,
    lastGenerationInteractions,
    overcrowdingDeathLedgerByPressureColor,
    rules,
    game,
  } = input.board;
  const { isSystemPattern } = input.metadata;
  const gameStatus = game.getStatus ? game.getStatus() : {};

  const boardModified = getGridSignature(gameStatus) !== getGridSignature(currentPattern);

  const canSaveTemplate = !isSystemPattern && generation > 0 && boardModified;

  const gridJSON = JSON.stringify(gameStatus, null, 2);

  const cellDataEntries = Object.entries(gameStatus);

  const liveColorCounts = Object.values(gameStatus).reduce<Record<string, number>>(
    (accumulator, cellColor) => {
      if (typeof cellColor !== 'string') return accumulator;
      const normalized = cellColor.toLowerCase();
      accumulator[normalized] = (accumulator[normalized] || 0) + 1;
      return accumulator;
    },
    {},
  );

  const liveColorLeaderboard = Object.entries(liveColorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((left, right) => right.count - left.count);

  const maxLiveColorCount = liveColorLeaderboard[0]?.count || 0;

  const overcrowdingPressureLeaderboard = Object.entries(overcrowdingDeathLedgerByPressureColor)
    .map(([color, count]) => ({ color, count }))
    .sort((left, right) => right.count - left.count);

  const maxOvercrowdingPressureCount = overcrowdingPressureLeaderboard[0]?.count || 0;

  const experimentalBirthLeaderboard = Object.entries(
    lastGenerationInteractions.experimentalBirthsByColor,
  )
    .map(([color, count]) => ({
      color,
      count,
      tieBreakCount: lastGenerationInteractions.tieBreakBirthsByColor[color] ?? 0,
    }))
    .sort((left, right) => right.count - left.count);

  const maxExperimentalBirthCount = experimentalBirthLeaderboard[0]?.count || 0;

  const hasExperimentalRulesEnabled =
    rules.experimentalSpeciesCompetitionBirth.enabled ||
    rules.experimentalSpeciesCompetitionDominantBirth.enabled ||
    rules.experimentalSpeciesCompetitionTieBreakBirth.enabled;
  return {
    canSaveTemplate,
    gridJSON,
    cellDataEntries,
    liveColorLeaderboard,
    maxLiveColorCount,
    overcrowdingPressureLeaderboard,
    maxOvercrowdingPressureCount,
    experimentalBirthLeaderboard,
    maxExperimentalBirthCount,
    hasExperimentalRulesEnabled,
  };
}
