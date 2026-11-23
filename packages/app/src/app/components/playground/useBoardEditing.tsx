import { useRef, useState } from 'react';
import { LifeGrid } from '@game-of-life/core';
import {
  updateURLWithGrid,
  getSelectionGrid,
  getContiguousLiveRegionByColor,
} from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import { EditTool, CenterCoordinateRequest } from './playgroundTypes';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardPresentation } from './useBoardPresentation';
import type { BoardNotifications } from './useBoardNotifications';
export interface BoardEditing {
  activeEditTool: EditTool;
  clearSelectionGrid: () => void;
  captureUndoSnapshot: (grid: LifeGrid) => void;
  resetEditingHistory: () => void;
  undoBoardSnapshot: LifeGrid | null;
  selectedCellsGrid: LifeGrid | null;
  selectionStartCoordinate: string | null;
  selectionEndCoordinate: string | null;
  hoveredCoordinate: string | null;
  centerCoordinateRequest: CenterCoordinateRequest | null;
  handleHoverCoordinateChange: (coordinate: string | null) => void;
  handleEditToolChange: (tool: EditTool) => void;
  handleSelectionStart: (coordinate: string) => void;
  handleSelectionChange: (coordinate: string) => void;
  handleSelectionEnd: () => void;
  handleBoardEditStart: () => void;
  undoBoardChange: () => void;
  handleCellPaint: (coordinate: string, nextCellColor: string | null) => void;
  handleSelectionColorFill: () => void;
  selectionCount: number;
  handleCenterCoordinateRequest: (coordinate: string) => void;
}

export function useBoardEditing(input: {
  board: Pick<PlaygroundBoardState, 'isEditMode' | 'currentPattern' | 'game' | 'replacePattern'>;
  metadata: Pick<PlaygroundMetadata, 'isSystemPattern'>;
  playback: Pick<
    SimulationPlayback,
    'isGameRunning' | 'resetBoardStateOverlayState' | 'handleBoardExpansion'
  >;
  presentation: Pick<BoardPresentation, 'activeDrawColor'>;
  notifications: Pick<BoardNotifications, 'notify'>;
}): BoardEditing {
  const { isEditMode, currentPattern, game, replacePattern } = input.board;
  const { isSystemPattern } = input.metadata;
  const { isGameRunning, resetBoardStateOverlayState, handleBoardExpansion } = input.playback;
  const { activeDrawColor } = input.presentation;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [undoBoardSnapshot, setUndoBoardSnapshot] = useState<LifeGrid | null>(null);

  const [selectedCellsGrid, setSelectedCellsGrid] = useState<LifeGrid | null>(null);

  const [selectionStartCoordinate, setSelectionStartCoordinate] = useState<string | null>(null);

  const [selectionEndCoordinate, setSelectionEndCoordinate] = useState<string | null>(null);

  const selectionAnchorRef = useRef<string | null>(null);

  const [activeEditTool, setActiveEditTool] = useState<EditTool>('pencil');

  const [hoveredCoordinate, setHoveredCoordinate] = useState<string | null>(null);

  const [centerCoordinateRequest, setCenterCoordinateRequest] =
    useState<CenterCoordinateRequest | null>(null);

  function handleHoverCoordinateChange(coordinate: string | null): void {
    setHoveredCoordinate(coordinate);
  }

  function handleCenterCoordinateRequest(coordinate: string): void {
    setCenterCoordinateRequest((previous) => ({
      coordinate,
      requestKey: (previous?.requestKey ?? 0) + 1,
    }));
  }

  function handleEditToolChange(tool: EditTool): void {
    setActiveEditTool(tool);
    if (tool !== 'selection') {
      setSelectedCellsGrid(null);
      setSelectionStartCoordinate(null);
      setSelectionEndCoordinate(null);
      selectionAnchorRef.current = null;
    }
  }

  function clearSelectionGrid(): void {
    setSelectedCellsGrid(null);
    setSelectionStartCoordinate(null);
    setSelectionEndCoordinate(null);
    selectionAnchorRef.current = null;
  }

  function updateSelectionGrid(anchorCoordinate: string, focusCoordinate: string): void {
    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    setSelectedCellsGrid(getSelectionGrid(currentGrid, anchorCoordinate, focusCoordinate));
  }

  function handleSelectionStart(coordinate: string): void {
    selectionAnchorRef.current = coordinate;
    setSelectionStartCoordinate(coordinate);
    setSelectionEndCoordinate(coordinate);
    updateSelectionGrid(coordinate, coordinate);
  }

  function handleSelectionChange(coordinate: string): void {
    if (!selectionAnchorRef.current) return;
    setSelectionEndCoordinate(coordinate);
    updateSelectionGrid(selectionAnchorRef.current, coordinate);
  }

  function handleSelectionEnd(): void {
    if (!selectionAnchorRef.current) return;

    setSelectionEndCoordinate(selectionEndCoordinate ?? selectionAnchorRef.current);
    selectionAnchorRef.current = null;
  }

  function handleBoardEditStart(): void {
    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    setUndoBoardSnapshot({ ...currentGrid });
    clearSelectionGrid();
  }

  function undoBoardChange(): void {
    if (!undoBoardSnapshot) return;

    replacePattern(undoBoardSnapshot);
    updateURLWithGrid(undoBoardSnapshot);
    setUndoBoardSnapshot(null);
    clearSelectionGrid();
    resetBoardStateOverlayState();
    notify(t('messages.boardUndoApplied'));
  }

  function handleCellPaint(coordinate: string, nextCellColor: string | null): void {
    if (!isEditMode || isGameRunning || isSystemPattern) return;
    clearSelectionGrid();

    const currentGrid = game.getStatus();
    const newGrid = { ...currentGrid };

    if (nextCellColor) {
      newGrid[coordinate] = nextCellColor;
    } else {
      delete newGrid[coordinate];
    }

    handleBoardExpansion(currentGrid, newGrid);

    // Update the game with the new grid
    replacePattern(newGrid);

    // Update URL to allow sharing custom patterns
    updateURLWithGrid(newGrid);
  }

  function handleSelectionColorFill(): void {
    if (!isEditMode || isGameRunning || isSystemPattern) return;

    const currentGrid = game.getStatus();
    const selectedCoordinates = selectedCellsGrid ? Object.keys(selectedCellsGrid) : [];
    const fillCoordinates =
      selectedCoordinates.length > 0
        ? selectedCoordinates
        : hoveredCoordinate
          ? getContiguousLiveRegionByColor(currentGrid, hoveredCoordinate)
          : [];

    if (fillCoordinates.length === 0) {
      return;
    }

    const nextGrid = { ...currentGrid };

    for (const coordinate of fillCoordinates) {
      nextGrid[coordinate] = activeDrawColor;
    }

    setUndoBoardSnapshot({ ...currentGrid });
    handleBoardExpansion(currentGrid, nextGrid);

    replacePattern(nextGrid);
    updateURLWithGrid(nextGrid);

    if (selectedCoordinates.length > 0) {
      clearSelectionGrid();
      notify(t('messages.selectionColorFilled', { color: activeDrawColor }));
    } else {
      notify(t('messages.areaColorFilled', { color: activeDrawColor }));
    }
  }

  const selectionCount =
    selectionStartCoordinate && selectionEndCoordinate
      ? Object.keys(selectedCellsGrid ?? {}).length
      : 0;
  function captureUndoSnapshot(grid: LifeGrid): void {
    setUndoBoardSnapshot({ ...grid });
  }
  function resetEditingHistory(): void {
    setUndoBoardSnapshot(null);
    clearSelectionGrid();
  }

  return {
    activeEditTool,
    clearSelectionGrid,
    captureUndoSnapshot,
    resetEditingHistory,
    undoBoardSnapshot,
    selectedCellsGrid,
    selectionStartCoordinate,
    selectionEndCoordinate,
    hoveredCoordinate,
    centerCoordinateRequest,
    handleHoverCoordinateChange,
    handleEditToolChange,
    handleSelectionStart,
    handleSelectionChange,
    handleSelectionEnd,
    handleBoardEditStart,
    undoBoardChange,
    handleCellPaint,
    handleSelectionColorFill,
    selectionCount,
    handleCenterCoordinateRequest,
  };
}
