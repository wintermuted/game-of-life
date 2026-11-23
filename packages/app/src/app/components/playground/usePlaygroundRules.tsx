import { useEffect, useEffectEvent, useState } from 'react';
import { GameRules, DEFAULT_RULES } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';
import { upsertSavedBoard } from '@game-of-life/api';
import { cloneGameRules, getImplementedRulesetById } from './playgroundRules';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardNotifications } from './useBoardNotifications';
export interface PlaygroundRulesActions {
  handleRulesChange: (newRules: GameRules) => void;
  handleRulesetChange: (rulesetId: string) => void;
  requestUnlockRules: () => void;
  lockRules: () => void;
  isUnlockRulesModalOpen: boolean;
  closeUnlockRulesModal: () => void;
  confirmUnlockRules: () => void;
}

export function usePlaygroundRules(input: {
  board: Pick<PlaygroundBoardState, 'rules' | 'isRulesLocked' | 'setIsRulesLocked' | 'updateRules'>;
  metadata: Pick<
    PlaygroundMetadata,
    'currentBoardId' | 'savedBoardForCurrent' | 'savedBoardForRoute' | 'isUnsavedEditableBoard'
  >;
  notifications: Pick<BoardNotifications, 'notify'>;
}): PlaygroundRulesActions {
  const { rules, isRulesLocked, setIsRulesLocked, updateRules } = input.board;
  const { currentBoardId, savedBoardForCurrent, savedBoardForRoute, isUnsavedEditableBoard } =
    input.metadata;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [isUnlockRulesModalOpen, setIsUnlockRulesModalOpen] = useState(false);

  const applySavedBoardRules = useEffectEvent(() => {
    const nextRules = savedBoardForRoute?.rules
      ? cloneGameRules(savedBoardForRoute.rules)
      : cloneGameRules(DEFAULT_RULES);
    updateRules(nextRules);
    setIsRulesLocked(savedBoardForRoute?.rulesLocked ?? true);
  });

  useEffect(() => {
    if (!currentBoardId) {
      return;
    }

    applySavedBoardRules();
  }, [currentBoardId, savedBoardForRoute?.updatedAt]);

  function handleRulesChange(newRules: GameRules): void {
    if (isRulesLocked) {
      return;
    }

    console.info('Rules updated', newRules);
    updateRules(newRules);

    if (savedBoardForCurrent) {
      upsertSavedBoard(
        savedBoardForCurrent.hash,
        savedBoardForCurrent.title,
        savedBoardForCurrent.boardId ?? savedBoardForCurrent.hash,
        savedBoardForCurrent.category,
        savedBoardForCurrent.description,
        savedBoardForCurrent.visibility,
        savedBoardForCurrent.tags,
        newRules,
        isRulesLocked,
      );
    }
  }

  function handleRulesetChange(rulesetId: string): void {
    if (isRulesLocked) {
      return;
    }

    const ruleset = getImplementedRulesetById(rulesetId);
    if (!ruleset) {
      return;
    }

    const nextRules = cloneGameRules(ruleset.rules);
    handleRulesChange(nextRules);
    notify(
      t('messages.rulesetApplied', { name: ruleset.name, classification: ruleset.classification }),
    );
  }

  function requestUnlockRules(): void {
    setIsUnlockRulesModalOpen(true);
  }

  function closeUnlockRulesModal(): void {
    setIsUnlockRulesModalOpen(false);
  }

  function confirmUnlockRules(): void {
    setIsUnlockRulesModalOpen(false);
    setIsRulesLocked(false);

    if (savedBoardForCurrent) {
      upsertSavedBoard(
        savedBoardForCurrent.hash,
        savedBoardForCurrent.title,
        savedBoardForCurrent.boardId ?? savedBoardForCurrent.hash,
        savedBoardForCurrent.category,
        savedBoardForCurrent.description,
        savedBoardForCurrent.visibility,
        savedBoardForCurrent.tags,
        rules,
        false,
      );
    }
  }

  function lockRules(): void {
    if (isUnsavedEditableBoard) {
      return;
    }

    setIsRulesLocked(true);

    if (savedBoardForCurrent) {
      upsertSavedBoard(
        savedBoardForCurrent.hash,
        savedBoardForCurrent.title,
        savedBoardForCurrent.boardId ?? savedBoardForCurrent.hash,
        savedBoardForCurrent.category,
        savedBoardForCurrent.description,
        savedBoardForCurrent.visibility,
        savedBoardForCurrent.tags,
        rules,
        true,
      );
    }
  }
  return {
    handleRulesChange,
    handleRulesetChange,
    requestUnlockRules,
    lockRules,
    isUnlockRulesModalOpen,
    closeUnlockRulesModal,
    confirmUnlockRules,
  };
}
