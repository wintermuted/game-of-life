import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LifeGrid } from '@game-of-life/core';
import {
  getForkOrigins,
  setSavedTemplateNames,
  toggleFavoriteBoard,
  trackRecentBoard,
  upsertSavedBoard,
  upsertForkOrigin,
  getSavedTemplateNames,
} from '@game-of-life/api';
import { buildPatternMetrics, getPatternHash } from './exploreCatalog';
import type { ExplorePattern } from './exploreTypes';
import type { ExploreCatalogState } from './useExploreCatalog';
export interface ExploreActions {
  toastOpen: boolean;
  toastMessage: string;
  showFavoritesToastLink: boolean;
  closeToast: () => void;
  handleFork: (pattern: ExplorePattern) => void;
  handleFavorite: (name: string, grid: LifeGrid) => void;
}
export function useExploreActions(
  catalog: Pick<
    ExploreCatalogState,
    | 'allPatterns'
    | 'currentProfileName'
    | 'setFavoriteHashes'
    | 'setForkOrigins'
    | 'setPatternMetrics'
  >,
): ExploreActions {
  const { t } = useTranslation();
  const { allPatterns, currentProfileName, setFavoriteHashes, setForkOrigins, setPatternMetrics } =
    catalog;
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showFavoritesToastLink, setShowFavoritesToastLink] = useState(false);
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(message: string, includeFavoritesLink = false): void {
    setToastMessage(message);
    setShowFavoritesToastLink(includeFavoritesLink);
    setToastOpen(true);
  }

  function closeToast(): void {
    setToastOpen(false);
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
  }

  useEffect(() => {
    if (!toastOpen) {
      return;
    }

    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    toastHideTimer.current = setTimeout(() => {
      setToastOpen(false);
    }, 3200);

    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, [toastOpen]);

  function handleFork(pattern: ExplorePattern): void {
    const hash = getPatternHash(pattern.grid);
    const forkBoardId = `${hash}-fork-${Date.now().toString(36)}`;
    const patternName = pattern.name;
    const forkTitle = `${patternName} (${t('explore.forkSuffix')})`;
    const currentTemplateNames = getSavedTemplateNames();

    setSavedTemplateNames({
      ...currentTemplateNames,
      [hash]: forkTitle,
    });
    upsertSavedBoard(hash, forkTitle, forkBoardId);
    upsertForkOrigin(forkBoardId, {
      parentHash: hash,
      parentTitle: pattern.name,
      parentSource: pattern.source,
      parentCreatorName: pattern.creatorName,
      forkerName: currentProfileName,
      forkedPatternTitle: forkTitle,
    });
    trackRecentBoard(hash, forkTitle);
    setForkOrigins(getForkOrigins());
    setPatternMetrics(buildPatternMetrics(allPatterns));
    showToast(t('messages.patternForked', { name: patternName }));
  }

  function handleFavorite(patternName: string, patternGrid: LifeGrid): void {
    const hash = getPatternHash(patternGrid);
    const favored = toggleFavoriteBoard(hash, patternName, currentProfileName);
    setFavoriteHashes((current) => {
      const next = new Set(current);
      if (favored) {
        next.add(hash);
      } else {
        next.delete(hash);
      }
      return next;
    });
    setPatternMetrics(buildPatternMetrics(allPatterns));
    if (favored) {
      showToast(t('messages.patternFavorited', { name: patternName }), true);
      return;
    }

    showToast(t('messages.patternUnfavorited', { name: patternName }));
  }

  return {
    toastOpen,
    toastMessage,
    showFavoritesToastLink,
    closeToast,
    handleFork,
    handleFavorite,
  };
}
