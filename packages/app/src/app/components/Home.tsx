import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Copy, GitFork, Pencil, Save, SaveAll, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, User } from 'lucide-react';
import Grid from "./Grid";
import GridControls from "./GridControls";
import PatternInput from "./PatternInput";
import PatternSelector from './PatternSelector';
import PatternPreview from './PatternPreview';
import RulesPanel from "./RulesPanel";
import { getGenerationSpeed } from '../util';
import { createLifeGrid, Game, rPentomino, LifeGrid, GameStats, GameRules, DEFAULT_RULES, patterns } from '@game-of-life/core';
import { encodeGridToBase64, getGridFromURL, updateURLWithGrid } from '../util/urlState';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import ThemeTabs from './ui/ThemeTabs';
import {
  ensureSeededSocialData,
  getFavoriteBoards,
  getForkOrigins,
  getForkOrigin,
  getStoredProfileUser,
  getSavedBoards,
  getSavedTemplateNames,
  hashToGrid,
  setSavedTemplateNames,
  toggleFavoriteBoard,
  upsertSavedBoard,
  upsertForkOrigin,
  trackRecentBoard,
} from '../util/browserStorage';

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;
const GENERATION_SPEED_MIN = 1;
const GENERATION_SPEED_MAX = 10;
const STABILITY_GENERATION_THRESHOLD = 20;


type PatternSource = 'system' | 'user';
type NameModalMode = 'rename' | 'fork';
type EditTool = 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
type StampRotation = 0 | 90 | 180 | 270;

interface PlayPatternMetadata {
  hash: string;
  name: string;
  category: string;
  source: PatternSource;
  creatorName?: string;
  favoriteCount: number;
  forkCount: number;
}

interface SeededPlayPatternMetadata {
  name: string;
  category: string;
  source: PatternSource;
  creatorName: string;
  favoriteCount: number;
  forkCount: number;
  grid: LifeGrid;
}

interface ParsedCoordinate {
  x: number;
  y: number;
}

const seededUserPatternMetadata: PlayPatternMetadata[] = ([
  {
    name: 'Signal Weave',
    category: 'User Creations',
    source: 'user',
    creatorName: 'James Nyeholt',
    favoriteCount: 21,
    forkCount: 8,
    grid: createLifeGrid({
      '-2,0': true,
      '-1,0': true,
      '0,0': true,
      '1,1': true,
      '2,2': true,
      '2,-2': true,
      '3,1': true,
      '3,-1': true,
      '4,0': true,
      '5,0': true,
    }),
  },
  {
    name: 'Twin Lantern',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Anika Shah',
    favoriteCount: 16,
    forkCount: 5,
    grid: createLifeGrid({
      '-3,-1': true,
      '-3,0': true,
      '-2,-2': true,
      '-2,1': true,
      '-1,-2': true,
      '-1,1': true,
      '1,-1': true,
      '1,0': true,
      '2,-2': true,
      '2,1': true,
      '3,-2': true,
      '3,1': true,
    }),
  },
  {
    name: 'Orbit Stack',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Leo Martinez',
    favoriteCount: 14,
    forkCount: 4,
    grid: createLifeGrid({
      '-2,-2': true,
      '-2,-1': true,
      '-1,-2': true,
      '-1,-1': true,
      '0,1': true,
      '1,2': true,
      '2,0': true,
      '2,1': true,
      '3,1': true,
      '4,2': true,
      '4,3': true,
      '5,2': true,
    }),
  },
] as SeededPlayPatternMetadata[]).map((entry) => {
  return {
    name: entry.name,
    category: entry.category,
    source: entry.source,
    creatorName: entry.creatorName,
    favoriteCount: entry.favoriteCount,
    forkCount: entry.forkCount,
    hash: encodeGridToBase64(entry.grid),
  };
});

const knownPatternMetadataByHash: Record<string, PlayPatternMetadata> = (() => {
  const map: Record<string, PlayPatternMetadata> = {};

  for (const pattern of patterns) {
    const hash = encodeGridToBase64(pattern.grid);
    map[hash] = {
      hash,
      name: pattern.name,
      category: pattern.category,
      source: 'system',
      favoriteCount: Math.max(4, Math.floor(Object.keys(pattern.grid).length / 2) + 6),
      forkCount: Math.max(2, Math.floor(Object.keys(pattern.grid).length / 3) + 3),
    };
  }

  for (const pattern of seededUserPatternMetadata) {
    map[pattern.hash] = {
      hash: pattern.hash,
      name: pattern.name,
      category: pattern.category,
      source: pattern.source,
      creatorName: pattern.creatorName,
      favoriteCount: pattern.favoriteCount,
      forkCount: pattern.forkCount,
    };
  }

  return map;
})();

function getGridSignature(grid: LifeGrid): string {
  const keys = Object.keys(grid).sort();
  return keys.map((key) => `${key}:${grid[key]}`).join('|');
}

function parseCoordinateKey(coordinate: string): ParsedCoordinate | null {
  const [xString, yString] = coordinate.split(',');
  const x = Number(xString);
  const y = Number(yString);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return { x, y };
}

function getGridBounds(grid: LifeGrid): { minX: number; maxX: number; minY: number; maxY: number } | null {
  const coordinates = Object.keys(grid).map(parseCoordinateKey).filter((entry): entry is ParsedCoordinate => entry !== null);
  if (coordinates.length === 0) return null;

  return coordinates.reduce(
    (bounds, coordinate) => ({
      minX: Math.min(bounds.minX, coordinate.x),
      maxX: Math.max(bounds.maxX, coordinate.x),
      minY: Math.min(bounds.minY, coordinate.y),
      maxY: Math.max(bounds.maxY, coordinate.y),
    }),
    {
      minX: coordinates[0].x,
      maxX: coordinates[0].x,
      minY: coordinates[0].y,
      maxY: coordinates[0].y,
    },
  );
}

function getSelectionGrid(grid: LifeGrid, startCoordinate: string, endCoordinate: string): LifeGrid {
  const start = parseCoordinateKey(startCoordinate);
  const end = parseCoordinateKey(endCoordinate);

  if (!start || !end) {
    return {};
  }

  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  const selectedGrid: LifeGrid = {} as LifeGrid;

  for (const [coordinate, cellColor] of Object.entries(grid)) {
    if (!cellColor) continue;

    const parsed = parseCoordinateKey(coordinate);
    if (!parsed) continue;

    if (parsed.x >= minX && parsed.x <= maxX && parsed.y >= minY && parsed.y <= maxY) {
      selectedGrid[coordinate] = cellColor;
    }
  }

  return selectedGrid;
}

function getLiveCellCount(grid: LifeGrid): number {
  return Object.keys(grid).length;
}

function clearBoardStateOverlaySuppressionIfBoardExpanded(previousGrid: LifeGrid, nextGrid: LifeGrid, suppressRef: { current: boolean }) {
  if (getLiveCellCount(nextGrid) > getLiveCellCount(previousGrid)) {
    suppressRef.current = false;
  }
}

function mergeGridAtCoordinate(baseGrid: LifeGrid, additionGrid: LifeGrid, targetCoordinate: string): LifeGrid {
  const target = parseCoordinateKey(targetCoordinate);
  const bounds = getGridBounds(additionGrid);

  if (!target || !bounds) {
    return baseGrid;
  }

  const anchorX = Math.floor((bounds.minX + bounds.maxX) / 2);
  const anchorY = Math.floor((bounds.minY + bounds.maxY) / 2);
  const deltaX = target.x - anchorX;
  const deltaY = target.y - anchorY;
  const nextGrid = { ...baseGrid };

  for (const key of Object.keys(additionGrid)) {
    const parsed = parseCoordinateKey(key);
    if (!parsed) continue;

    nextGrid[`${parsed.x + deltaX},${parsed.y + deltaY}`] = additionGrid[key];
  }

  return nextGrid;
}

function tintGridCells(grid: LifeGrid, color: string): LifeGrid {
  const tintedGrid: LifeGrid = {} as LifeGrid;

  for (const coordinate of Object.keys(grid)) {
    tintedGrid[coordinate] = color;
  }

  return tintedGrid;
}

function rotateGridAroundBoundsCenter(grid: LifeGrid, rotation: StampRotation): LifeGrid {
  if (rotation === 0) {
    return grid;
  }

  const bounds = getGridBounds(grid);
  if (!bounds) {
    return grid;
  }

  const anchorX = Math.floor((bounds.minX + bounds.maxX) / 2);
  const anchorY = Math.floor((bounds.minY + bounds.maxY) / 2);
  const quarterTurns = rotation / 90;
  const rotatedGrid: LifeGrid = {} as LifeGrid;

  for (const coordinate of Object.keys(grid)) {
    const parsed = parseCoordinateKey(coordinate);
    if (!parsed) continue;

    const dx = parsed.x - anchorX;
    const dy = parsed.y - anchorY;
    let rotatedX = dx;
    let rotatedY = dy;

    if (quarterTurns === 1) {
      rotatedX = dy;
      rotatedY = -dx;
    } else if (quarterTurns === 2) {
      rotatedX = -dx;
      rotatedY = -dy;
    } else if (quarterTurns === 3) {
      rotatedX = -dy;
      rotatedY = dx;
    }

    const nextX = anchorX + rotatedX;
    const nextY = anchorY + rotatedY;
    rotatedGrid[`${nextX},${nextY}`] = grid[coordinate];
  }

  return rotatedGrid;
}

function getPatternHashFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('pattern');
}

function getBoardIdFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('board');
}

function getEditModeFromURL(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'edit';
}

function isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select', 'button'].includes(tagName);
}

function clampGenerationSpeed(value: number): number {
  return Math.min(GENERATION_SPEED_MAX, Math.max(GENERATION_SPEED_MIN, value));
}

function rotateStampRotationClockwise(rotation: StampRotation): StampRotation {
  if (rotation === 0) return 90;
  if (rotation === 90) return 180;
  if (rotation === 180) return 270;
  return 0;
}

function rotateStampRotationCounterClockwise(rotation: StampRotation): StampRotation {
  if (rotation === 0) return 270;
  if (rotation === 270) return 180;
  if (rotation === 180) return 90;
  return 0;
}

function toCreatorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function Home() {
  const navigate = useNavigate();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'patterns' | 'diagnostics' | 'info'>('diagnostics');
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(5);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(() => getEditModeFromURL());
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [isDraftSaveConfirmModalOpen, setIsDraftSaveConfirmModalOpen] = useState(false);
  const [draftSaveName, setDraftSaveName] = useState('');
  const [draftSaveCategory, setDraftSaveCategory] = useState('');
  const [draftSaveDescription, setDraftSaveDescription] = useState('');
  const [draftSaveVisibility, setDraftSaveVisibility] = useState<'public' | 'private'>('public');
  const [patternNameDraft, setPatternNameDraft] = useState('');
  const [nameModalMode, setNameModalMode] = useState<NameModalMode>('rename');
  const [isBoardMaximized, setIsBoardMaximized] = useState(false);
  const [showMaximizedControls, setShowMaximizedControls] = useState(true);
  const [cellDataCopied, setCellDataCopied] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<LifeGrid>(() => {
    // Check URL for pattern on initial load
    const urlPattern = getGridFromURL();
    return urlPattern || baseGame;
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [undoBoardSnapshot, setUndoBoardSnapshot] = useState<LifeGrid | null>(null);
  const [selectedCellsGrid, setSelectedCellsGrid] = useState<LifeGrid | null>(null);
  const [selectionStartCoordinate, setSelectionStartCoordinate] = useState<string | null>(null);
  const [selectionEndCoordinate, setSelectionEndCoordinate] = useState<string | null>(null);
  const [isStabilityOverlayEnabled, setIsStabilityOverlayEnabled] = useState(true);
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maximizeControlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionAnchorRef = useRef<string | null>(null);
  const suppressBoardStateOverlayRef = useRef(false);
  const liveCellStabilityTracker = useRef<{ lastLiveCells: number | null; streak: number }>({ lastLiveCells: null, streak: 0 });
  const [stats, setStats] = useState<GameStats>({ liveCells: 0, births: 0, deaths: 0 });
  const [boardStateOverlay, setBoardStateOverlay] = useState<'stability' | 'gameOver' | null>(null);
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [selectedPaletteId, setSelectedPaletteId] = useState(DEFAULT_PALETTE_ID);
  const [drawColor, setDrawColor] = useState(() => getPaletteById(DEFAULT_PALETTE_ID).liveCell);
  const [activeEditTool, setActiveEditTool] = useState<EditTool>('pencil');
  const [stampPattern, setStampPattern] = useState<LifeGrid | null>(null);
  const [stampRotation, setStampRotation] = useState<StampRotation>(0);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<string | null>(null);
  const [contextInsertCoordinate, setContextInsertCoordinate] = useState<string | null>(null);
  const [savedTemplateNames, setSavedTemplateNamesState] = useState<Record<string, string>>(() => getSavedTemplateNames());
  const [activePopularityModal, setActivePopularityModal] = useState<'stars' | 'forks' | null>(null);
  const selectedPalette = getPaletteById(selectedPaletteId);
  const rotatedStampPattern = stampPattern ? rotateGridAroundBoundsCenter(stampPattern, stampRotation) : null;
  const activeDrawColor = drawColor;
  const { t } = useTranslation();
  const stampPatternName = stampPattern
    ? patterns.find((pattern) => getGridSignature(pattern.grid) === getGridSignature(stampPattern))?.name ?? t('patterns.custom')
    : '';
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
  const savedBoardsByBoardId = savedBoards.reduce<Record<string, ReturnType<typeof getSavedBoards>[number]>>((acc, entry) => {
    acc[entry.boardId ?? entry.hash] = entry;
    return acc;
  }, {});
  const savedBoardForCurrent = savedBoardsByBoardId[effectivePatternHash];
  const savedBoardCategory = savedBoardForCurrent?.category?.trim() || null;
  const savedBoardDescription = savedBoardForCurrent?.description?.trim() || null;
  const savedBoardVisibility = savedBoardForCurrent?.visibility ?? 'private';
  const currentPatternMetadata = activeForkRecord
    ? {
        hash: activeForkRecord.hash,
        name:
          getSavedTemplateNames()[activeForkRecord.hash] ||
          activeForkRecord.forkedPatternTitle ||
          `${activeForkRecord.parentTitle} (${t('playground.forkSuffix')})`,
        category: knownPatternMetadataByHash[activeForkRecord.parentHash]?.category ?? t('playground.categoryUnknown'),
        source: 'user' as const,
        creatorName: activeForkRecord.forkerName || storedProfileName,
        favoriteCount: 0,
        forkCount: getForkOrigins().filter((entry) => entry.parentHash === activeForkRecord.hash).length,
      }
    : knownPatternMetadataByHash[effectivePatternHash];
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
  const forkOrigin = activeForkRecord ?? getForkOrigin(effectivePatternHash);
  const currentGridSignature = getGridSignature(currentPattern);
  const presetTitle = presetTitleBySignature[currentGridSignature];
  const savedTitle = savedTemplateNames[effectivePatternHash];
  const isUnsavedDraftBoard = !currentBoardId && !savedTitle;
  const emptyBoardHash = encodeGridToBase64({});
  const isUnsavedEmptyBoard = isUnsavedDraftBoard && currentGridHash === emptyBoardHash && Object.keys(currentPattern).length === 0;
  const todayLabel = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date());
  const unsavedBoardDefaultName = `${storedProfileName}'s New Game - ${todayLabel}`;
  const headerTitle = isUnsavedEmptyBoard
    ? unsavedBoardDefaultName
    : savedTitle || currentPatternMetadata?.name || presetTitle || unsavedBoardDefaultName;
  const uncategorizedCategory = t('playground.categoryUncategorized');
  const supportedDraftCategories = Array.from(
    new Set(Object.values(knownPatternMetadataByHash).map((pattern) => pattern.category).filter((category) => category.trim().length > 0)),
  ).sort((left, right) => left.localeCompare(right));
  const draftCategoryOptions = [...supportedDraftCategories, uncategorizedCategory];
  const patternCategoryLabel = isUnsavedDraftBoard ? null : (savedBoardCategory || currentPatternMetadata?.category || t('playground.categoryUnknown'));
  const patternCreatorLabel = isUnsavedDraftBoard
    ? null
    : currentPatternMetadata?.source === 'system'
      ? t('patternSource.system')
      : currentPatternMetadata?.creatorName ?? t('patternSource.user');
  const authorProfileHref = isUnsavedDraftBoard
    ? null
    : currentPatternMetadata?.source === 'system'
      ? '/profile?creator=system'
      : `/profile?creator=${encodeURIComponent(toCreatorSlug(currentPatternMetadata?.creatorName ?? 'user'))}`;
  const categoryExploreHref = patternCategoryLabel ? `/explore?category=${encodeURIComponent(patternCategoryLabel)}` : null;
  const infoDescriptionBase = currentPatternMetadata?.source === 'system' && patternCategoryLabel
    ? t('playground.infoDescriptionSystem', { category: patternCategoryLabel })
    : currentPatternMetadata?.creatorName && patternCategoryLabel && patternCreatorLabel
      ? t('playground.infoDescriptionUser', { category: patternCategoryLabel, creator: patternCreatorLabel })
      : '';
  const infoDescription = !isUnsavedDraftBoard && infoDescriptionBase
    ? forkOrigin
      ? `${infoDescriptionBase} ${t('playground.infoDescriptionForked', { name: forkOrigin.parentTitle })}`
      : infoDescriptionBase
    : '';
  const effectiveDescription = !isUnsavedDraftBoard ? (savedBoardDescription || infoDescription) : '';
  const visibilityLabel = savedBoardVisibility === 'public' ? t('playground.visibilityPublic') : t('playground.visibilityPrivate');
  const favoriteRecordsForPattern = isUnsavedDraftBoard ? [] : getFavoriteBoards().filter((entry) => entry.hash === effectivePatternHash);
  const patternStars = favoriteRecordsForPattern.length;
  const patternForks = isUnsavedDraftBoard ? 0 : getForkOrigins().filter((entry) => entry.parentHash === effectivePatternHash).length;
  const isStarredByCurrentUser = favoriteRecordsForPattern.some((entry) => (entry.actorName || storedProfileName) === storedProfileName);
  const starredByUsers = getFavoriteBoards()
    .filter((entry) => entry.hash === effectivePatternHash)
    .map((entry) => entry.actorName || storedProfileName);

  const forkOrigins = getForkOrigins().filter((entry) => entry.parentHash === effectivePatternHash);
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
      stars: getFavoriteBoards().filter((favoriteEntry) => favoriteEntry.hash === entry.hash).length,
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

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization')
      game = new Game(currentPattern, rules)
      setBoardInitialization(false);
      setGeneration(0);
      setStats(game.getStats());
    }
  }, [boardNeedsInitialization, currentPattern, rules]);

  useEffect(() => {
    if (boardNeedsInitialization) {
      liveCellStabilityTracker.current = { lastLiveCells: null, streak: 0 };
      setBoardStateOverlay(null);
    }
  }, [boardNeedsInitialization]);

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
        stopGame(true);
      }
      if (boardStateOverlay !== 'gameOver') {
        setBoardStateOverlay('gameOver');
      }
      return;
    }

    if (tracker.streak >= STABILITY_GENERATION_THRESHOLD && isStabilityOverlayEnabled) {
      if (isGameRunning) {
        stopGame(true);
      }
      if (boardStateOverlay !== 'stability') {
        setBoardStateOverlay('stability');
      }
    }
  }, [generation, stats.liveCells, isGameRunning, boardStateOverlay, isStabilityOverlayEnabled]);

  function runGameInterval(speed = generationSpeed) {
    intervalID = setInterval(() => {
      game.next();
      setGeneration(game.getGenerations())
      setStats(game.getStats());
    }, getGenerationSpeed(speed))
  }

  function stopGame(updateUrl = true) {
    clearInterval(intervalID);
    setIsGameRunning(false);

    if (updateUrl) {
      const currentGrid = game.getStatus();
      updateURLWithGrid(currentGrid);
    }
  }

  function resetBoardStateOverlayState() {
    suppressBoardStateOverlayRef.current = false;
    setBoardStateOverlay(null);
  }

  function returnToEditModeFromBoardState() {
    resetBoardStateOverlayState();
    enterEditMode();
  }

  function continuePlayingFromBoardState() {
    setIsStabilityOverlayEnabled(false);
    suppressBoardStateOverlayRef.current = true;
    setBoardStateOverlay(null);
    liveCellStabilityTracker.current = { lastLiveCells: stats.liveCells, streak: 0 };

    if (!isGameRunning) {
      runGameInterval();
      setIsGameRunning(true);
      setSnackbarMessage(t('messages.simulationStarted'));
      setSnackbarOpen(true);
    }
  }

  function enterPlayMode() {
    if (!isEditMode) return;

    setIsEditMode(false);
    clearSelectionGrid();
    setSnackbarMessage(t('messages.playModeEntered'));
    setSnackbarOpen(true);
  }

  function enterEditMode() {
    if (isSystemPattern) {
      setSnackbarMessage(t('playground.systemReadonlyHint'));
      setSnackbarOpen(true);
      return;
    }

    if (isGameRunning) {
      stopGame(false);
    }

    setIsEditMode(true);
    setSnackbarMessage(t('messages.editModeEntered'));
    setSnackbarOpen(true);
  }

  function toggleGame() {
    if (isEditMode) {
      setSnackbarMessage(t('messages.enterPlayModeToRun'));
      setSnackbarOpen(true);
      return;
    }

    if (isGameRunning) {
      console.info("Pausing game.");
      stopGame(true);
      setSnackbarMessage(t('messages.simulationPaused'));
      setSnackbarOpen(true);
    } else {
      console.info("Starting game.");
      runGameInterval();
      setIsGameRunning(true);
      setSnackbarMessage(t('messages.simulationStarted'));
      setSnackbarOpen(true);
    }
  }

  function handleHoverCoordinateChange(coordinate: string | null) {
    setHoveredCoordinate(coordinate);
  }

  function handleContextCoordinateRequest(coordinate: string) {
    if (!isEditMode) {
      setSnackbarMessage(t('messages.enterEditModeToInsertPattern'));
      setSnackbarOpen(true);
      return;
    }

    if (isGameRunning) {
      setSnackbarMessage(t('messages.pauseToInsertPattern'));
      setSnackbarOpen(true);
      return;
    }

    if (isSystemPattern) {
      setSnackbarMessage(t('playground.systemReadonlyHint'));
      setSnackbarOpen(true);
      return;
    }

    setContextInsertCoordinate(coordinate);
  }

  function nextGeneration(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.info('Next generation pushed')
    game.next();
    setGeneration(game.getGenerations())
    setStats(game.getStats());
  }

  function updateGenerationSpeed(value: number) {
    const nextSpeed = clampGenerationSpeed(value);
    console.info('Generation Speed updated', nextSpeed)

    setGenerationSpeed(nextSpeed)

    if (isGameRunning) {
      clearInterval(intervalID)
      runGameInterval(nextSpeed);
    }
  }

  function resetBoard() {
    console.info("Reset board pushed.");
    setUndoBoardSnapshot(null);
    setSelectedCellsGrid(null);
    setSelectionStartCoordinate(null);
    setSelectionEndCoordinate(null);
    selectionAnchorRef.current = null;
    suppressBoardStateOverlayRef.current = false;
    setBoardInitialization(true);
  }

  function requestResetBoard() {
    setIsResetModalOpen(true);
  }

  function confirmResetBoard() {
    resetBoard();
    setIsResetModalOpen(false);
  }

  function cancelResetBoard() {
    setIsResetModalOpen(false);
  }

  function loadCustomPattern(grid: LifeGrid) {
    console.info("Loading custom pattern", grid);
    setUndoBoardSnapshot(null);
    setSelectedCellsGrid(null);
    setSelectionStartCoordinate(null);
    setSelectionEndCoordinate(null);
    selectionAnchorRef.current = null;
    suppressBoardStateOverlayRef.current = false;
    setCurrentPattern(grid);
    setBoardInitialization(true);
    
    // Update URL when pattern is selected
    updateURLWithGrid(grid);
  }

  function handlePatternInputLoad(grid: LifeGrid) {
    if (isEditMode && activeEditTool === 'stamp') {
      setStampPattern(grid);
      setSnackbarMessage(t('messages.stampPatternSelected'));
      setSnackbarOpen(true);
      return;
    }

    loadCustomPattern(grid);
  }

  function handleStampPatternSelect(grid: LifeGrid) {
    setStampPattern(grid);
    setSnackbarMessage(t('messages.stampPatternSelected'));
    setSnackbarOpen(true);
  }

  function closeInsertPatternModal() {
    setContextInsertCoordinate(null);
  }

  function handleInsertSystemPattern(patternGrid: LifeGrid) {
    if (!contextInsertCoordinate) {
      closeInsertPatternModal();
      return;
    }

    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    const nextGrid = mergeGridAtCoordinate(currentGrid, patternGrid, contextInsertCoordinate);

    setUndoBoardSnapshot({ ...currentGrid });
    setSelectedCellsGrid(null);
    setSelectionStartCoordinate(null);
    setSelectionEndCoordinate(null);
    selectionAnchorRef.current = null;
    suppressBoardStateOverlayRef.current = false;
    setCurrentPattern(nextGrid);
    setBoardInitialization(true);
    updateURLWithGrid(nextGrid);
    setSnackbarMessage(t('messages.systemPatternInserted'));
    setSnackbarOpen(true);
    closeInsertPatternModal();
  }

  function handleRulesChange(newRules: GameRules) {
    console.info("Rules updated", newRules);
    setRules(newRules);
    if (game.setRules) {
      game.setRules(newRules);
    }
  }

  function handlePaletteChange(paletteId: string) {
    console.info("Palette changed", paletteId);
    setSelectedPaletteId(paletteId);
    setDrawColor(getPaletteById(paletteId).liveCell);
  }

  function handleDrawColorChange(color: string) {
    setDrawColor(color);
  }

  function handleCustomColorCommitted(color: string) {
    setSnackbarMessage(t('messages.customColorUpdated', { color }));
    setSnackbarOpen(true);
  }

  function handleEditToolChange(tool: EditTool) {
    setActiveEditTool(tool);
    if (tool !== 'selection') {
      setSelectedCellsGrid(null);
      setSelectionStartCoordinate(null);
      setSelectionEndCoordinate(null);
      selectionAnchorRef.current = null;
    }
  }

  function handleStampPatternAtCoordinate(coordinate: string) {
    if (!rotatedStampPattern) {
      setSnackbarMessage(t('messages.selectStampPatternFirst'));
      setSnackbarOpen(true);
      return;
    }

    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    const coloredStampPattern = tintGridCells(rotatedStampPattern, activeDrawColor);
    const nextGrid = mergeGridAtCoordinate(currentGrid, coloredStampPattern, coordinate);

    clearBoardStateOverlaySuppressionIfBoardExpanded(currentGrid, nextGrid, suppressBoardStateOverlayRef);
    if (!suppressBoardStateOverlayRef.current) {
      setBoardStateOverlay(null);
    }

    clearSelectionGrid();
    setCurrentPattern(nextGrid);
    setBoardInitialization(true);
    updateURLWithGrid(nextGrid);
    setSnackbarMessage(t('messages.stampPatternApplied'));
    setSnackbarOpen(true);
  }

  function rotateStampPattern() {
    setStampRotation((previous) => rotateStampRotationClockwise(previous));
  }

  function rotateStampPatternCounterClockwise() {
    setStampRotation((previous) => rotateStampRotationCounterClockwise(previous));
  }

  function clearSelectionGrid() {
    setSelectedCellsGrid(null);
    setSelectionStartCoordinate(null);
    setSelectionEndCoordinate(null);
    selectionAnchorRef.current = null;
  }

  function updateSelectionGrid(anchorCoordinate: string, focusCoordinate: string) {
    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    setSelectedCellsGrid(getSelectionGrid(currentGrid, anchorCoordinate, focusCoordinate));
  }

  function handleSelectionStart(coordinate: string) {
    selectionAnchorRef.current = coordinate;
    setSelectionStartCoordinate(coordinate);
    setSelectionEndCoordinate(coordinate);
    updateSelectionGrid(coordinate, coordinate);
  }

  function handleSelectionChange(coordinate: string) {
    if (!selectionAnchorRef.current) return;
    setSelectionEndCoordinate(coordinate);
    updateSelectionGrid(selectionAnchorRef.current, coordinate);
  }

  function handleSelectionEnd() {
    if (!selectionAnchorRef.current) return;

    setSelectionEndCoordinate(selectionEndCoordinate ?? selectionAnchorRef.current);
    selectionAnchorRef.current = null;
  }

  function handleBoardEditStart() {
    const currentGrid = game.getStatus ? game.getStatus() : currentPattern;
    setUndoBoardSnapshot({ ...currentGrid });
    clearSelectionGrid();
  }

  function undoBoardChange() {
    if (!undoBoardSnapshot) return;

    setCurrentPattern(undoBoardSnapshot);
    setBoardInitialization(true);
    updateURLWithGrid(undoBoardSnapshot);
    setUndoBoardSnapshot(null);
    clearSelectionGrid();
    suppressBoardStateOverlayRef.current = false;
    setSnackbarMessage(t('messages.boardUndoApplied'));
    setSnackbarOpen(true);
  }

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
        stopGame(true);
      }
      if (!suppressBoardStateOverlayRef.current && boardStateOverlay !== 'gameOver') {
        setBoardStateOverlay('gameOver');
      }
      return;
    }

    if (tracker.streak >= STABILITY_GENERATION_THRESHOLD && isStabilityOverlayEnabled) {
      if (isGameRunning) {
        stopGame(true);
      }
      if (!suppressBoardStateOverlayRef.current && boardStateOverlay === null) {
        setBoardStateOverlay('stability');
      }
    }
  }, [generation, stats.liveCells, isGameRunning, isEditMode, boardStateOverlay, isStabilityOverlayEnabled]);

  function handleSnackbarClose() {
    setSnackbarOpen(false);
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
  }

  function handleStabilityOverlayToggle(enabled: boolean) {
    setIsStabilityOverlayEnabled(enabled);

    if (!enabled) {
      setBoardStateOverlay(null);
      return;
    }

    suppressBoardStateOverlayRef.current = false;
  }

  useEffect(() => {
    if (snackbarOpen) {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
      toastHideTimer.current = setTimeout(() => setSnackbarOpen(false), 3000);
    }
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, [snackbarOpen, snackbarMessage]);

  useEffect(() => {
    document.body.classList.toggle('gol-board-maximized', isBoardMaximized);

    return () => {
      document.body.classList.remove('gol-board-maximized');
    };
  }, [isBoardMaximized]);

  useEffect(() => {
    return () => {
      if (maximizeControlsHideTimer.current) clearTimeout(maximizeControlsHideTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isInteractiveKeyboardTarget(event.target)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        if (isEditMode) {
          setSnackbarMessage(t('messages.enterPlayModeToRun'));
          setSnackbarOpen(true);
          return;
        }

        toggleGame();
        return;
      }

      const isIncreaseKey = event.code === 'NumpadAdd' || (event.code === 'Equal' && event.shiftKey) || event.key.toLowerCase() === 'x';
      const isDecreaseKey = event.code === 'Minus' || event.code === 'NumpadSubtract' || event.key.toLowerCase() === 'z';

      if (isEditMode && activeEditTool === 'stamp' && stampPattern) {
        if (event.key === ']') {
          event.preventDefault();
          rotateStampPattern();
          setSnackbarMessage(t('messages.stampRotationUpdated', { degrees: rotateStampRotationClockwise(stampRotation) }));
          setSnackbarOpen(true);
          return;
        }

        if (event.key === '[') {
          event.preventDefault();
          rotateStampPatternCounterClockwise();
          setSnackbarMessage(t('messages.stampRotationUpdated', { degrees: rotateStampRotationCounterClockwise(stampRotation) }));
          setSnackbarOpen(true);
          return;
        }
      }

      if (!isIncreaseKey && !isDecreaseKey) return;

      event.preventDefault();
      if (isEditMode) {
        setSnackbarMessage(t('messages.enterPlayModeToRun'));
        setSnackbarOpen(true);
        return;
      }

      const nextSpeed = clampGenerationSpeed(generationSpeed + (isIncreaseKey ? 1 : -1));
      if (nextSpeed === generationSpeed) return;

      updateGenerationSpeed(nextSpeed);
      setSnackbarMessage(t('messages.generationSpeedChanged', { level: nextSpeed }));
      setSnackbarOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeEditTool, generationSpeed, isEditMode, isGameRunning, isSystemPattern, stampPattern, stampRotation, t]);

  function scheduleMaximizedControlsHide() {
    if (maximizeControlsHideTimer.current) clearTimeout(maximizeControlsHideTimer.current);
    maximizeControlsHideTimer.current = setTimeout(() => {
      setShowMaximizedControls(false);
    }, 1600);
  }

  function handleBoardMouseMove() {
    if (!isBoardMaximized) return;
    if (!showMaximizedControls) {
      setShowMaximizedControls(true);
    }
    scheduleMaximizedControlsHide();
  }

  function copyCurrentURL() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage(t('messages.urlCopied'));
      setSnackbarOpen(true);
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setSnackbarMessage(t('messages.urlCopyFailed'));
      setSnackbarOpen(true);
    });
  }

  function persistSavedTemplateNames(next: Record<string, string>) {
    setSavedTemplateNamesState(next);
    setSavedTemplateNames(next);
  }

  function copyPatternHash() {
    navigator.clipboard.writeText(effectivePatternHash).then(() => {
      setSnackbarMessage(t('messages.hashCopied'));
      setSnackbarOpen(true);
    }).catch((err) => {
      console.error('Failed to copy hash:', err);
      setSnackbarMessage(t('messages.hashCopyFailed'));
      setSnackbarOpen(true);
    });
  }

  function saveTemplate(
    saveAs: boolean,
    options?: {
      skipPrompt?: boolean;
      category?: string;
      title?: string;
      description?: string;
      visibility?: 'public' | 'private';
    },
  ) {
    const hash = effectivePatternHash;
    if (!hash) return;

    let nextTitle = options?.title?.trim() || savedTemplateNames[hash] || presetTitle || unsavedBoardDefaultName;

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
    upsertSavedBoard(currentGridHash, nextTitle, hash, options?.category, options?.description, options?.visibility);
    trackRecentBoard(currentGridHash, nextTitle, hash);
    setSnackbarMessage(t('messages.templateSaved'));
    setSnackbarOpen(true);
  }

  function openDraftSaveConfirmModal() {
    if (!isUnsavedDraftBoard) return;
    setDraftSaveName(headerTitle);
    setDraftSaveCategory(uncategorizedCategory);
    setDraftSaveDescription('');
    setDraftSaveVisibility('public');
    setIsDraftSaveConfirmModalOpen(true);
  }

  function closeDraftSaveConfirmModal() {
    setIsDraftSaveConfirmModalOpen(false);
    setDraftSaveName('');
    setDraftSaveCategory(uncategorizedCategory);
    setDraftSaveDescription('');
    setDraftSaveVisibility('public');
  }

  function confirmDraftSave() {
    const normalizedName = draftSaveName.trim();
    const normalizedCategory = draftSaveCategory.trim();
    if (!normalizedName || !normalizedCategory || !draftCategoryOptions.includes(normalizedCategory)) return;
    saveTemplate(false, {
      skipPrompt: true,
      title: normalizedName,
      category: normalizedCategory,
      description: draftSaveDescription.trim(),
      visibility: draftSaveVisibility,
    });
    closeDraftSaveConfirmModal();
  }

  function openEditNameModal() {
    if (isSystemPattern) {
      return;
    }

    setNameModalMode('rename');
    setPatternNameDraft(headerTitle);
    setIsEditNameModalOpen(true);
  }

  function runSaveMenuAction(event: React.MouseEvent<HTMLButtonElement>, action: () => void) {
    const menu = event.currentTarget.closest('details') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
    action();
  }

  function openForkNameModal() {
    setNameModalMode('fork');
    setPatternNameDraft(`${headerTitle} (${t('playground.forkSuffix')})`);
    setActivePopularityModal(null);
    setIsEditNameModalOpen(true);
  }

  function closeEditNameModal() {
    setIsEditNameModalOpen(false);
  }

  function confirmEditNameModal() {
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
      upsertSavedBoard(currentGridHash, trimmed, forkBoardId);
      upsertForkOrigin(forkBoardId, {
        parentHash: effectivePatternHash,
        parentTitle: headerTitle,
        parentSource: (currentPatternMetadata?.source ?? 'user') as PatternSource,
        parentCreatorName: currentPatternMetadata?.creatorName,
        forkerName: storedProfileName,
        forkedPatternTitle: trimmed,
      });
      trackRecentBoard(currentGridHash, trimmed, forkBoardId);
      setSnackbarMessage(t('messages.patternForked', { name: headerTitle }));
      setSnackbarOpen(true);
      closeEditNameModal();
      navigate(`/play?pattern=${encodeURIComponent(currentGridHash)}&board=${encodeURIComponent(forkBoardId)}`);
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
    upsertSavedBoard(currentGridHash, trimmed, hash);
    trackRecentBoard(currentGridHash, trimmed, hash);
    setSnackbarMessage(t('messages.templateSaved'));
    setSnackbarOpen(true);
    closeEditNameModal();
  }

  function toggleCurrentPatternStar() {
    const hash = effectivePatternHash;
    if (!hash) return;

    const nextStarred = toggleFavoriteBoard(hash, headerTitle, storedProfileName);
    setSnackbarMessage(
      t(nextStarred ? 'messages.patternFavorited' : 'messages.patternUnfavorited', { name: headerTitle }),
    );
    setSnackbarOpen(true);
  }

  useEffect(() => {
    if (!effectivePatternHash) return;
    trackRecentBoard(currentGridHash, headerTitle, effectivePatternHash);
  }, [currentGridHash, effectivePatternHash, headerTitle]);

  useEffect(() => {
    if (!isSystemPattern) return;
    if (isEditMode) {
      setIsEditMode(false);
    }
  }, [isEditMode, isSystemPattern]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('gol-play-mode-changed', {
        detail: { mode: isEditMode ? 'edit' : 'play' },
      }),
    );
  }, [isEditMode]);

  function toggleBoardMaximized() {
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

  function handleCellPaint(coordinate: string, nextCellColor: string | null) {
    if (!isEditMode || isGameRunning || isSystemPattern) return;
    clearSelectionGrid();
    
    const currentGrid = game.getStatus();
    const newGrid = { ...currentGrid };
    
    if (nextCellColor) {
      newGrid[coordinate] = nextCellColor;
    } else {
      delete newGrid[coordinate];
    }

    clearBoardStateOverlaySuppressionIfBoardExpanded(currentGrid, newGrid, suppressBoardStateOverlayRef);
    if (!suppressBoardStateOverlayRef.current) {
      setBoardStateOverlay(null);
    }
    
    // Update the game with the new grid
    setCurrentPattern(newGrid);
    setBoardInitialization(true);
    
    // Update URL to allow sharing custom patterns
    updateURLWithGrid(newGrid);
  }

  const gameStatus = game.getStatus ? game.getStatus() : {};
  const boardModified = getGridSignature(gameStatus) !== getGridSignature(currentPattern);
  const canSaveTemplate = !isSystemPattern && generation > 0 && boardModified;
  const gridJSON = JSON.stringify(gameStatus, null, 2);
  const liveColorCounts = Object.values(gameStatus).reduce<Record<string, number>>((accumulator, cellColor) => {
    if (typeof cellColor !== 'string') return accumulator;
    const normalized = cellColor.toLowerCase();
    accumulator[normalized] = (accumulator[normalized] || 0) + 1;
    return accumulator;
  }, {});
  const liveColorLeaderboard = Object.entries(liveColorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((left, right) => right.count - left.count);
  const maxLiveColorCount = liveColorLeaderboard[0]?.count || 0;
  const selectionCount = selectionStartCoordinate && selectionEndCoordinate
    ? Object.keys(selectedCellsGrid ?? {}).length
    : 0;

  return (
    <div className="App">
      <div className="playground-header">
        <div className="playground-header-title-row">
          <div className="playground-header-title-block">
            <div className="playground-header-title-wrap">
              <h3 className="playground-header-title">
              <span className="playground-header-title-text">{headerTitle}</span>
              </h3>
              {!isSystemPattern ? (
                <button
                  className="playground-header-title-edit-btn"
                  type="button"
                  onClick={openEditNameModal}
                  aria-label={t('playground.editTitle')}
                  title={t('playground.editTitle')}
                >
                  <Pencil size={13} aria-hidden="true" />
                </button>
              ) : null}
                {!isUnsavedDraftBoard && patternCategoryLabel && patternCreatorLabel ? (
                  <div className="playground-header-meta-row" aria-label={t('playground.patternMetadata')}>
                    {categoryExploreHref ? (
                      <Link
                        className="wm-badge wm-badge-neutral playground-header-meta-badge play-info-category-link"
                        to={categoryExploreHref as string}
                      >
                        {t('playground.categoryBadge', { category: patternCategoryLabel })}
                      </Link>
                    ) : null}
                    {authorProfileHref ? (
                      <Link
                        className="wm-badge wm-badge-neutral playground-header-meta-badge explore-pattern-owner-link play-info-author-link"
                        to={authorProfileHref as string}
                      >
                        <span className="pattern-source-badge-content">
                          <span>{t('playground.createdByLabel')}</span>
                          {currentPatternMetadata?.source === 'system' ? <Cpu size={11} aria-hidden="true" /> : <User size={11} aria-hidden="true" />}
                          <span>{patternCreatorLabel}</span>
                        </span>
                      </Link>
                    ) : null}
                    {forkOrigin ? (
                      <span className="wm-badge wm-badge-neutral playground-header-meta-badge">
                        {t('playground.forkedFrom', { name: forkOrigin.parentTitle })}
                      </span>
                    ) : null}
                  </div>
                ) : null}
            </div>
          </div>
          {isUnsavedEmptyBoard ? (
            <div className="playground-header-unsaved-note-row">
              <span className="playground-header-unsaved-note">{t('playground.unsavedEmptyBoardNotice')}</span>
            </div>
          ) : null}
          <div className="playground-header-actions">
            {!isUnsavedDraftBoard ? (
              <>
                <button
                  className="btn btn-sm btn-secondary-neutral"
                  type="button"
                  onClick={copyPatternHash}
                  aria-label={t('playground.copyHash')}
                  title={t('playground.copyHash')}
                >
                  <Copy size={12} />
                  <span>{t('playground.copyHash')}</span>
                </button>
                <button
                  className="btn btn-sm btn-secondary-neutral"
                  type="button"
                  onClick={toggleCurrentPatternStar}
                  aria-label={isStarredByCurrentUser ? t('explore.favorited') : t('explore.favorite')}
                  title={isStarredByCurrentUser ? t('explore.favorited') : t('explore.favorite')}
                >
                  <Star size={12} fill={isStarredByCurrentUser ? 'currentColor' : 'none'} />
                  <span>{t('playground.infoStarsLabel', { count: patternStars })}</span>
                </button>
                {isSystemPattern ? (
                  <button
                    className="btn btn-sm btn-secondary-neutral"
                    type="button"
                    onClick={() => setActivePopularityModal('forks')}
                    aria-label={t('playground.viewForks')}
                    title={t('playground.viewForks')}
                  >
                    <GitFork size={12} />
                    <span>{t('playground.infoForksLabel', { count: patternForks })}</span>
                  </button>
                ) : null}
              </>
            ) : null}
            {!isSystemPattern ? (
              isUnsavedDraftBoard ? (
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={openDraftSaveConfirmModal}
                  aria-label={t('playground.save')}
                  title={t('playground.save')}
                >
                  <Save size={12} />
                  <span>{t('playground.save')}</span>
                </button>
              ) : (
                <div className="playground-save-compound" role="group" aria-label={t('playground.save')}>
                  <button
                    className="btn btn-sm btn-secondary-neutral"
                    type="button"
                    onClick={() => saveTemplate(false)}
                    aria-label={t('playground.save')}
                    title={t('playground.save')}
                    disabled={!canSaveTemplate}
                  >
                    <Save size={12} />
                    <span>{t('playground.save')}</span>
                  </button>
                  <details className="playground-save-menu">
                    <summary className="playground-save-menu-trigger" aria-label={t('playground.saveOptions')} title={t('playground.saveOptions')}>
                      <ChevronDown size={12} aria-hidden="true" />
                    </summary>
                    <div className="playground-save-menu-panel" role="menu" aria-label={t('playground.saveOptions')}>
                      <button
                        className="playground-save-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={(event) => runSaveMenuAction(event, () => saveTemplate(false))}
                        disabled={!canSaveTemplate}
                      >
                        <Save size={12} aria-hidden="true" />
                        <span>{t('playground.save')}</span>
                      </button>
                      <button
                        className="playground-save-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={(event) => runSaveMenuAction(event, openEditNameModal)}
                      >
                        <SaveAll size={12} aria-hidden="true" />
                        <span>{t('playground.saveAs')}</span>
                      </button>
                    </div>
                  </details>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      <div className="wm-sidebar-layout wm-sidebar-layout-stretch playground-content-row">
        <div
          className={`left-column wm-sidebar-layout-main${isBoardMaximized ? ' board-maximized' : ''}`}
          onMouseMove={handleBoardMouseMove}
        >
        <Grid 
          game={game} 
          onHoverCoordinateChange={handleHoverCoordinateChange}
          hoveredCoordinate={hoveredCoordinate}
          onContextCoordinateRequest={handleContextCoordinateRequest}
          onPaintStart={handleBoardEditStart}
          selectionGrid={isEditMode && activeEditTool === 'selection' ? selectedCellsGrid : null}
          selectionStartCoordinate={isEditMode && activeEditTool === 'selection' ? selectionStartCoordinate : null}
          selectionEndCoordinate={isEditMode && activeEditTool === 'selection' ? selectionEndCoordinate : null}
          onSelectionStart={handleSelectionStart}
          onSelectionChange={handleSelectionChange}
          onSelectionEnd={handleSelectionEnd}
          palette={selectedPalette}
          isEditMode={isEditMode}
          onCellPaint={handleCellPaint}
          activeDrawColor={activeDrawColor}
          activeEditTool={activeEditTool}
          stampPattern={rotatedStampPattern}
          onStampPatternAtCoordinate={handleStampPatternAtCoordinate}
          isBoardMaximized={isBoardMaximized}
          toggleBoardMaximized={toggleBoardMaximized}
          playOverlayContent={(
            <GridControls
              variant="play"
              nextGeneration={nextGeneration}
              updateGenerationSpeed={updateGenerationSpeed}
              generationSpeed={generationSpeed}
              hoveredCoordinate={hoveredCoordinate}
              onResetRequested={requestResetBoard}
              toggleGame={toggleGame}
              isGameRunning={isGameRunning}
              copyCurrentURL={copyCurrentURL}
              selectedPaletteId={selectedPaletteId}
              selectedDrawColor={activeDrawColor}
              onPaletteChange={handlePaletteChange}
              onDrawColorChange={handleDrawColorChange}
              onCustomColorCommitted={handleCustomColorCommitted}
              isEditMode={isEditMode}
              onEnterEditMode={enterEditMode}
              onEnterPlayMode={enterPlayMode}
              onUndoBoardChange={undoBoardChange}
              canUndoBoardChange={undoBoardSnapshot !== null}
              isSystemPattern={isSystemPattern}
              activeEditTool={activeEditTool}
              onEditToolChange={handleEditToolChange}
              selectionCount={selectionCount}
              stampPattern={stampPattern}
              stampPreviewPattern={rotatedStampPattern}
              stampPatternName={stampPatternName}
              stampRotation={stampRotation}
              onRotateStamp={rotateStampPattern}
              onStampPatternSelect={handleStampPatternSelect}
            />
          )}
        />
        {boardStateOverlay && (
          <div className="board-state-overlay board-state-overlay-top" role="dialog" aria-modal="false" aria-live="polite">
            <div className="board-state-overlay-panel">
              <h4 className="board-state-overlay-title">
                {boardStateOverlay === 'stability' ? t('messages.stabilityDetectedTitle') : t('messages.gameOverTitle')}
              </h4>
              <p className="board-state-overlay-text">
                {boardStateOverlay === 'stability'
                  ? t('messages.stabilityDetectedDescription')
                  : t('messages.gameOverDescription')}
              </p>
              <div className="board-state-overlay-actions">
                <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={returnToEditModeFromBoardState}>
                  {t('messages.returnToEditMode')}
                </button>
                {boardStateOverlay === 'stability' && (
                  <button className="btn btn-sm btn-primary-neutral" type="button" onClick={continuePlayingFromBoardState}>
                    {t('messages.continuePlaying')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        <div className="right-column wm-sidebar-layout-aside wm-sidebar-layout-aside-no-divider">
        <div className="sidebar-tabs-nav right-column-card-spaced">
          <ThemeTabs
            options={[
              { value: 'diagnostics', label: 'State' },
              { value: 'info', label: t('playground.infoTab') },
              { value: 'patterns', label: 'Patterns' },
            ]}
            activeValue={activeSidebarTab}
            onChange={(value) => setActiveSidebarTab(value as 'patterns' | 'diagnostics' | 'info')}
            ariaLabel="Simulation panels"
          />
        </div>

        {activeSidebarTab === 'info' && (
          <div className="diagnostics-panel play-info-panel">
            <h4 className="diagnostics-section-heading">{t('playground.infoTitle')}</h4>
            {!isUnsavedDraftBoard ? (
              <>
                <article className="diagnostics-stat-card play-info-field">
                  <p className="diagnostics-stat-label">{t('playground.infoAuthorLabel')}</p>
                  {authorProfileHref && patternCreatorLabel ? (
                    <Link className="wm-badge wm-badge-neutral explore-pattern-owner-link play-info-author-link" to={authorProfileHref as string}>
                      <span className="pattern-source-badge-content">
                        {currentPatternMetadata?.source === 'system' ? <Cpu size={11} aria-hidden="true" /> : <User size={11} aria-hidden="true" />}
                        <span>{patternCreatorLabel}</span>
                      </span>
                    </Link>
                  ) : null}
                </article>
                <article className="diagnostics-stat-card play-info-field">
                  <p className="diagnostics-stat-label">{t('playground.infoCategoryLabel')}</p>
                  {categoryExploreHref && patternCategoryLabel ? (
                    <Link className="wm-badge wm-badge-neutral play-info-category-link" to={categoryExploreHref as string}>
                      <span>{patternCategoryLabel}</span>
                    </Link>
                  ) : null}
                </article>
                <article className="diagnostics-stat-card play-info-field">
                  <p className="diagnostics-stat-label">{t('playground.infoDescriptionLabel')}</p>
                  <p className="play-info-field-value">{effectiveDescription}</p>
                </article>
                <article className="diagnostics-stat-card play-info-field">
                  <p className="diagnostics-stat-label">{t('playground.infoVisibilityLabel')}</p>
                  <p className="play-info-field-value">{visibilityLabel}</p>
                </article>
                <article className="diagnostics-stat-card play-info-field">
                  <p className="diagnostics-stat-label">{t('playground.infoPopularityLabel')}</p>
                  <div className="play-info-popularity-row">
                    <button
                      className="wm-badge wm-badge-neutral play-info-popularity-trigger"
                      type="button"
                      onClick={() => setActivePopularityModal('stars')}
                    >
                      <span className="pattern-source-badge-content">
                        <Star size={11} aria-hidden="true" />
                        <span>{t('playground.infoStarsLabel', { count: patternStars })}</span>
                      </span>
                    </button>
                    <button
                      className="wm-badge wm-badge-neutral play-info-popularity-trigger"
                      type="button"
                      onClick={() => setActivePopularityModal('forks')}
                    >
                      <span className="pattern-source-badge-content">
                        <GitFork size={11} aria-hidden="true" />
                        <span>{t('playground.infoForksLabel', { count: patternForks })}</span>
                      </span>
                    </button>
                  </div>
                </article>
              </>
            ) : null}
          </div>
        )}

        {activeSidebarTab === 'patterns' && (
          <div className="right-column-card-fill">
            <PatternInput 
              onLoadPattern={handlePatternInputLoad}
              disabled={isGameRunning}
              selectedPaletteId={selectedPaletteId}
            />
          </div>
        )}

        {activeSidebarTab === 'diagnostics' && (
          <div className="diagnostics-panel">
            <details className="diagnostics-section" open>
              <summary className="diagnostics-section-summary">
                <h4 className="diagnostics-section-heading">{t('diagnostics.statistics')}</h4>
              </summary>
              <div className="diagnostics-section-content">
                <div className="diagnostics-stats-grid">
                  <article className="diagnostics-stat-card">
                    <p className="diagnostics-stat-label">{t('diagnostics.generations')}</p>
                    <p className="diagnostics-stat-value">{generation}</p>
                  </article>
                  <article className="diagnostics-stat-card">
                    <p className="diagnostics-stat-label">{t('diagnostics.liveCells')}</p>
                    <p className="diagnostics-stat-value">{stats.liveCells}</p>
                  </article>
                  <article className="diagnostics-stat-card">
                    <p className="diagnostics-stat-label">{t('diagnostics.totalBirths')}</p>
                    <p className="diagnostics-stat-value diagnostics-stat-value--success">{stats.births}</p>
                  </article>
                  <article className="diagnostics-stat-card">
                    <p className="diagnostics-stat-label">{t('diagnostics.totalDeaths')}</p>
                    <p className="diagnostics-stat-value diagnostics-stat-value--danger">{stats.deaths}</p>
                  </article>
                </div>
                <article className="diagnostics-stat-card">
                  <p className="diagnostics-stat-label">{t('diagnostics.liveCellsByColor')}</p>
                  <div className="diagnostics-color-leaderboard" role="list" aria-label={t('diagnostics.liveCellsByColor')}>
                    {liveColorLeaderboard.length === 0 ? (
                      <p className="diagnostics-color-leaderboard-empty">{t('diagnostics.noLiveCellsByColor')}</p>
                    ) : (
                      liveColorLeaderboard.map(({ color, count }) => {
                        const relativeWidth = maxLiveColorCount > 0 ? Math.max(6, (count / maxLiveColorCount) * 100) : 0;
                        return (
                          <div className="diagnostics-color-leaderboard-item" role="listitem" key={color}>
                            <div className="diagnostics-color-leaderboard-item-header">
                              <span className="diagnostics-color-chip" style={{ backgroundColor: color }} aria-hidden="true"></span>
                              <span className="diagnostics-color-code">{color}</span>
                              <span className="diagnostics-color-count">{t('diagnostics.liveCellsCount', { count })}</span>
                            </div>
                            <div className="diagnostics-color-bar-track" aria-hidden="true">
                              <div className="diagnostics-color-bar-fill" style={{ width: `${relativeWidth}%`, backgroundColor: color }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              </div>
            </details>

            <details className="diagnostics-section" open>
              <summary className="diagnostics-section-summary">
                <h4 className="diagnostics-section-heading">{t('rules.title')}</h4>
              </summary>
              <div className="diagnostics-section-content">
                <RulesPanel
                  rules={rules}
                  onRulesChange={handleRulesChange}
                  disabled={isGameRunning}
                  embedded={true}
                />
              </div>
            </details>

            <details className="diagnostics-section" open>
              <summary className="diagnostics-section-summary">
                <h4 className="diagnostics-section-heading">{t('diagnostics.settings')}</h4>
              </summary>
              <div className="diagnostics-section-content">
                <div className="wm-toggle-list">
                  <div>
                    <label className="wm-toggle">
                      <input
                        type="checkbox"
                        className="wm-toggle-input"
                        checked={isStabilityOverlayEnabled}
                        onChange={(event) => handleStabilityOverlayToggle(event.target.checked)}
                      />
                      <span className="wm-toggle-track"><span className="wm-toggle-thumb"></span></span>
                      <span className="wm-toggle-label">{t('diagnostics.stabilityOverlayEnabled')}</span>
                    </label>
                    <p className="wm-toggle-description">{t('diagnostics.stabilityOverlayDescription')}</p>
                  </div>
                </div>
              </div>
            </details>

            <details className="diagnostics-section" open>
              <summary className="diagnostics-section-summary">
                <h4 className="diagnostics-section-heading">{t('diagnostics.cellData')}</h4>
              </summary>
              <div className="diagnostics-section-content">
                <div className="code-sample" data-lang="json">
                  <button
                    className="code-copy-btn"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(gridJSON).then(() => {
                        setCellDataCopied(true);
                        setTimeout(() => setCellDataCopied(false), 1500);
                      });
                    }}
                  >
                    {cellDataCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <pre className="code-block"><code className="language-json">{gridJSON}</code></pre>
                </div>
              </div>
            </details>
          </div>
        )}
        </div>
      </div>

      <div
        className={`wm-toast wm-toast-success${snackbarOpen ? ' wm-toast-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {snackbarMessage}
        <button
          className="wm-toast-dismiss"
          type="button"
          aria-label="Dismiss"
          onClick={handleSnackbarClose}
        >&#x2715;</button>
      </div>

      {isResetModalOpen && (
        <div className="wm-modal-overlay" onClick={cancelResetBoard}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="reset-modal-title" className="wm-modal-title">{t('dialogs.confirmReset')}</h3>
            </div>
            <div className="wm-modal-body">
              <p>{t('dialogs.resetMessage')}</p>
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={cancelResetBoard}>
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-danger" type="button" onClick={confirmResetBoard}>
                {t('dialogs.yesReset')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditNameModalOpen && (
        <div className="wm-modal-overlay" onClick={closeEditNameModal}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-name-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="edit-name-modal-title" className="wm-modal-title">{nameModalMode === 'fork' ? t('playground.forkTitle') : t('playground.editTitle')}</h3>
            </div>
            <div className="wm-modal-body">
              <label htmlFor="pattern-name-input" className="wm-input-label">{t('playground.patternName')}</label>
              <input
                id="pattern-name-input"
                className="wm-input"
                type="text"
                value={patternNameDraft}
                onChange={(e) => setPatternNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmEditNameModal();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={closeEditNameModal}>
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-primary" type="button" onClick={confirmEditNameModal}>
                {nameModalMode === 'fork' ? t('playground.createFork') : t('playground.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDraftSaveConfirmModalOpen && (
        <div className="wm-modal-overlay" onClick={closeDraftSaveConfirmModal}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-save-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="draft-save-modal-title" className="wm-modal-title">{t('playground.confirmDraftSaveTitle')}</h3>
            </div>
            <div className="wm-modal-body">
              <label htmlFor="draft-save-name-input" className="wm-input-label">{t('playground.patternName')}</label>
              <input
                id="draft-save-name-input"
                className="wm-input"
                type="text"
                value={draftSaveName}
                onChange={(e) => setDraftSaveName(e.target.value)}
                placeholder={t('playground.confirmDraftSaveNamePlaceholder')}
                autoFocus
              />
              <label htmlFor="draft-save-category-select" className="wm-input-label">{t('playground.confirmDraftSaveCategoryLabel')}</label>
              <select
                id="draft-save-category-select"
                className="wm-input"
                value={draftSaveCategory}
                onChange={(e) => setDraftSaveCategory(e.target.value)}
              >
                <option value="" disabled>{t('playground.confirmDraftSaveCategoryPlaceholder')}</option>
                {draftCategoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <label htmlFor="draft-save-description-input" className="wm-input-label">{t('playground.infoDescriptionLabel')}</label>
              <textarea
                id="draft-save-description-input"
                className="wm-input"
                value={draftSaveDescription}
                onChange={(e) => setDraftSaveDescription(e.target.value)}
                placeholder={t('playground.confirmDraftSaveDescriptionPlaceholder')}
                rows={3}
              />
              <fieldset className="playground-visibility-toggle-group">
                <legend className="wm-input-label">{t('playground.confirmDraftSaveVisibilityLabel')}</legend>
                <label className="playground-visibility-toggle-option">
                  <input
                    type="radio"
                    name="draft-save-visibility"
                    value="public"
                    checked={draftSaveVisibility === 'public'}
                    onChange={() => setDraftSaveVisibility('public')}
                  />
                  <span>{t('playground.visibilityPublic')}</span>
                </label>
                <label className="playground-visibility-toggle-option">
                  <input
                    type="radio"
                    name="draft-save-visibility"
                    value="private"
                    checked={draftSaveVisibility === 'private'}
                    onChange={() => setDraftSaveVisibility('private')}
                  />
                  <span>{t('playground.visibilityPrivate')}</span>
                </label>
              </fieldset>
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={closeDraftSaveConfirmModal}>
                {t('dialogs.cancel')}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={confirmDraftSave}
                disabled={!draftSaveName.trim() || !draftSaveCategory.trim()}
              >
                {t('playground.confirmDraftSaveAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {contextInsertCoordinate && (
        <div className="wm-modal-overlay" onClick={closeInsertPatternModal}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insert-pattern-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="insert-pattern-modal-title" className="wm-modal-title">{t('playground.insertSystemPattern')}</h3>
            </div>
            <div className="wm-modal-body">
              <PatternSelector onSelectPattern={handleInsertSystemPattern} selectedPaletteId={selectedPaletteId} />
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={closeInsertPatternModal}>
                {t('dialogs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activePopularityModal === 'stars' && (
        <div className="wm-modal-overlay" onClick={() => setActivePopularityModal(null)}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stars-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="stars-modal-title" className="wm-modal-title">
                {t('playground.starsModalTitle', { pattern: headerTitle })}
              </h3>
            </div>
            <div className="wm-modal-body">
              {starredByUsers.length === 0 ? (
                <p>{t('playground.noStarsYet')}</p>
              ) : (
                <ul className="play-popularity-list">
                  {starredByUsers.map((userName, index) => (
                    <li key={`${userName}-${index}`}>{userName}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={() => setActivePopularityModal(null)}>
                {t('dialogs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activePopularityModal === 'forks' && (
        <div className="wm-modal-overlay" onClick={() => setActivePopularityModal(null)}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forks-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="forks-modal-title" className="wm-modal-title">
                {t('playground.forksModalTitle', { pattern: headerTitle })}
              </h3>
            </div>
            <div className="wm-modal-body">
              {forkedByRecords.length === 0 ? (
                <p>{t('playground.noForksYet')}</p>
              ) : (
                <>
                  <div className="play-forks-list-head" aria-hidden="true">
                    <span>{t('explore.tablePattern')}</span>
                    <span>{t('playground.forkedDateLabel')}</span>
                    <span>{t('playground.lastModifiedDateLabel')}</span>
                    <span>{t('explore.tableStars')}</span>
                  </div>
                  <ul className="wm-list play-forks-list">
                    {forkedByRecords.map((entry) => (
                      <li key={entry.boardId}>
                        <Link
                          className="play-forks-list-link"
                          to={getBoardHref(entry.boardHash, entry.boardId)}
                          onClick={() => {
                            trackRecentBoard(entry.boardHash, entry.pattern, entry.boardId);
                            setActivePopularityModal(null);
                          }}
                        >
                          <div className="play-forks-list-row">
                            <div className="play-forks-list-pattern-cell">
                              <PatternPreview grid={entry.boardGrid} size={52} palette={selectedPalette} />
                              <div className="play-forks-list-pattern-copy">
                                <span className="play-forks-list-pattern-name">{entry.pattern}</span>
                                <span className="play-forks-list-pattern-meta">{entry.forker}</span>
                              </div>
                            </div>
                            <span>{entry.forkedAt}</span>
                            <span>{entry.updatedAt}</span>
                            <span>{entry.stars}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="wm-modal-footer">
              {isSystemPattern ? (
                <button className="btn btn-primary" type="button" onClick={openForkNameModal}>
                  {t('playground.fork')}
                </button>
              ) : null}
              <button className="btn btn-secondary btn-outline" type="button" onClick={() => setActivePopularityModal(null)}>
                {t('dialogs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
