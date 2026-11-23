import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { LifeGrid } from '@game-of-life/core';
import { getGenerationSpeed, updateURLWithGrid } from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import { analyzeGenerationInteractions } from './generationInteractions';
import { updateCatalogPatternInURL } from './playgroundRoute';
import { clampGenerationSpeed } from './playgroundKeyboard';
import type * as React from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardNotifications } from './useBoardNotifications';
export interface SimulationPlayback {
  isGameRunning: boolean;
  resetBoardStateOverlayState: () => void;
  handleBoardExpansion: (previousGrid: LifeGrid, nextGrid: LifeGrid) => void;
  generationSpeed: number;
  toggleGame: () => void;
  updateGenerationSpeed: (value: number) => void;
  stopGame: (updateUrl?: boolean) => void;
  isStabilityOverlayEnabled: boolean;
  handleStabilityOverlayToggle: (enabled: boolean) => void;
  boardStateOverlay: 'stability' | 'gameOver' | null;
  continuePlayingFromBoardState: () => void;
  nextGeneration: (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function useSimulationPlayback(input: {
  board: Pick<
    PlaygroundBoardState,
    | 'boardNeedsInitialization'
    | 'generation'
    | 'isEditMode'
    | 'stats'
    | 'rules'
    | 'game'
    | 'getGame'
    | 'recordGeneration'
  >;
  metadata: Pick<PlaygroundMetadata, 'currentPatternMetadata' | 'isSystemPattern'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): SimulationPlayback {
  const {
    boardNeedsInitialization,
    generation,
    isEditMode,
    stats,
    rules,
    game,
    getGame,
    recordGeneration,
  } = input.board;
  const { currentPatternMetadata, isSystemPattern } = input.metadata;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const intervalRef = useRef<ReturnType<typeof window.setInterval> | undefined>(undefined);
  const STABILITY_GENERATION_THRESHOLD = 20;
  useEffect(() => () => window.clearInterval(intervalRef.current), []);
  const [generationSpeed, setGenerationSpeed] = useState(5);

  const [isGameRunning, setIsGameRunning] = useState(false);

  const [isStabilityOverlayEnabled, setIsStabilityOverlayEnabled] = useState(true);

  const suppressBoardStateOverlayRef = useRef(false);

  const liveCellStabilityTracker = useRef<{ lastLiveCells: number | null; streak: number }>({
    lastLiveCells: null,
    streak: 0,
  });

  const [boardStateOverlay, setBoardStateOverlay] = useState<'stability' | 'gameOver' | null>(null);

  useEffect(() => {
    if (boardNeedsInitialization) {
      liveCellStabilityTracker.current = { lastLiveCells: null, streak: 0 };
      setBoardStateOverlay(null);
    }
  }, [boardNeedsInitialization]);

  const stopGameFromEffect = useEffectEvent(() => {
    stopGame(true);
  });

  useEffect(() => {
    if (!isGameRunning || isEditMode) {
      return;
    }

    if (generation <= 0) {
      liveCellStabilityTracker.current = {
        lastLiveCells: stats.liveCells,
        streak: stats.liveCells > 0 ? 1 : 0,
      };
      return;
    }

    const tracker = liveCellStabilityTracker.current;
    if (tracker.lastLiveCells === stats.liveCells) {
      tracker.streak += 1;
    } else {
      tracker.streak = stats.liveCells > 0 ? 1 : 0;
    }
    tracker.lastLiveCells = stats.liveCells;

    if (stats.liveCells === 0) {
      if (isGameRunning) {
        stopGameFromEffect();
      }
      if (boardStateOverlay !== 'gameOver') {
        setBoardStateOverlay('gameOver');
      }
      return;
    }

    if (tracker.streak >= STABILITY_GENERATION_THRESHOLD && isStabilityOverlayEnabled) {
      if (isGameRunning) {
        stopGameFromEffect();
      }
      if (boardStateOverlay !== 'stability') {
        setBoardStateOverlay('stability');
      }
    }
  }, [
    generation,
    stats.liveCells,
    isGameRunning,
    isEditMode,
    boardStateOverlay,
    isStabilityOverlayEnabled,
  ]);

  function runGameInterval(speed = generationSpeed): void {
    intervalRef.current = window.setInterval(() => {
      const currentGame = getGame();
      const previousGrid = { ...currentGame.getStatus() };
      const nextGrid = currentGame.next();
      const generationInteractions = analyzeGenerationInteractions(previousGrid, nextGrid, rules);
      recordGeneration(generationInteractions);
    }, getGenerationSpeed(speed));
  }

  function stopGame(updateUrl = true): void {
    window.clearInterval(intervalRef.current);
    setIsGameRunning(false);

    if (updateUrl) {
      const currentGrid = game.getStatus();
      updateURLWithGrid(currentGrid);
      updateCatalogPatternInURL(isSystemPattern ? (currentPatternMetadata?.name ?? null) : null);
    }
  }

  function resetBoardStateOverlayState(): void {
    suppressBoardStateOverlayRef.current = false;
    setBoardStateOverlay(null);
  }

  function continuePlayingFromBoardState(): void {
    setIsStabilityOverlayEnabled(false);
    suppressBoardStateOverlayRef.current = true;
    setBoardStateOverlay(null);
    liveCellStabilityTracker.current = { lastLiveCells: stats.liveCells, streak: 0 };

    if (!isGameRunning) {
      runGameInterval();
      setIsGameRunning(true);
      notify(t('messages.simulationStarted'));
    }
  }

  function toggleGame(): void {
    if (isEditMode) {
      notify(t('messages.enterPlayModeToRun'));
      return;
    }

    if (isGameRunning) {
      console.info('Pausing game.');
      stopGame(true);
      notify(t('messages.simulationPaused'));
    } else {
      console.info('Starting game.');
      runGameInterval();
      setIsGameRunning(true);
      notify(t('messages.simulationStarted'));
    }
  }

  function nextGeneration(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    console.info('Next generation pushed');
    const previousGrid = { ...game.getStatus() };
    const nextGrid = game.next();
    const generationInteractions = analyzeGenerationInteractions(previousGrid, nextGrid, rules);
    recordGeneration(generationInteractions);
  }

  function updateGenerationSpeed(value: number): void {
    const nextSpeed = clampGenerationSpeed(value);
    console.info('Generation Speed updated', nextSpeed);

    setGenerationSpeed(nextSpeed);

    if (isGameRunning) {
      window.clearInterval(intervalRef.current);
      runGameInterval(nextSpeed);
    }
  }

  // Both passes intentionally advance one tracker, preserving Home's effective pause threshold.
  useEffect(() => {
    if (!isGameRunning || isEditMode) {
      return;
    }

    if (generation <= 0) {
      liveCellStabilityTracker.current = {
        lastLiveCells: stats.liveCells,
        streak: stats.liveCells > 0 ? 1 : 0,
      };
      return;
    }

    const tracker = liveCellStabilityTracker.current;
    if (tracker.lastLiveCells === stats.liveCells) {
      tracker.streak += 1;
    } else {
      tracker.streak = stats.liveCells > 0 ? 1 : 0;
    }
    tracker.lastLiveCells = stats.liveCells;

    if (stats.liveCells === 0) {
      if (isGameRunning) {
        stopGameFromEffect();
      }
      if (!suppressBoardStateOverlayRef.current && boardStateOverlay !== 'gameOver') {
        setBoardStateOverlay('gameOver');
      }
      return;
    }

    if (tracker.streak >= STABILITY_GENERATION_THRESHOLD && isStabilityOverlayEnabled) {
      if (isGameRunning) {
        stopGameFromEffect();
      }
      if (!suppressBoardStateOverlayRef.current && boardStateOverlay === null) {
        setBoardStateOverlay('stability');
      }
    }
  }, [
    generation,
    stats.liveCells,
    isGameRunning,
    isEditMode,
    boardStateOverlay,
    isStabilityOverlayEnabled,
  ]);

  function handleStabilityOverlayToggle(enabled: boolean): void {
    setIsStabilityOverlayEnabled(enabled);

    if (!enabled) {
      setBoardStateOverlay(null);
      return;
    }

    suppressBoardStateOverlayRef.current = false;
  }
  function handleBoardExpansion(previousGrid: LifeGrid, nextGrid: LifeGrid): void {
    if (Object.keys(nextGrid).length > Object.keys(previousGrid).length) {
      suppressBoardStateOverlayRef.current = false;
    }
    if (!suppressBoardStateOverlayRef.current) setBoardStateOverlay(null);
  }

  return {
    isGameRunning,
    resetBoardStateOverlayState,
    handleBoardExpansion,
    generationSpeed,
    toggleGame,
    updateGenerationSpeed,
    stopGame,
    isStabilityOverlayEnabled,
    handleStabilityOverlayToggle,
    boardStateOverlay,
    continuePlayingFromBoardState,
    nextGeneration,
  };
}
