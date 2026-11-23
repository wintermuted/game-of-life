import { useEffect, useState } from 'react';
import { LifeGrid, DEFAULT_RULES, patterns } from '@game-of-life/core';
import { updateURLWithGrid } from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import { cloneGameRules, getImplementedRulesetById } from './playgroundRules';
import { getGridSignature, updateCatalogPatternInURL } from './playgroundRoute';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardEditing } from './useBoardEditing';
import type { BoardNotifications } from './useBoardNotifications';
export interface BoardTransitions {
  loadCustomPattern: (grid: LifeGrid, rulesetId?: string) => void;
  enterPlayMode: () => void;
  enterEditMode: () => void;
  returnToEditModeFromBoardState: () => void;
  requestResetBoard: () => void;
  isResetModalOpen: boolean;
  confirmResetBoard: () => void;
  cancelResetBoard: () => void;
}

export function useBoardTransitions(input: {
  board: Pick<
    PlaygroundBoardState,
    | 'isEditMode'
    | 'setIsEditMode'
    | 'setIsRulesLocked'
    | 'replacePattern'
    | 'reinitializeBoard'
    | 'updateRules'
  >;
  metadata: Pick<PlaygroundMetadata, 'isSystemPattern' | 'isUnsavedEditableBoard'>;
  playback: Pick<SimulationPlayback, 'isGameRunning' | 'stopGame' | 'resetBoardStateOverlayState'>;
  editing: Pick<BoardEditing, 'clearSelectionGrid' | 'resetEditingHistory'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): BoardTransitions {
  const {
    isEditMode,
    setIsEditMode,
    setIsRulesLocked,
    replacePattern,
    reinitializeBoard,
    updateRules,
  } = input.board;
  const { isSystemPattern, isUnsavedEditableBoard } = input.metadata;
  const { isGameRunning, stopGame, resetBoardStateOverlayState } = input.playback;
  const { clearSelectionGrid, resetEditingHistory } = input.editing;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  function returnToEditModeFromBoardState(): void {
    resetBoardStateOverlayState();
    enterEditMode();
  }

  function enterPlayMode(): void {
    if (!isEditMode) return;

    setIsEditMode(false);
    clearSelectionGrid();
    notify(t('messages.playModeEntered'));
  }

  function enterEditMode(): void {
    if (isSystemPattern) {
      notify(t('playground.systemReadonlyHint'));
      return;
    }

    if (isGameRunning) {
      stopGame(false);
    }

    setIsEditMode(true);
    notify(t('messages.editModeEntered'));
  }

  function resetBoard(): void {
    console.info('Reset board pushed.');
    updateRules(cloneGameRules(DEFAULT_RULES));
    setIsRulesLocked(!isUnsavedEditableBoard);
    resetEditingHistory();
    resetBoardStateOverlayState();
    reinitializeBoard();
  }

  function requestResetBoard(): void {
    setIsResetModalOpen(true);
  }

  function confirmResetBoard(): void {
    resetBoard();
    setIsResetModalOpen(false);
  }

  function cancelResetBoard(): void {
    setIsResetModalOpen(false);
  }

  function loadCustomPattern(grid: LifeGrid, rulesetId = 'standard'): void {
    console.info('Loading custom pattern', grid);
    const ruleset = getImplementedRulesetById(rulesetId);
    const nextRules = cloneGameRules(ruleset?.rules ?? DEFAULT_RULES);
    const systemPreset = patterns.find(
      (pattern) => getGridSignature(pattern.grid) === getGridSignature(grid),
    );
    const isSystemPreset = Boolean(systemPreset);
    updateRules(nextRules);
    setIsRulesLocked(isSystemPreset);
    resetEditingHistory();
    resetBoardStateOverlayState();
    replacePattern(grid);

    // Update URL when pattern is selected
    updateURLWithGrid(grid);
    updateCatalogPatternInURL(systemPreset?.name ?? null);
  }

  useEffect(() => {
    if (!isSystemPattern) return;
    if (isEditMode) {
      setIsEditMode(false);
    }
  }, [isEditMode, isSystemPattern, setIsEditMode]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('gol-play-mode-changed', {
        detail: { mode: isEditMode ? 'edit' : 'play' },
      }),
    );
  }, [isEditMode]);
  return {
    loadCustomPattern,
    enterPlayMode,
    enterEditMode,
    returnToEditModeFromBoardState,
    requestResetBoard,
    isResetModalOpen,
    confirmResetBoard,
    cancelResetBoard,
  };
}
