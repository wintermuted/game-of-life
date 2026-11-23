import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  rotateStampRotationClockwise,
  rotateStampRotationCounterClockwise,
} from '@game-of-life/util';
import { isInteractiveKeyboardTarget, clampGenerationSpeed } from './playgroundKeyboard';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardEditing } from './useBoardEditing';
import type { StampEditing } from './useStampEditing';
import type { BoardTransitions } from './useBoardTransitions';
import type { BoardNotifications } from './useBoardNotifications';

export function usePlaygroundShortcuts(input: {
  board: Pick<PlaygroundBoardState, 'isEditMode'>;
  playback: Pick<SimulationPlayback, 'generationSpeed' | 'toggleGame' | 'updateGenerationSpeed'>;
  editing: Pick<BoardEditing, 'activeEditTool'>;
  stamp: Pick<
    StampEditing,
    | 'stampPattern'
    | 'stampRotation'
    | 'setRotateStampKeyPressToken'
    | 'rotateStampPattern'
    | 'rotateStampPatternCounterClockwise'
  >;
  transitions: Pick<BoardTransitions, 'enterPlayMode' | 'enterEditMode'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): void {
  const { isEditMode } = input.board;
  const { generationSpeed, toggleGame, updateGenerationSpeed } = input.playback;
  const { activeEditTool } = input.editing;
  const {
    stampPattern,
    stampRotation,
    setRotateStampKeyPressToken,
    rotateStampPattern,
    rotateStampPatternCounterClockwise,
  } = input.stamp;
  const { enterPlayMode, enterEditMode } = input.transitions;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const handleKeyboardShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat) return;
    if (isInteractiveKeyboardTarget(event.target)) return;

    if (event.code === 'Space') {
      event.preventDefault();
      if (isEditMode) {
        enterPlayMode();
        return;
      }

      toggleGame();
      return;
    }

    if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      if (isEditMode) {
        enterPlayMode();
      } else {
        enterEditMode();
      }
      return;
    }

    const isIncreaseKey =
      event.code === 'NumpadAdd' ||
      (event.code === 'Equal' && event.shiftKey) ||
      event.key.toLowerCase() === 'x';
    const isDecreaseKey =
      event.code === 'Minus' || event.code === 'NumpadSubtract' || event.key.toLowerCase() === 'z';

    if (isEditMode && activeEditTool === 'stamp' && stampPattern) {
      const key = event.key.toLowerCase();

      if (event.key === ']') {
        event.preventDefault();
        rotateStampPattern();
        setRotateStampKeyPressToken((previous) => previous + 1);
        notify(
          t('messages.stampRotationUpdated', {
            degrees: rotateStampRotationClockwise(stampRotation),
          }),
        );
        return;
      }

      if (event.key === '[') {
        event.preventDefault();
        rotateStampPatternCounterClockwise();
        setRotateStampKeyPressToken((previous) => previous + 1);
        notify(
          t('messages.stampRotationUpdated', {
            degrees: rotateStampRotationCounterClockwise(stampRotation),
          }),
        );
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        rotateStampPattern();
        setRotateStampKeyPressToken((previous) => previous + 1);
        notify(
          t('messages.stampRotationUpdated', {
            degrees: rotateStampRotationClockwise(stampRotation),
          }),
        );
        return;
      }
    }

    if (!isIncreaseKey && !isDecreaseKey) return;

    event.preventDefault();
    if (isEditMode) {
      notify(t('messages.enterPlayModeToRun'));
      return;
    }

    const nextSpeed = clampGenerationSpeed(generationSpeed + (isIncreaseKey ? 1 : -1));
    if (nextSpeed === generationSpeed) return;

    updateGenerationSpeed(nextSpeed);
    notify(t('messages.generationSpeedChanged', { level: nextSpeed }));
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      handleKeyboardShortcut(event);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
