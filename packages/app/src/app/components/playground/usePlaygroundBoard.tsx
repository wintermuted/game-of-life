import { useEffect, useRef, useState } from 'react';
import { Game, LifeGrid, GameStats, GameRules } from '@game-of-life/core';
import { getGridFromURL } from '@game-of-life/util';
import { GenerationInteractionMetrics } from './playgroundTypes';
import {
  EMPTY_GENERATION_INTERACTION_METRICS,
  mergeColorCountLedger,
} from './generationInteractions';
import {
  getInitialRulesLocked,
  getEditModeFromURL,
  getRulesetFromURL,
  baseGame,
} from './playgroundRoute';
import type { Dispatch, SetStateAction } from 'react';

export interface PlaygroundBoardState {
  currentPattern: LifeGrid;
  rules: GameRules;
  boardNeedsInitialization: boolean;
  generation: number;
  isEditMode: boolean;
  stats: GameStats;
  game: Game;
  getGame: () => Game;
  recordGeneration: (metrics: GenerationInteractionMetrics) => void;
  isRulesLocked: boolean;
  setIsRulesLocked: Dispatch<SetStateAction<boolean>>;
  updateRules: (rules: GameRules) => void;
  replacePattern: (grid: LifeGrid) => void;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  reinitializeBoard: () => void;
  lastGenerationInteractions: GenerationInteractionMetrics;
  overcrowdingDeathLedgerByPressureColor: Record<string, number>;
}

export function usePlaygroundBoard(): PlaygroundBoardState {
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);

  const [generation, setGeneration] = useState(0);

  const [isEditMode, setIsEditMode] = useState(() => getEditModeFromURL());

  const [currentPattern, setCurrentPattern] = useState<LifeGrid>(() => {
    // Check URL for pattern on initial load
    const urlPattern = getGridFromURL();
    return urlPattern || baseGame;
  });

  const [lastGenerationInteractions, setLastGenerationInteractions] =
    useState<GenerationInteractionMetrics>(EMPTY_GENERATION_INTERACTION_METRICS);

  const [overcrowdingDeathLedgerByPressureColor, setOvercrowdingDeathLedgerByPressureColor] =
    useState<Record<string, number>>({});

  const [stats, setStats] = useState<GameStats>({ liveCells: 0, births: 0, deaths: 0 });

  const [rules, setRules] = useState<GameRules>(() => getRulesetFromURL());

  const [isRulesLocked, setIsRulesLocked] = useState(getInitialRulesLocked);

  const gameRef = useRef<Game | null>(null);
  if (!gameRef.current) gameRef.current = new Game(currentPattern, rules);
  const game = gameRef.current;

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization');
      const nextGame = new Game(currentPattern, rules);
      gameRef.current = nextGame;
      setBoardInitialization(false);
      setGeneration(0);
      setStats(nextGame.getStats());
      setLastGenerationInteractions(EMPTY_GENERATION_INTERACTION_METRICS);
      setOvercrowdingDeathLedgerByPressureColor({});
    }
  }, [boardNeedsInitialization, currentPattern, rules]);
  function replacePattern(grid: LifeGrid): void {
    setCurrentPattern(grid);
    setBoardInitialization(true);
  }
  function getGame(): Game {
    return gameRef.current ?? game;
  }
  function reinitializeBoard(): void {
    setBoardInitialization(true);
  }
  function updateRules(nextRules: GameRules): void {
    setRules(nextRules);
    gameRef.current?.setRules(nextRules);
  }
  function recordGeneration(metrics: GenerationInteractionMetrics): void {
    setLastGenerationInteractions(metrics);
    setOvercrowdingDeathLedgerByPressureColor((previous) =>
      mergeColorCountLedger(previous, metrics.overcrowdingDeathsByPressureColor),
    );
    setGeneration(getGame().getGenerations());
    setStats(getGame().getStats());
  }

  return {
    currentPattern,
    rules,
    boardNeedsInitialization,
    generation,
    isEditMode,
    stats,
    game,
    getGame,
    recordGeneration,
    isRulesLocked,
    setIsRulesLocked,
    updateRules,
    replacePattern,
    setIsEditMode,
    reinitializeBoard,
    lastGenerationInteractions,
    overcrowdingDeathLedgerByPressureColor,
  };
}
