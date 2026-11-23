import { useState } from 'react';
import { LifeGrid, patterns } from '@game-of-life/core';
import {
  updateURLWithGrid,
  StampRotation,
  mergeGridAtCoordinate,
  tintGridCells,
  rotateGridAroundBoundsCenter,
  rotateStampRotationClockwise,
  rotateStampRotationCounterClockwise,
} from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import { getGridSignature } from './playgroundRoute';
import type { Dispatch, SetStateAction } from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardEditing } from './useBoardEditing';
import type { BoardPresentation } from './useBoardPresentation';
import type { BoardTransitions } from './useBoardTransitions';
import type { BoardNotifications } from './useBoardNotifications';
export interface StampEditing {
  stampPattern: LifeGrid | null;
  stampRotation: StampRotation;
  setRotateStampKeyPressToken: Dispatch<SetStateAction<number>>;
  rotateStampPattern: () => void;
  rotateStampPatternCounterClockwise: () => void;
  rotateStampKeyPressToken: number;
  rotatedStampPattern: LifeGrid | null;
  tintedStampPreviewPattern: LifeGrid | null;
  stampPatternName: string;
  handleContextCoordinateRequest: (coordinate: string) => void;
  handleStampPatternSelect: (grid: LifeGrid) => void;
  handleStampPatternAtCoordinate: (coordinate: string) => void;
  handlePatternInputLoad: (grid: LifeGrid, rulesetId?: string) => void;
  contextInsertCoordinate: string | null;
  closeInsertPatternModal: () => void;
  handleInsertSystemPattern: (patternGrid: LifeGrid) => void;
}

export function useStampEditing(input: {
  board: Pick<PlaygroundBoardState, 'isEditMode' | 'currentPattern' | 'game' | 'replacePattern'>;
  metadata: Pick<PlaygroundMetadata, 'isSystemPattern'>;
  playback: Pick<
    SimulationPlayback,
    'isGameRunning' | 'resetBoardStateOverlayState' | 'handleBoardExpansion'
  >;
  editing: Pick<BoardEditing, 'activeEditTool' | 'clearSelectionGrid' | 'captureUndoSnapshot'>;
  presentation: Pick<BoardPresentation, 'activeDrawColor'>;
  transitions: Pick<BoardTransitions, 'loadCustomPattern'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): StampEditing {
  const { isEditMode, currentPattern, game, replacePattern } = input.board;
  const { isSystemPattern } = input.metadata;
  const { isGameRunning, resetBoardStateOverlayState, handleBoardExpansion } = input.playback;
  const { activeEditTool, clearSelectionGrid, captureUndoSnapshot } = input.editing;
  const { activeDrawColor } = input.presentation;
  const { loadCustomPattern } = input.transitions;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [stampPattern, setStampPattern] = useState<LifeGrid | null>(null);

  const [stampRotation, setStampRotation] = useState<StampRotation>(0);

  const [rotateStampKeyPressToken, setRotateStampKeyPressToken] = useState(0);

  const [contextInsertCoordinate, setContextInsertCoordinate] = useState<string | null>(null);

  const rotatedStampPattern = stampPattern
    ? rotateGridAroundBoundsCenter(stampPattern, stampRotation)
    : null;

  const tintedStampPreviewPattern = rotatedStampPattern
    ? tintGridCells(rotatedStampPattern, activeDrawColor)
    : null;

  const stampPatternName = stampPattern
    ? (patterns.find((pattern) => getGridSignature(pattern.grid) === getGridSignature(stampPattern))
        ?.name ?? t('patterns.custom'))
    : '';

  function handleContextCoordinateRequest(coordinate: string): void {
    if (!isEditMode) {
      notify(t('messages.enterEditModeToInsertPattern'));
      return;
    }

    if (isGameRunning) {
      notify(t('messages.pauseToInsertPattern'));
      return;
    }

    if (isSystemPattern) {
      notify(t('playground.systemReadonlyHint'));
      return;
    }

    setContextInsertCoordinate(coordinate);
  }

  function handlePatternInputLoad(grid: LifeGrid, rulesetId?: string): void {
    if (isEditMode && activeEditTool === 'stamp') {
      setStampPattern(grid);
      notify(t('messages.stampPatternSelected'));
      return;
    }

    loadCustomPattern(grid, rulesetId);
  }

  function handleStampPatternSelect(grid: LifeGrid): void {
    setStampPattern(grid);
    notify(t('messages.stampPatternSelected'));
  }

  function closeInsertPatternModal(): void {
    setContextInsertCoordinate(null);
  }

  function handleInsertSystemPattern(patternGrid: LifeGrid): void {
    if (!contextInsertCoordinate) {
      closeInsertPatternModal();
      return;
    }

    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    const nextGrid = mergeGridAtCoordinate(currentGrid, patternGrid, contextInsertCoordinate);

    captureUndoSnapshot(currentGrid);
    clearSelectionGrid();
    resetBoardStateOverlayState();
    replacePattern(nextGrid);
    updateURLWithGrid(nextGrid);
    notify(t('messages.systemPatternInserted'));
    closeInsertPatternModal();
  }

  function handleStampPatternAtCoordinate(coordinate: string): void {
    if (!rotatedStampPattern) {
      notify(t('messages.selectStampPatternFirst'));
      return;
    }

    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    const coloredStampPattern = tintGridCells(rotatedStampPattern, activeDrawColor);
    const nextGrid = mergeGridAtCoordinate(currentGrid, coloredStampPattern, coordinate);

    handleBoardExpansion(currentGrid, nextGrid);

    clearSelectionGrid();
    replacePattern(nextGrid);
    updateURLWithGrid(nextGrid);
    notify(t('messages.stampPatternApplied'));
  }

  function rotateStampPattern(): void {
    setStampRotation((previous) => rotateStampRotationClockwise(previous));
  }

  function rotateStampPatternCounterClockwise(): void {
    setStampRotation((previous) => rotateStampRotationCounterClockwise(previous));
  }
  return {
    stampPattern,
    stampRotation,
    setRotateStampKeyPressToken,
    rotateStampPattern,
    rotateStampPatternCounterClockwise,
    rotateStampKeyPressToken,
    rotatedStampPattern,
    tintedStampPreviewPattern,
    stampPatternName,
    handleContextCoordinateRequest,
    handleStampPatternSelect,
    handleStampPatternAtCoordinate,
    handlePatternInputLoad,
    contextInsertCoordinate,
    closeInsertPatternModal,
    handleInsertSystemPattern,
  };
}
