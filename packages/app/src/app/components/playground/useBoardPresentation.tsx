import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PALETTE_ID, getPaletteById, type ColorPalette } from '@game-of-life/ui';
import { useTranslation } from 'react-i18next';
import type { Dispatch, SetStateAction } from 'react';
import type * as React from 'react';
import type { BoardNotifications } from './useBoardNotifications';
export interface BoardPresentation {
  activeDrawColor: string;
  isBirthDeathPreviewEnabled: boolean;
  setIsBirthDeathPreviewEnabled: Dispatch<SetStateAction<boolean>>;
  showSettingsPopover: (event: React.MouseEvent<HTMLSpanElement>, text: string) => void;
  hideSettingsPopover: () => void;
  isBoardMaximized: boolean;
  selectedPaletteId: string;
  selectedPalette: ColorPalette;
  handlePaletteChange: (paletteId: string) => void;
  handleDrawColorChange: (color: string) => void;
  handleCustomColorCommitted: (color: string) => void;
  handleBoardMouseMove: () => void;
  copyCurrentURL: () => void;
  toggleBoardMaximized: () => void;
  activeSidebarTab: 'patterns' | 'diagnostics';
  setActiveSidebarTab: Dispatch<SetStateAction<'patterns' | 'diagnostics'>>;
  cellDataCopied: boolean;
  copyCellData: (gridJSON: string) => void;
  settingsHoverPopover: { text: string; left: number; top: number } | null;
}

export function useBoardPresentation(input: {
  notifications: Pick<BoardNotifications, 'notify'>;
}): BoardPresentation {
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'patterns' | 'diagnostics'>(
    'diagnostics',
  );

  const [isBoardMaximized, setIsBoardMaximized] = useState(false);

  const [showMaximizedControls, setShowMaximizedControls] = useState(true);

  const [cellDataCopied, setCellDataCopied] = useState(false);

  const [isBirthDeathPreviewEnabled, setIsBirthDeathPreviewEnabled] = useState(true);

  const [settingsHoverPopover, setSettingsHoverPopover] = useState<null | {
    text: string;
    left: number;
    top: number;
  }>(null);

  const maximizeControlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cellDataCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [selectedPaletteId, setSelectedPaletteId] = useState(DEFAULT_PALETTE_ID);

  const [drawColor, setDrawColor] = useState(() => getPaletteById(DEFAULT_PALETTE_ID).liveCell);

  const selectedPalette = getPaletteById(selectedPaletteId);

  const activeDrawColor = drawColor;

  function handlePaletteChange(paletteId: string): void {
    console.info('Palette changed', paletteId);
    setSelectedPaletteId(paletteId);
    setDrawColor(getPaletteById(paletteId).liveCell);
  }

  function handleDrawColorChange(color: string): void {
    setDrawColor(color);
  }

  function handleCustomColorCommitted(color: string): void {
    notify(t('messages.customColorUpdated', { color }));
  }

  function showSettingsPopover(event: React.MouseEvent<HTMLSpanElement>, text: string): void {
    const iconBounds = event.currentTarget.getBoundingClientRect();
    setSettingsHoverPopover({
      text,
      left: iconBounds.right + 8,
      top: iconBounds.top + iconBounds.height / 2,
    });
  }

  function hideSettingsPopover(): void {
    setSettingsHoverPopover(null);
  }

  useEffect(() => {
    document.body.classList.toggle('gol-board-maximized', isBoardMaximized);

    return () => {
      document.body.classList.remove('gol-board-maximized');
    };
  }, [isBoardMaximized]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (maximizeControlsHideTimer.current) clearTimeout(maximizeControlsHideTimer.current);
      if (cellDataCopyTimer.current) clearTimeout(cellDataCopyTimer.current);
    };
  }, []);

  function copyCellData(gridJSON: string): void {
    navigator.clipboard.writeText(gridJSON).then(() => {
      if (!mountedRef.current) return;
      setCellDataCopied(true);
      if (cellDataCopyTimer.current) clearTimeout(cellDataCopyTimer.current);
      cellDataCopyTimer.current = setTimeout(() => setCellDataCopied(false), 1500);
    });
  }

  function scheduleMaximizedControlsHide(): void {
    if (maximizeControlsHideTimer.current) clearTimeout(maximizeControlsHideTimer.current);
    maximizeControlsHideTimer.current = setTimeout(() => {
      setShowMaximizedControls(false);
    }, 1600);
  }

  function handleBoardMouseMove(): void {
    if (!isBoardMaximized) return;
    if (!showMaximizedControls) {
      setShowMaximizedControls(true);
    }
    scheduleMaximizedControlsHide();
  }

  function copyCurrentURL(): void {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        notify(t('messages.urlCopied'));
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
        notify(t('messages.urlCopyFailed'));
      });
  }

  function toggleBoardMaximized(): void {
    setIsBoardMaximized((previous) => {
      const next = !previous;

      if (next) {
        setShowMaximizedControls(true);
        scheduleMaximizedControlsHide();
      } else if (maximizeControlsHideTimer.current) {
        clearTimeout(maximizeControlsHideTimer.current);
      }

      return next;
    });
  }
  return {
    activeDrawColor,
    isBirthDeathPreviewEnabled,
    setIsBirthDeathPreviewEnabled,
    showSettingsPopover,
    hideSettingsPopover,
    isBoardMaximized,
    selectedPaletteId,
    selectedPalette,
    handlePaletteChange,
    handleDrawColorChange,
    handleCustomColorCommitted,
    handleBoardMouseMove,
    copyCurrentURL,
    toggleBoardMaximized,
    activeSidebarTab,
    setActiveSidebarTab,
    cellDataCopied,
    copyCellData,
    settingsHoverPopover,
  };
}
