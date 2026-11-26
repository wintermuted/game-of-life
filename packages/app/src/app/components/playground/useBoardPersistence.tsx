import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  setSavedTemplateNames,
  upsertSavedBoard,
  upsertForkOrigin,
  trackRecentBoard,
} from '@game-of-life/api';
import { PatternSource, NameModalMode, DraftSaveModalMode } from './playgroundTypes';
import { getDescriptiveTags } from '../../util/patternMetadata';
import type { Dispatch, SetStateAction } from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardSocial } from './useBoardSocial';
import type { BoardNotifications } from './useBoardNotifications';
export interface BoardPersistence {
  saveTemplate: (
    saveAs: boolean,
    options?: {
      skipPrompt?: boolean;
      category?: string;
      title?: string;
      description?: string;
      tags?: string[];
      visibility?: 'public' | 'private';
    },
  ) => void;
  openDraftSaveConfirmModal: (mode: DraftSaveModalMode) => void;
  openEditNameModal: () => void;
  isEditNameModalOpen: boolean;
  patternNameDraft: string;
  setPatternNameDraft: Dispatch<SetStateAction<string>>;
  nameModalMode: NameModalMode;
  closeEditNameModal: () => void;
  confirmEditNameModal: () => void;
  isDraftSaveConfirmModalOpen: boolean;
  draftSaveModalMode: DraftSaveModalMode;
  draftSaveName: string;
  setDraftSaveName: Dispatch<SetStateAction<string>>;
  draftSaveCategory: string;
  setDraftSaveCategory: Dispatch<SetStateAction<string>>;
  draftSaveDescription: string;
  setDraftSaveDescription: Dispatch<SetStateAction<string>>;
  draftSaveTags: string;
  setDraftSaveTags: Dispatch<SetStateAction<string>>;
  draftSaveVisibility: 'public' | 'private';
  setDraftSaveVisibility: Dispatch<SetStateAction<'public' | 'private'>>;
  closeDraftSaveConfirmModal: () => void;
  confirmDraftSave: () => void;
  openForkNameModal: () => void;
}

export function useBoardPersistence(input: {
  board: Pick<PlaygroundBoardState, 'rules' | 'isRulesLocked' | 'setIsRulesLocked'>;
  metadata: Pick<
    PlaygroundMetadata,
    | 'selectedRulesetId'
    | 'activeRulesetName'
    | 'savedTemplateNames'
    | 'setSavedTemplateNamesState'
    | 'storedProfileName'
    | 'currentGridHash'
    | 'effectivePatternHash'
    | 'savedBoardForCurrent'
    | 'savedBoardCategory'
    | 'savedBoardDescription'
    | 'savedBoardTags'
    | 'currentPatternMetadata'
    | 'isSystemPattern'
    | 'socialPatternHash'
    | 'presetTitle'
    | 'isUnsavedEditableBoard'
    | 'unsavedBoardDefaultName'
    | 'headerTitle'
    | 'uncategorizedCategory'
    | 'draftCategoryOptions'
    | 'patternCategoryLabel'
    | 'infoAuthorValue'
    | 'infoSourceTag'
  >;
  social: Pick<BoardSocial, 'setActivePopularityModal'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): BoardPersistence {
  const { rules, isRulesLocked, setIsRulesLocked } = input.board;
  const {
    selectedRulesetId,
    activeRulesetName,
    savedTemplateNames,
    setSavedTemplateNamesState,
    storedProfileName,
    currentGridHash,
    effectivePatternHash,
    savedBoardForCurrent,
    savedBoardCategory,
    savedBoardDescription,
    savedBoardTags,
    currentPatternMetadata,
    isSystemPattern,
    socialPatternHash,
    presetTitle,
    isUnsavedEditableBoard,
    unsavedBoardDefaultName,
    headerTitle,
    uncategorizedCategory,
    draftCategoryOptions,
    patternCategoryLabel,
    infoAuthorValue,
    infoSourceTag,
  } = input.metadata;
  const { setActivePopularityModal } = input.social;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);

  const [isDraftSaveConfirmModalOpen, setIsDraftSaveConfirmModalOpen] = useState(false);

  const [draftSaveModalMode, setDraftSaveModalMode] = useState<DraftSaveModalMode>('save');

  const [draftSaveName, setDraftSaveName] = useState('');

  const [draftSaveCategory, setDraftSaveCategory] = useState('');

  const [draftSaveDescription, setDraftSaveDescription] = useState('');

  const [draftSaveTags, setDraftSaveTags] = useState('');

  const [draftSaveVisibility, setDraftSaveVisibility] = useState<'public' | 'private'>('public');

  const [patternNameDraft, setPatternNameDraft] = useState('');

  const [nameModalMode, setNameModalMode] = useState<NameModalMode>('rename');

  function persistSavedTemplateNames(next: Record<string, string>): void {
    setSavedTemplateNamesState(next);
    setSavedTemplateNames(next);
  }

  function saveTemplate(
    saveAs: boolean,
    options?: {
      skipPrompt?: boolean;
      category?: string;
      title?: string;
      description?: string;
      tags?: string[];
      visibility?: 'public' | 'private';
    },
  ): void {
    const hash = effectivePatternHash;
    if (!hash) return;

    let nextTitle =
      options?.title?.trim() || savedTemplateNames[hash] || presetTitle || unsavedBoardDefaultName;

    if (!options?.skipPrompt && (saveAs || !savedTemplateNames[hash])) {
      const entered = window.prompt(t('playground.savePrompt'), nextTitle);
      if (entered === null) return;
      const trimmed = entered.trim();
      if (!trimmed) return;
      nextTitle = trimmed;
    }

    persistSavedTemplateNames({
      ...savedTemplateNames,
      [hash]: nextTitle,
    });
    const shouldLockRules = isUnsavedEditableBoard ? true : isRulesLocked;
    upsertSavedBoard(
      currentGridHash,
      nextTitle,
      hash,
      options?.category,
      options?.description,
      options?.visibility,
      options?.tags,
      rules,
      shouldLockRules,
    );
    if (isUnsavedEditableBoard) {
      setIsRulesLocked(true);
    }
    trackRecentBoard(currentGridHash, nextTitle, hash);
    notify(t('messages.templateSaved'));
  }

  function openDraftSaveConfirmModal(mode: DraftSaveModalMode): void {
    setDraftSaveModalMode(mode);
    setDraftSaveName(headerTitle);
    setDraftSaveCategory(savedBoardCategory || patternCategoryLabel || uncategorizedCategory);
    setDraftSaveDescription(savedBoardDescription || '');
    setDraftSaveTags(savedBoardTags.join(', '));
    setDraftSaveVisibility(savedBoardForCurrent?.visibility ?? 'public');
    setIsDraftSaveConfirmModalOpen(true);
  }

  function closeDraftSaveConfirmModal(): void {
    setIsDraftSaveConfirmModalOpen(false);
    setDraftSaveModalMode('save');
    setDraftSaveName('');
    setDraftSaveCategory(uncategorizedCategory);
    setDraftSaveDescription('');
    setDraftSaveTags('');
    setDraftSaveVisibility('public');
  }

  function confirmDraftSave(): void {
    const normalizedName = draftSaveName.trim();
    const normalizedCategory = draftSaveCategory.trim();
    const parsedTags = getDescriptiveTags(
      Array.from(
        new Set(
          draftSaveTags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
        ),
      ),
      [
        normalizedCategory,
        infoSourceTag,
        draftSaveVisibility === 'public'
          ? t('playground.visibilityPublic')
          : t('playground.visibilityPrivate'),
        infoAuthorValue,
        activeRulesetName,
        selectedRulesetId,
      ],
    );
    if (
      !normalizedName ||
      !normalizedCategory ||
      !draftCategoryOptions.includes(normalizedCategory)
    )
      return;
    saveTemplate(false, {
      skipPrompt: true,
      title: normalizedName,
      category: normalizedCategory,
      description: draftSaveDescription.trim(),
      tags: parsedTags,
      visibility: draftSaveVisibility,
    });
    closeDraftSaveConfirmModal();
  }

  function openEditNameModal(): void {
    if (isSystemPattern) {
      return;
    }

    setNameModalMode('rename');
    setPatternNameDraft(headerTitle);
    setIsEditNameModalOpen(true);
  }

  function openForkNameModal(): void {
    setNameModalMode('fork');
    setPatternNameDraft(`${headerTitle} (${t('playground.forkSuffix')})`);
    setActivePopularityModal(null);
    setIsEditNameModalOpen(true);
  }

  function closeEditNameModal(): void {
    setIsEditNameModalOpen(false);
  }

  function confirmEditNameModal(): void {
    const trimmed = patternNameDraft.trim();
    if (!trimmed) {
      closeEditNameModal();
      return;
    }

    if (nameModalMode === 'fork') {
      const forkBoardId = `fork-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      persistSavedTemplateNames({
        ...savedTemplateNames,
        [forkBoardId]: trimmed,
      });
      upsertSavedBoard(
        currentGridHash,
        trimmed,
        forkBoardId,
        undefined,
        undefined,
        undefined,
        undefined,
        rules,
        isRulesLocked,
      );
      upsertForkOrigin(forkBoardId, {
        parentHash: socialPatternHash,
        parentTitle: headerTitle,
        parentSource: (currentPatternMetadata?.source ?? 'user') as PatternSource,
        parentCreatorName: currentPatternMetadata?.creatorName,
        forkerName: storedProfileName,
        forkedPatternTitle: trimmed,
      });
      trackRecentBoard(currentGridHash, trimmed, forkBoardId);
      notify(t('messages.patternForked', { name: headerTitle }));
      closeEditNameModal();
      navigate(
        `/play?pattern=${encodeURIComponent(currentGridHash)}&board=${encodeURIComponent(forkBoardId)}`,
      );
      return;
    }

    const hash = effectivePatternHash;
    if (!hash) {
      closeEditNameModal();
      return;
    }

    persistSavedTemplateNames({
      ...savedTemplateNames,
      [hash]: trimmed,
    });
    upsertSavedBoard(
      currentGridHash,
      trimmed,
      hash,
      undefined,
      undefined,
      undefined,
      undefined,
      rules,
      isRulesLocked,
    );
    trackRecentBoard(currentGridHash, trimmed, hash);
    notify(t('messages.templateSaved'));
    closeEditNameModal();
  }

  useEffect(() => {
    if (!effectivePatternHash) return;
    trackRecentBoard(currentGridHash, headerTitle, effectivePatternHash);
  }, [currentGridHash, effectivePatternHash, headerTitle]);
  return {
    saveTemplate,
    openDraftSaveConfirmModal,
    openEditNameModal,
    isEditNameModalOpen,
    patternNameDraft,
    setPatternNameDraft,
    nameModalMode,
    closeEditNameModal,
    confirmEditNameModal,
    isDraftSaveConfirmModalOpen,
    draftSaveModalMode,
    draftSaveName,
    setDraftSaveName,
    draftSaveCategory,
    setDraftSaveCategory,
    draftSaveDescription,
    setDraftSaveDescription,
    draftSaveTags,
    setDraftSaveTags,
    draftSaveVisibility,
    setDraftSaveVisibility,
    closeDraftSaveConfirmModal,
    confirmDraftSave,
    openForkNameModal,
  };
}
