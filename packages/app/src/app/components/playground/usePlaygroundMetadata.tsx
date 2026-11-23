import { useEffect, useState } from 'react';
import { LifeGrid, RULESETS, patterns } from '@game-of-life/core';
import { encodeGridToBase64 } from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import {
  ensureSeededSocialData,
  getFavoriteBoards,
  getForkOrigins,
  getForkOrigin,
  getStoredProfileUser,
  getSavedBoards,
  getSavedTemplateNames,
  hashToGrid,
  SavedBoardRecord,
  ForkOriginRecord,
} from '@game-of-life/api';
import { RulesetSelectionId, PlayPatternMetadata } from './playgroundTypes';
import { detectRulesetSelection } from './playgroundRules';
import {
  getGridSignature,
  getPatternHashFromURL,
  getBoardIdFromURL,
  getCatalogPatternNameFromURL,
  toCreatorSlug,
} from './playgroundRoute';
import { knownPatternMetadataByHash } from './playgroundCatalog';
import { getDescriptiveTags } from '../../util/patternMetadata';
import type { Dispatch, SetStateAction } from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
export interface PlaygroundMetadata {
  currentPatternMetadata: PlayPatternMetadata;
  isSystemPattern: boolean;
  currentBoardId: string | null;
  savedBoardForCurrent: SavedBoardRecord;
  savedBoardForRoute: SavedBoardRecord | undefined;
  isUnsavedEditableBoard: boolean;
  selectedRulesetId: RulesetSelectionId;
  activeRulesetName: string;
  savedTemplateNames: Record<string, string>;
  setSavedTemplateNamesState: Dispatch<SetStateAction<Record<string, string>>>;
  storedProfileName: string;
  currentGridHash: string;
  effectivePatternHash: string;
  savedBoardCategory: string | null;
  savedBoardDescription: string | null;
  savedBoardTags: string[];
  socialPatternHash: string;
  presetTitle: string;
  unsavedBoardDefaultName: string;
  headerTitle: string;
  uncategorizedCategory: string;
  draftCategoryOptions: string[];
  patternCategoryLabel: string | null;
  infoAuthorValue: string;
  infoSourceTag: string;
  isStarredByCurrentUser: boolean;
  forkOrigin: ForkOriginRecord | null;
  isUnsavedDraftBoard: boolean;
  patternStars: number;
  patternForks: number;
  activeRulesetClassification: string;
  canManageGameRules: boolean;
  patternCreatorLabel: string | null;
  authorProfileHref: string | null;
  categoryExploreHref: string | null;
  rulesetExploreHref: string;
  forkParentHref: string | null;
  infoCategoryValue: string;
  infoDescriptionValue: string;
  infoTags: string[];
  getInfoTagExploreHref: (tag: string) => string;
  forkedByRecords: {
    boardId: string;
    boardHash: string;
    boardGrid: LifeGrid;
    forker: string;
    pattern: string;
    forkedAt: string;
    updatedAt: string;
    stars: number;
  }[];
  getBoardHref: (hash: string, boardId?: string) => string;
  starredByUsers: string[];
}

export function usePlaygroundMetadata(input: {
  board: Pick<PlaygroundBoardState, 'currentPattern' | 'rules'>;
}): PlaygroundMetadata {
  const { currentPattern, rules } = input.board;
  const { t } = useTranslation();
  const selectedRulesetId = detectRulesetSelection(rules);

  const selectedRulesetDefinition = RULESETS.find((ruleset) => ruleset.id === selectedRulesetId);

  const activeRulesetClassification =
    selectedRulesetId === 'custom'
      ? t('diagnostics.rulesetCustomClassification')
      : (selectedRulesetDefinition?.classification ?? t('diagnostics.rulesetCustomClassification'));

  const activeRulesetName =
    selectedRulesetId === 'custom'
      ? t('diagnostics.rulesetCustomOption')
      : (selectedRulesetDefinition?.name ?? t('diagnostics.rulesetCustomOption'));

  const [savedTemplateNames, setSavedTemplateNamesState] = useState<Record<string, string>>(() =>
    getSavedTemplateNames(),
  );

  const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

  const presetTitleBySignature = patterns.reduce<Record<string, string>>((acc, pattern) => {
    acc[getGridSignature(pattern.grid)] = pattern.name;
    return acc;
  }, {});

  const storedProfileName = getStoredProfileUser().name || t('playground.youUserLabel');

  const currentPatternHash = getPatternHashFromURL();

  const currentGridHash = currentPatternHash || encodeGridToBase64(currentPattern);

  const currentBoardId = getBoardIdFromURL();

  const activeForkRecord = currentBoardId ? getForkOrigin(currentBoardId) : null;

  const effectivePatternHash = activeForkRecord?.hash ?? currentBoardId ?? currentGridHash;

  const savedBoards = getSavedBoards();

  const savedBoardsByBoardId = savedBoards.reduce<
    Record<string, ReturnType<typeof getSavedBoards>[number]>
  >((acc, entry) => {
    acc[entry.boardId ?? entry.hash] = entry;
    return acc;
  }, {});

  const savedBoardForCurrent = savedBoardsByBoardId[effectivePatternHash];

  const savedBoardForRoute = currentBoardId ? savedBoardsByBoardId[currentBoardId] : undefined;

  const savedBoardCategory = savedBoardForCurrent?.category?.trim() || null;

  const savedBoardDescription = savedBoardForCurrent?.description?.trim() || null;

  const savedBoardTags = savedBoardForCurrent?.tags ?? [];

  const catalogPatternName = getCatalogPatternNameFromURL();

  const catalogPatternMetadata = catalogPatternName
    ? Object.values(knownPatternMetadataByHash).find(
        (pattern) => pattern.source === 'system' && pattern.name === catalogPatternName,
      )
    : undefined;

  const currentPatternMetadata = activeForkRecord
    ? {
        hash: activeForkRecord.hash,
        name:
          getSavedTemplateNames()[activeForkRecord.hash] ||
          activeForkRecord.forkedPatternTitle ||
          `${activeForkRecord.parentTitle} (${t('playground.forkSuffix')})`,
        category:
          knownPatternMetadataByHash[activeForkRecord.parentHash]?.category ??
          t('playground.categoryUnknown'),
        source: 'user' as const,
        creatorName: activeForkRecord.forkerName || storedProfileName,
        favoriteCount: 0,
        forkCount: getForkOrigins().filter((entry) => entry.parentHash === activeForkRecord.hash)
          .length,
      }
    : (catalogPatternMetadata ?? knownPatternMetadataByHash[effectivePatternHash]);

  useEffect(() => {
    ensureSeededSocialData(
      Object.values(knownPatternMetadataByHash).map((pattern) => ({
        hash: pattern.hash,
        title: pattern.name,
        source: pattern.source,
        creatorName: pattern.creatorName,
      })),
    );
  }, []);

  const isSystemPattern = currentPatternMetadata?.source === 'system';

  const isCurrentUserPattern =
    currentPatternMetadata?.source === 'user' &&
    currentPatternMetadata.creatorName === storedProfileName;

  const socialPatternHash = isSystemPattern ? currentPatternMetadata.hash : effectivePatternHash;

  const forkOrigin = activeForkRecord ?? getForkOrigin(effectivePatternHash);

  const currentGridSignature = getGridSignature(currentPattern);

  const presetTitle = presetTitleBySignature[currentGridSignature];

  const savedTitle = savedTemplateNames[effectivePatternHash];

  const isUnsavedDraftBoard = !currentBoardId && !savedTitle;

  const isUnsavedEditableBoard = isUnsavedDraftBoard && !isSystemPattern;

  const canManageGameRules = Boolean(
    activeForkRecord ||
    savedBoardForRoute ||
    savedBoardForCurrent ||
    (!currentPatternMetadata && isUnsavedDraftBoard) ||
    isCurrentUserPattern,
  );

  const emptyBoardHash = encodeGridToBase64({});

  const isUnsavedEmptyBoard =
    isUnsavedDraftBoard &&
    currentGridHash === emptyBoardHash &&
    Object.keys(currentPattern).length === 0;

  const todayLabel = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const unsavedBoardDefaultName = `${storedProfileName}'s New Game - ${todayLabel}`;

  const headerTitle = isUnsavedEmptyBoard
    ? unsavedBoardDefaultName
    : savedTitle || currentPatternMetadata?.name || presetTitle || unsavedBoardDefaultName;

  const uncategorizedCategory = t('playground.categoryUncategorized');

  const supportedDraftCategories = Array.from(
    new Set(
      Object.values(knownPatternMetadataByHash)
        .map((pattern) => pattern.category)
        .filter((category) => category.trim().length > 0),
    ),
  ).sort((left, right) => left.localeCompare(right));

  const draftCategoryOptions = [...supportedDraftCategories, uncategorizedCategory];

  const patternCategoryLabel = currentPatternMetadata
    ? savedBoardCategory || currentPatternMetadata.category || t('playground.categoryUnknown')
    : isUnsavedDraftBoard
      ? null
      : savedBoardCategory || t('playground.categoryUnknown');

  const patternCreatorLabel = currentPatternMetadata
    ? currentPatternMetadata.source === 'system'
      ? t('patternSource.system')
      : (currentPatternMetadata.creatorName ?? t('patternSource.user'))
    : isUnsavedDraftBoard
      ? null
      : t('patternSource.user');

  const authorProfileHref = currentPatternMetadata
    ? currentPatternMetadata.source === 'system'
      ? '/profile?creator=system'
      : `/profile?creator=${encodeURIComponent(toCreatorSlug(currentPatternMetadata.creatorName ?? 'user'))}`
    : null;

  const categoryExploreHref = patternCategoryLabel
    ? `/explore?category=${encodeURIComponent(patternCategoryLabel)}`
    : null;

  const rulesetExploreHref = `/explore?ruleset=${encodeURIComponent(selectedRulesetId)}`;

  const forkParentHref = forkOrigin
    ? (() => {
        const params = new URLSearchParams({ pattern: forkOrigin.parentHash });
        if (forkOrigin.parentSource === 'system') {
          params.set('catalog', forkOrigin.parentTitle);
        }
        const parentRulesetId = patterns.find(
          (pattern) => encodeGridToBase64(pattern.grid) === forkOrigin.parentHash,
        )?.rulesetId;
        if (parentRulesetId) {
          params.set('ruleset', parentRulesetId);
        }
        return `/play?${params.toString()}`;
      })()
    : null;

  const infoDescriptionBase =
    currentPatternMetadata?.source === 'system' && patternCategoryLabel
      ? t('playground.infoDescriptionSystem', { category: patternCategoryLabel })
      : currentPatternMetadata?.creatorName && patternCategoryLabel && patternCreatorLabel
        ? t('playground.infoDescriptionUser', {
            category: patternCategoryLabel,
            creator: patternCreatorLabel,
          })
        : '';

  const infoDescription =
    !isUnsavedDraftBoard && infoDescriptionBase
      ? forkOrigin
        ? `${infoDescriptionBase} ${t('playground.infoDescriptionForked', { name: forkOrigin.parentTitle })}`
        : infoDescriptionBase
      : '';

  const effectiveDescription =
    savedBoardDescription ||
    currentPatternMetadata?.description ||
    (!isUnsavedDraftBoard ? infoDescription : '');

  const infoAuthorValue = patternCreatorLabel ?? storedProfileName;

  const infoCategoryValue = patternCategoryLabel ?? uncategorizedCategory;

  const infoDescriptionValue =
    effectiveDescription ||
    t('playground.infoDescriptionUser', { category: infoCategoryValue, creator: infoAuthorValue });

  const infoSourceTag =
    currentPatternMetadata?.source === 'system'
      ? t('patternSource.system')
      : t('patternSource.user');

  const infoVisibilityTag =
    isSystemPattern || savedBoardForCurrent?.visibility === 'public'
      ? t('playground.visibilityPublic')
      : t('playground.visibilityPrivate');

  const candidateInfoTags =
    savedBoardTags.length > 0 ? savedBoardTags : (currentPatternMetadata?.tags ?? []);

  const infoTags = getDescriptiveTags(candidateInfoTags, [
    infoCategoryValue,
    infoSourceTag,
    infoVisibilityTag,
    infoAuthorValue,
    activeRulesetName,
    selectedRulesetId,
  ]);

  function getInfoTagExploreHref(tag: string): string {
    if (tag === infoCategoryValue) {
      return `/explore?category=${encodeURIComponent(infoCategoryValue)}`;
    }

    if (tag === infoSourceTag) {
      return `/explore?source=${isSystemPattern ? 'system' : 'user'}`;
    }

    return `/explore?tag=${encodeURIComponent(tag)}`;
  }

  const favoriteRecordsForPattern = isUnsavedEditableBoard
    ? []
    : getFavoriteBoards().filter((entry) => entry.hash === socialPatternHash);

  const patternStars = favoriteRecordsForPattern.length;

  const patternForks = isUnsavedEditableBoard
    ? 0
    : getForkOrigins().filter((entry) => entry.parentHash === socialPatternHash).length;

  const isStarredByCurrentUser = favoriteRecordsForPattern.some(
    (entry) => (entry.actorName || storedProfileName) === storedProfileName,
  );

  const starredByUsers = getFavoriteBoards()
    .filter((entry) => entry.hash === socialPatternHash)
    .map((entry) => entry.actorName || storedProfileName);

  const forkOrigins = getForkOrigins().filter((entry) => entry.parentHash === socialPatternHash);

  const forkRecordsFromStorage = forkOrigins.map((entry) => {
    const savedBoard = savedBoardsByBoardId[entry.hash];
    const boardHash = savedBoard?.hash ?? currentGridHash;
    const boardGrid = hashToGrid(boardHash) ?? currentPattern;
    const forkingPatternTitle =
      savedTemplateNames[entry.hash] ||
      savedBoard?.title ||
      knownPatternMetadataByHash[entry.hash]?.name ||
      t('playground.unknownForkPattern');

    return {
      boardId: entry.hash,
      boardHash,
      boardGrid,
      forker: entry.forkerName || storedProfileName,
      pattern: entry.forkedPatternTitle || forkingPatternTitle,
      forkedAt: dateFormatter.format(new Date(entry.createdAt)),
      updatedAt: dateFormatter.format(new Date(savedBoard?.updatedAt ?? entry.createdAt)),
      stars: getFavoriteBoards().filter((favoriteEntry) => favoriteEntry.hash === entry.hash)
        .length,
    };
  });

  const forkedByRecords = forkRecordsFromStorage;

  function getBoardHref(hash: string, boardId?: string): string {
    const params = new URLSearchParams();
    params.set('pattern', hash);
    if (boardId && boardId !== hash) {
      params.set('board', boardId);
    }
    return `/play?${params.toString()}`;
  }
  return {
    currentPatternMetadata,
    isSystemPattern,
    currentBoardId,
    savedBoardForCurrent,
    savedBoardForRoute,
    isUnsavedEditableBoard,
    selectedRulesetId,
    activeRulesetName,
    savedTemplateNames,
    setSavedTemplateNamesState,
    storedProfileName,
    currentGridHash,
    effectivePatternHash,
    savedBoardCategory,
    savedBoardDescription,
    savedBoardTags,
    socialPatternHash,
    presetTitle,
    unsavedBoardDefaultName,
    headerTitle,
    uncategorizedCategory,
    draftCategoryOptions,
    patternCategoryLabel,
    infoAuthorValue,
    infoSourceTag,
    isStarredByCurrentUser,
    forkOrigin,
    isUnsavedDraftBoard,
    patternStars,
    patternForks,
    activeRulesetClassification,
    canManageGameRules,
    patternCreatorLabel,
    authorProfileHref,
    categoryExploreHref,
    rulesetExploreHref,
    forkParentHref,
    infoCategoryValue,
    infoDescriptionValue,
    infoTags,
    getInfoTagExploreHref,
    forkedByRecords,
    getBoardHref,
    starredByUsers,
  };
}
