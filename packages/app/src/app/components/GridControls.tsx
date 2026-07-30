import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { patterns, LifeGrid, Pattern } from '@game-of-life/core';
import { ArrowRightLeft, ChevronRight, Eraser, Filter, Hand, Link, Minus, PaintBucket, Pause, Pencil, Play, Plus, RotateCcw, RotateCw, Stamp } from 'lucide-react';
import { Square } from 'lucide-react';
import PatternPreview from './PatternPreview';
import { getPaletteById } from '../constants/colors';

const GENERATION_SPEED_MIN = 1;
const GENERATION_SPEED_MAX = 10;
const SYSTEM_DRAW_COLORS = ['#22c55e', '#39d353', '#3b82f6', '#f97316', '#ef4444', '#eab308', '#a855f7', '#06b6d4'];
const DEFAULT_CUSTOM_COLORS = ['#ffffff', '#000000', '#f43f5e', '#14b8a6'];
const STAMP_MENU_BOTTOM_CLEARANCE_PX = 10;
const STAMP_MENU_SCROLL_OFFSET_PX = 46;
const PALETTE_ID_BY_SYSTEM_COLOR: Record<string, string> = {
  '#22c55e': 'classic',
  '#39d353': 'github',
  '#3b82f6': 'ocean',
  '#f97316': 'sunset',
};

interface Props {
  variant?: 'play' | 'edit';
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  hoveredCoordinate?: string | null;
  onResetRequested: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
  copyCurrentURL: () => void;
  selectedPaletteId: string;
  selectedDrawColor: string;
  onPaletteChange: (paletteId: string) => void;
  onDrawColorChange: (color: string) => void;
  onCustomColorCommitted?: (color: string) => void;
  isEditMode?: boolean;
  onEnterEditMode?: () => void;
  onEnterPlayMode?: () => void;
  onUndoBoardChange?: () => void;
  canUndoBoardChange?: boolean;
  isSystemPattern?: boolean;
  activeEditTool?: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';
  onEditToolChange?: (tool: 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp') => void;
  selectionCount?: number;
  onFillSelectionColor?: () => void;
  stampPattern?: LifeGrid | null;
  stampPreviewPattern?: LifeGrid | null;
  stampPatternName?: string;
  stampRotation?: 0 | 90 | 180 | 270;
  rotateStampKeyPressToken?: number;
  onRotateStamp?: () => void;
  onStampPatternSelect?: (grid: LifeGrid) => void;
}

function GridControls({
  variant = 'edit',
  nextGeneration,
  updateGenerationSpeed,
  generationSpeed,
  hoveredCoordinate = null,
  onResetRequested,
  toggleGame,
  isGameRunning,
  copyCurrentURL,
  selectedPaletteId,
  selectedDrawColor,
  onPaletteChange,
  onDrawColorChange,
  onCustomColorCommitted,
  isEditMode = false,
  onEnterEditMode,
  onEnterPlayMode,
  onUndoBoardChange,
  canUndoBoardChange = false,
  isSystemPattern = false,
  activeEditTool = 'pencil',
  onEditToolChange,
  stampPattern = null,
  stampPreviewPattern = null,
  stampPatternName = '',
  stampRotation = 0,
  rotateStampKeyPressToken = 0,
  onRotateStamp,
  onStampPatternSelect,
  onFillSelectionColor,
}: Props) {
  const { t } = useTranslation();
  const toggleLabel = isGameRunning ? t('controls.pause') : t('controls.start');
  const nextLabel = t('controls.next');
  const resetLabel = t('controls.reset');
  const copyLabel = t('controls.copyUrl');
  const generationSpeedLabel = t('controls.generationSpeed');
  const controlsDisabled = isEditMode;
  const showPlayControls = variant === 'play';
  const showEditControls = variant === 'edit';
  const sectionLabel = showPlayControls ? t('controls.playControls') : t('controls.editControls');
  const decreaseSpeedLabel = t('controls.generationSpeedDecrease');
  const increaseSpeedLabel = t('controls.generationSpeedIncrease');
  const currentSpeedLabel = t('controls.generationSpeedValue', { level: generationSpeed });
  const colorPaletteLabel = showPlayControls ? t('controls.drawColor') : t('colors.title');
  const modeToggleLabel = isEditMode ? t('nav.play') : t('controls.edit');
  const modeToggleHotkeyLabel = t('controls.modeToggleHotkey');
  const pencilLabel = t('controls.pencil');
  const eraserLabel = t('controls.eraser');
  const customColorLabel = t('controls.customColor');
  const customColorHexLabel = t('controls.customColorHex');
  const undoLabel = t('controls.undo');
  const systemColorsLabel = t('controls.systemColors');
  const customColorsLabel = t('controls.customColors');
  const selectionLabel = t('controls.selection');
  const fillSelectionLabel = t('controls.fillSelection');
  const grabPanLabel = t('controls.grabPan');
  const stampLabel = t('controls.stamp');
  const stampPatternsLabel = t('controls.stampPatterns');
  const currentStampSelectionLabel = t('controls.currentStampSelection');
  const searchStampPatternsLabel = t('controls.searchStampPatterns');
  const filterStampCategoryLabel = t('controls.filterStampCategory');
  const allStampCategoriesLabel = t('controls.allStampCategories');
  const rotateStampLabel = t('controls.rotateStamp');
  const stampRotationLabel = t('controls.stampRotation', { degrees: stampRotation });
  const rotateStampHotkeyLabel = t('controls.rotateStampHotkey');
  const stampTooltipName = stampPatternName || t('patterns.custom');
  const selectedPalette = getPaletteById(selectedPaletteId);
  const [customHexValue, setCustomHexValue] = useState(selectedDrawColor);
  const [customColorSlots, setCustomColorSlots] = useState<string[]>(() => [selectedDrawColor, ...DEFAULT_CUSTOM_COLORS].slice(0, 4));
  const [activeCustomSlotIndex, setActiveCustomSlotIndex] = useState(0);
  const [stampSearchQuery, setStampSearchQuery] = useState('');
  const [selectedStampCategory, setSelectedStampCategory] = useState<string>('all');
  const [isRotateStampKeyPressed, setIsRotateStampKeyPressed] = useState(false);
  const [stampMenuMaxHeight, setStampMenuMaxHeight] = useState<number | null>(null);
  const [isStampMenuOpen, setIsStampMenuOpen] = useState(false);
  const stampMenuRef = useRef<HTMLDetailsElement | null>(null);
  const stampMenuPanelRef = useRef<HTMLDivElement | null>(null);

  const updateStampMenuMaxHeight = useCallback(() => {
    const stampMenuElement = stampMenuRef.current;
    const stampMenuPanelElement = stampMenuPanelRef.current;

    if (!stampMenuElement || !stampMenuPanelElement || !stampMenuElement.open) {
      return;
    }

    const boardStageElement = stampMenuElement.closest('.grid-stage') as HTMLElement | null;
    if (!boardStageElement) {
      return;
    }

    const boardStageRect = boardStageElement.getBoundingClientRect();
    const panelRect = stampMenuPanelElement.getBoundingClientRect();
    const availableHeight = Math.floor(boardStageRect.bottom - STAMP_MENU_BOTTOM_CLEARANCE_PX - panelRect.top);

    if (availableHeight <= 0) {
      return;
    }

    setStampMenuMaxHeight(availableHeight);
  }, []);

  useEffect(() => {
    if (!isStampMenuOpen) {
      return;
    }

    const handleWindowResize = () => {
      updateStampMenuMaxHeight();
    };

    requestAnimationFrame(() => {
      updateStampMenuMaxHeight();
    });

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isStampMenuOpen, updateStampMenuMaxHeight]);

  useEffect(() => {
    if (rotateStampKeyPressToken <= 0) return;

    setIsRotateStampKeyPressed(true);
    const timer = setTimeout(() => setIsRotateStampKeyPressed(false), 140);

    return () => clearTimeout(timer);
  }, [rotateStampKeyPressToken]);

  useEffect(() => {
    setCustomHexValue(selectedDrawColor);
  }, [selectedDrawColor]);

  function formatPatternTitle(name: string) {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function getGridSignature(grid: LifeGrid) {
    return Object.keys(grid)
      .sort((left, right) => {
        const [leftX = 0, leftY = 0] = left.split(',').map(Number);
        const [rightX = 0, rightY = 0] = right.split(',').map(Number);
        if (leftX === rightX) return leftY - rightY;
        return leftX - rightX;
      })
      .map((key) => `${key}:${grid[key] ?? ''}`)
      .join('|');
  }

  const activeStampSignature = stampPattern ? getGridSignature(stampPattern) : null;
  const selectedPattern = activeStampSignature
    ? patterns.find((pattern) => getGridSignature(pattern.grid) === activeStampSignature) ?? null
    : null;

  function closeClosestStampMenu(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest('.grid-controls-stamp-menu') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  function handleStampPatternSelection(event: React.MouseEvent<HTMLButtonElement>, pattern: Pattern) {
    onStampPatternSelect?.(pattern.grid);
    onEditToolChange?.('stamp');
    setStampSearchQuery('');
    closeClosestStampMenu(event.currentTarget);
  }

  function closeClosestStampCategoryMenu(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest('.grid-controls-stamp-category-filter') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  function highlightSearchMatch(text: string): React.ReactNode {
    const query = stampSearchQuery.trim();
    if (!query) {
      return text;
    }

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let searchFrom = 0;

    while (searchFrom < text.length) {
      const matchIndex = normalizedText.indexOf(normalizedQuery, searchFrom);
      if (matchIndex === -1) {
        parts.push(text.slice(searchFrom));
        break;
      }

      if (matchIndex > searchFrom) {
        parts.push(text.slice(searchFrom, matchIndex));
      }

      const matchEnd = matchIndex + query.length;
      parts.push(
        <mark className="grid-controls-stamp-hit" key={`${text}-${matchIndex}-${matchEnd}`}>
          {text.slice(matchIndex, matchEnd)}
        </mark>,
      );
      searchFrom = matchEnd;
    }

    return parts;
  }

  const stampCategoryOptions = ['all', ...Array.from(new Set(patterns.map((pattern) => pattern.category))).sort((a, b) => a.localeCompare(b))];
  const visibleStampCategoryOptions = stampCategoryOptions.filter((categoryOption) => categoryOption !== selectedStampCategory);
  const normalizedStampSearchQuery = stampSearchQuery.trim().toLowerCase();
  const stampMenuScrollMaxHeight = stampMenuMaxHeight !== null
    ? Math.max(112, stampMenuMaxHeight - STAMP_MENU_SCROLL_OFFSET_PX)
    : undefined;

  const filteredStampPatterns = patterns.filter((pattern) => {
    const signature = getGridSignature(pattern.grid);
    if (signature === activeStampSignature) {
      return false;
    }

    if (selectedStampCategory !== 'all' && pattern.category !== selectedStampCategory) {
      return false;
    }

    if (!normalizedStampSearchQuery) {
      return true;
    }

    const name = pattern.name.toLowerCase();
    const category = pattern.category.toLowerCase();
    return name.includes(normalizedStampSearchQuery) || category.includes(normalizedStampSearchQuery);
  });

  useEffect(() => {
    if (!isStampMenuOpen) {
      return;
    }

    requestAnimationFrame(() => {
      updateStampMenuMaxHeight();
    });
  }, [filteredStampPatterns.length, isStampMenuOpen, selectedPattern, updateStampMenuMaxHeight]);

  useEffect(() => {
    setCustomColorSlots((previous) => {
      const lower = selectedDrawColor.toLowerCase();
      if (previous.some((color) => color.toLowerCase() === lower)) {
        return previous;
      }
      const next = [...previous];
      next[activeCustomSlotIndex] = selectedDrawColor;
      return next;
    });
  }, [activeCustomSlotIndex, selectedDrawColor]);

  function closeClosestColorMenu(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;
    const menu = target.closest('.grid-controls-color-picker') as HTMLDetailsElement | null;
    if (menu) {
      menu.open = false;
    }
  }

  function handleSystemColorSelect(event: React.MouseEvent<HTMLButtonElement>, color: string) {
    const matchingPaletteId = PALETTE_ID_BY_SYSTEM_COLOR[color.toLowerCase()];
    if (matchingPaletteId) {
      onPaletteChange(matchingPaletteId);
    }
    onDrawColorChange(color);
    setCustomHexValue(color);
    closeClosestColorMenu(event.currentTarget);
  }

  function handleCustomColorSelect(event: React.MouseEvent<HTMLButtonElement>, color: string, index: number) {
    setActiveCustomSlotIndex(index);
    onDrawColorChange(color);
    setCustomHexValue(color);
    closeClosestColorMenu(event.currentTarget);
  }

  function applyCustomHex(rawValue: string): string | null {
    const trimmed = rawValue.trim();
    const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const validHex = /^#([0-9a-fA-F]{6})$/.test(normalized);
    if (!validHex) return null;

    const formatted = normalized.toLowerCase();
    setCustomHexValue(formatted);
    setCustomColorSlots((previous) => {
      const next = [...previous];
      next[activeCustomSlotIndex] = formatted;
      return next;
    });
    onDrawColorChange(formatted);
    return formatted;
  }

  return (
    <div className="GridControls">
      <form onSubmit={(e) => e.preventDefault()} className={`grid-controls-form grid-controls-form-${variant}`}>
        <div className="controls-main-row">
          {showEditControls && (
            <div className="grid-controls-section grid-controls-section-start">
              <span className="wm-slider-label grid-controls-label">{sectionLabel}</span>
              <div className="grid-controls-actions-row">
                <span className="control-tooltip-trigger" data-tooltip={copyLabel}>
                  <button
                    className="btn btn-sm btn-secondary-neutral"
                    type="button"
                    onClick={copyCurrentURL}
                    aria-label={copyLabel}
                  >
                    <Link size={12} />
                  </button>
                </span>
              </div>
            </div>
          )}

          {showPlayControls && (
            <>
              <div className="grid-controls-section grid-controls-section-mode-toggle">
                <div className="grid-controls-actions-row">
                  <span className="control-tooltip-trigger" data-tooltip={`${modeToggleLabel} (${modeToggleHotkeyLabel})`}>
                    <button
                      className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-secondary-neutral'} grid-controls-mode-button`}
                      type="button"
                      onClick={isEditMode ? onEnterPlayMode : onEnterEditMode}
                      aria-label={modeToggleLabel}
                      disabled={!isEditMode && isSystemPattern}
                    >
                      <ArrowRightLeft size={12} aria-hidden="true" />
                      <span>{modeToggleLabel}</span>
                    </button>
                  </span>
                </div>
              </div>

              {!isEditMode && (
                <>
                  <div className="grid-controls-section grid-controls-section-start">
                    <div className="grid-controls-actions-row">
                      <span className="control-tooltip-trigger" data-tooltip={grabPanLabel}>
                        <button
                          className={`btn btn-sm ${activeEditTool === 'grab' ? 'btn-primary' : 'btn-secondary-neutral'}`}
                          type="button"
                          onClick={() => onEditToolChange?.('grab')}
                          aria-label={grabPanLabel}
                        >
                          <Hand size={12} />
                        </button>
                      </span>
                      <span className="control-tooltip-trigger" data-tooltip={selectionLabel}>
                        <button
                          className={`btn btn-sm ${isEditMode && activeEditTool === 'selection' ? 'btn-primary' : 'btn-secondary-neutral'}`}
                          type="button"
                          onClick={() => {
                            onEnterEditMode?.();
                            onEditToolChange?.('selection');
                          }}
                          aria-label={selectionLabel}
                          disabled={isSystemPattern}
                        >
                          <Square size={12} />
                        </button>
                      </span>
                      <div className="btn-group">
                        <span className="control-tooltip-trigger" data-tooltip={toggleLabel}>
                          <button
                            className="btn btn-sm btn-primary-neutral"
                            type="button"
                            onClick={toggleGame}
                            disabled={controlsDisabled}
                            aria-label={toggleLabel}
                          >
                            {isGameRunning ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                        </span>
                        <span className="control-tooltip-trigger" data-tooltip={nextLabel}>
                          <button
                            className="btn btn-sm btn-secondary-neutral"
                            type="button"
                            onClick={nextGeneration}
                            disabled={controlsDisabled}
                            aria-label={nextLabel}
                          >
                            <ChevronRight size={12} />
                          </button>
                        </span>
                        <span className="control-tooltip-trigger" data-tooltip={resetLabel}>
                          <button
                            className="btn btn-sm btn-secondary-neutral"
                            type="button"
                            onClick={onResetRequested}
                            disabled={isGameRunning || controlsDisabled}
                            aria-label={resetLabel}
                          >
                            <RotateCcw size={12} />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid-controls-section">
                    <div className="grid-controls-field-wrap grid-controls-field-wrap-play">
                      <div className="grid-controls-speed-stepper" role="group" aria-label={generationSpeedLabel}>
                        <span className="control-tooltip-trigger" data-tooltip={decreaseSpeedLabel}>
                          <button
                            className="btn btn-sm btn-secondary-neutral"
                            type="button"
                            onClick={() => updateGenerationSpeed(generationSpeed - 1)}
                            disabled={controlsDisabled || generationSpeed <= GENERATION_SPEED_MIN}
                            aria-label={decreaseSpeedLabel}
                          >
                            <Minus size={12} />
                          </button>
                        </span>
                        <span className="control-tooltip-trigger" data-tooltip={currentSpeedLabel}>
                          <span className="grid-controls-speed-value" aria-live="polite">{generationSpeed}</span>
                        </span>
                        <span className="control-tooltip-trigger" data-tooltip={increaseSpeedLabel}>
                          <button
                            className="btn btn-sm btn-secondary-neutral"
                            type="button"
                            onClick={() => updateGenerationSpeed(generationSpeed + 1)}
                            disabled={controlsDisabled || generationSpeed >= GENERATION_SPEED_MAX}
                            aria-label={increaseSpeedLabel}
                          >
                            <Plus size={12} />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isEditMode && (
                <div className="grid-controls-section grid-controls-section-inline-edit">
                  <div className="grid-controls-actions-row">
                    <span className="control-tooltip-trigger" data-tooltip={grabPanLabel}>
                      <button
                        className={`btn btn-sm ${activeEditTool === 'grab' ? 'btn-primary' : 'btn-secondary-neutral'}`}
                        type="button"
                        onClick={() => onEditToolChange?.('grab')}
                        aria-label={grabPanLabel}
                      >
                        <Hand size={12} />
                      </button>
                    </span>
                    <span className="control-tooltip-trigger" data-tooltip={selectionLabel}>
                      <button
                        className={`btn btn-sm ${activeEditTool === 'selection' ? 'btn-primary' : 'btn-secondary-neutral'}`}
                        type="button"
                        onClick={() => onEditToolChange?.('selection')}
                        aria-label={selectionLabel}
                      >
                        <Square size={12} />
                      </button>
                    </span>
                    <div className="grid-controls-edit-tool-group">
                      <span className="control-tooltip-trigger" data-tooltip={pencilLabel}>
                        <button
                          className={`btn btn-sm ${activeEditTool === 'pencil' ? 'btn-primary' : 'btn-secondary-neutral'} grid-controls-edit-tool-button grid-controls-edit-tool-button-left`}
                          type="button"
                          onClick={() => onEditToolChange?.('pencil')}
                          aria-label={pencilLabel}
                        >
                          <Pencil size={12} />
                        </button>
                      </span>
                      <details className={`grid-controls-color-picker grid-controls-color-picker-${selectedPaletteId}`} aria-label={colorPaletteLabel}>
                        <summary
                          className={`btn btn-sm btn-secondary-neutral grid-controls-color-picker-trigger grid-controls-edit-tool-button grid-controls-edit-tool-button-right`}
                          aria-label={colorPaletteLabel}
                        >
                          <span className="grid-controls-color-picker-dot" style={{ backgroundColor: selectedDrawColor }} aria-hidden="true"></span>
                        </summary>
                        <div className="grid-controls-color-picker-panel">
                          <p className="grid-controls-color-picker-title">{colorPaletteLabel}</p>
                          <p className="grid-controls-color-group-label">{systemColorsLabel}</p>
                          <div className="grid-controls-color-swatch-grid">
                            {SYSTEM_DRAW_COLORS.map((color) => (
                              <button
                                key={color}
                                className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
                                type="button"
                                aria-label={`${systemColorsLabel} ${color}`}
                                title={color}
                                style={{ backgroundColor: color }}
                                onClick={(event) => handleSystemColorSelect(event, color)}
                                disabled={isGameRunning}
                              ></button>
                            ))}
                          </div>
                          <p className="grid-controls-color-group-label">{customColorsLabel}</p>
                          <div className="grid-controls-color-swatch-grid grid-controls-color-swatch-grid-custom">
                            {customColorSlots.map((color, index) => (
                              <button
                                key={`${color}-${index}`}
                                className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
                                type="button"
                                aria-label={`${customColorsLabel} ${index + 1} ${color}`}
                                title={color}
                                style={{ backgroundColor: color }}
                                onClick={(event) => handleCustomColorSelect(event, color, index)}
                                disabled={isGameRunning}
                              ></button>
                            ))}
                          </div>
                          <div className="grid-controls-custom-color-row">
                            <label className="grid-controls-custom-color-label" htmlFor="custom-draw-color-play">{customColorLabel}</label>
                            <div className="grid-controls-custom-color-inputs">
                              <input
                                id="custom-draw-color-play"
                                className="grid-controls-color-native-input"
                                type="color"
                                value={selectedDrawColor}
                                onChange={(event) => {
                                  onDrawColorChange(event.target.value);
                                  setCustomHexValue(event.target.value);
                                  setCustomColorSlots((previous) => {
                                    const next = [...previous];
                                    next[activeCustomSlotIndex] = event.target.value;
                                    return next;
                                  });
                                }}
                                disabled={isGameRunning}
                                aria-label={customColorLabel}
                              />
                              <input
                                className="grid-controls-color-hex-input"
                                type="text"
                                inputMode="text"
                                value={customHexValue}
                                onChange={(event) => setCustomHexValue(event.target.value)}
                                onBlur={(event) => applyCustomHex(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    const committedColor = applyCustomHex(customHexValue);
                                    if (committedColor) {
                                      onCustomColorCommitted?.(committedColor);
                                      closeClosestColorMenu(event.currentTarget);
                                    }
                                  }
                                }}
                                placeholder="#22c55e"
                                aria-label={customColorHexLabel}
                                disabled={isGameRunning}
                              />
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                    <div className="grid-controls-stamp-group">
                      <span className="grid-controls-stamp-preview-trigger">
                        <details
                          className="grid-controls-stamp-menu"
                          aria-label={stampPatternsLabel}
                          ref={stampMenuRef}
                          onToggle={(event) => {
                            const nextOpen = event.currentTarget.open;
                            setIsStampMenuOpen(nextOpen);
                            if (!nextOpen) {
                              setStampMenuMaxHeight(null);
                            }
                          }}
                        >
                          <summary
                            className={`btn btn-sm ${activeEditTool === 'stamp' ? 'btn-primary' : 'btn-secondary-neutral'} grid-controls-stamp-menu-trigger grid-controls-edit-tool-button grid-controls-edit-tool-button-left`}
                            aria-label={stampLabel}
                            onClick={() => onEditToolChange?.('stamp')}
                          >
                            {stampPreviewPattern ? (
                              <span className="grid-controls-stamp-selected-preview" aria-hidden="true">
                                <PatternPreview grid={stampPreviewPattern} size={22} palette={selectedPalette} />
                              </span>
                            ) : (
                              <Stamp size={12} />
                            )}
                          </summary>
                          {stampPreviewPattern && (
                            <span className="grid-controls-stamp-preview-popover" role="tooltip" aria-hidden="true">
                              <PatternPreview grid={stampPreviewPattern} size={72} palette={selectedPalette} />
                              <span className="grid-controls-stamp-preview-popover-meta">
                                <span className="grid-controls-stamp-preview-popover-title">{stampTooltipName}</span>
                                <span className="grid-controls-stamp-preview-popover-rotation">{stampRotationLabel}</span>
                              </span>
                            </span>
                          )}
                          <div
                            className="grid-controls-stamp-menu-panel"
                            ref={stampMenuPanelRef}
                            style={stampMenuMaxHeight !== null ? { maxHeight: `${stampMenuMaxHeight}px` } : undefined}
                          >
                            <div className="grid-controls-stamp-search-row">
                              <input
                                className="grid-controls-stamp-search"
                                type="search"
                                value={stampSearchQuery}
                                onChange={(event) => setStampSearchQuery(event.target.value)}
                                placeholder={searchStampPatternsLabel}
                                aria-label={searchStampPatternsLabel}
                              />
                              <details className="grid-controls-stamp-category-filter">
                                <summary
                                  className={`grid-controls-stamp-category-filter-trigger${selectedStampCategory !== 'all' ? ' is-active' : ''}`}
                                  aria-label={filterStampCategoryLabel}
                                  title={filterStampCategoryLabel}
                                >
                                  <Filter size={12} aria-hidden="true" />
                                </summary>
                                <div className="grid-controls-stamp-category-filter-menu" role="menu" aria-label={filterStampCategoryLabel}>
                                  {visibleStampCategoryOptions.map((categoryOption) => {
                                    const optionLabel = categoryOption === 'all' ? allStampCategoriesLabel : categoryOption;

                                    return (
                                      <button
                                        key={categoryOption}
                                        className="grid-controls-stamp-category-filter-item"
                                        type="button"
                                        role="menuitem"
                                        onClick={(event) => {
                                          setSelectedStampCategory(categoryOption);
                                          closeClosestStampCategoryMenu(event.currentTarget);
                                        }}
                                      >
                                        {optionLabel}
                                      </button>
                                    );
                                  })}
                                </div>
                              </details>
                            </div>
                            <div
                              className="grid-controls-stamp-menu-scroll"
                              style={stampMenuScrollMaxHeight ? { maxHeight: `${stampMenuScrollMaxHeight}px` } : undefined}
                            >
                              <div className="grid-controls-stamp-menu-list" role="menu" aria-label={stampPatternsLabel}>
                                {filteredStampPatterns.map((pattern) => {
                                  const signature = getGridSignature(pattern.grid);
                                  const isActive = activeStampSignature === signature;
                                  const formattedPatternName = formatPatternTitle(pattern.name);
                                  return (
                                    <button
                                      key={pattern.name}
                                      className={`grid-controls-stamp-menu-item${isActive ? ' is-active' : ''}`}
                                      type="button"
                                      role="menuitem"
                                      onClick={(event) => handleStampPatternSelection(event, pattern)}
                                    >
                                      <PatternPreview grid={pattern.grid} size={34} palette={selectedPalette} />
                                      <span className="grid-controls-stamp-menu-item-meta">
                                        <span>{highlightSearchMatch(formattedPatternName)}</span>
                                        <span className="grid-controls-stamp-menu-category">{highlightSearchMatch(pattern.category)}</span>
                                      </span>
                                    </button>
                                  );
                                })}
                                {filteredStampPatterns.length === 0 && (
                                  <p className="grid-controls-stamp-search-empty">{t('controls.noStampPatternsFound')}</p>
                                )}
                              </div>
                              {selectedPattern && (
                                <div className="grid-controls-stamp-menu-current" aria-live="polite">
                                  <p className="grid-controls-stamp-menu-current-label">{currentStampSelectionLabel}</p>
                                  <div className="grid-controls-stamp-menu-item is-active">
                                    <PatternPreview grid={stampPreviewPattern ?? selectedPattern.grid} size={34} palette={selectedPalette} />
                                    <span className="grid-controls-stamp-menu-item-meta">
                                      <span>{formatPatternTitle(stampTooltipName)}</span>
                                      <span className="grid-controls-stamp-menu-category">{selectedPattern.category}</span>
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </details>
                      </span>
                      <span className="control-tooltip-trigger" data-tooltip={`${rotateStampLabel} (${rotateStampHotkeyLabel})`}>
                        <button
                            className={`btn btn-sm ${activeEditTool === 'stamp' ? 'btn-primary' : 'btn-secondary-neutral'} grid-controls-edit-tool-button grid-controls-edit-tool-button-right grid-controls-stamp-rotate${isRotateStampKeyPressed ? ' is-key-pressed' : ''}`}
                          type="button"
                          onClick={onRotateStamp}
                          aria-label={rotateStampLabel}
                        >
                          <RotateCw size={12} />
                        </button>
                      </span>
                    </div>
                    <span className="control-tooltip-trigger" data-tooltip={fillSelectionLabel}>
                      <button
                        className="btn btn-sm btn-secondary-neutral"
                        type="button"
                        onClick={() => onFillSelectionColor?.()}
                        aria-label={fillSelectionLabel}
                      >
                        <PaintBucket size={12} />
                      </button>
                    </span>
                    <span className="control-tooltip-trigger" data-tooltip={eraserLabel}>
                      <button
                        className={`btn btn-sm ${activeEditTool === 'eraser' ? 'btn-primary' : 'btn-secondary-neutral'}`}
                        type="button"
                        onClick={() => onEditToolChange?.('eraser')}
                        aria-label={eraserLabel}
                      >
                        <Eraser size={12} />
                      </button>
                    </span>
                    <span className="control-tooltip-trigger" data-tooltip={undoLabel}>
                      <button
                        className="btn btn-sm btn-secondary-neutral"
                        type="button"
                        onClick={onUndoBoardChange}
                        disabled={!canUndoBoardChange}
                        aria-label={undoLabel}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {showEditControls && (
            <div className="grid-controls-section">
              <span className="wm-slider-label grid-controls-label">{t('controls.hoveredCell')}</span>
              <div className="grid-controls-field-wrap">
                <span className="grid-controls-coordinate-readout">
                  {hoveredCoordinate ?? t('controls.hoveredCellNone')}
                </span>
              </div>
            </div>
          )}

          {showEditControls && (
            <div className="grid-controls-section grid-controls-section-end">
              <div className="grid-controls-field-wrap">
                <label htmlFor="palette-select" className="wm-slider-label grid-controls-label">
                  {colorPaletteLabel}
                </label>
                <details className={`grid-controls-color-picker grid-controls-color-picker-${selectedPaletteId}`} aria-label={colorPaletteLabel}>
                    <summary className="grid-controls-color-picker-trigger" aria-label={colorPaletteLabel}>
                      <span className="grid-controls-color-picker-dot" style={{ backgroundColor: selectedDrawColor }} aria-hidden="true"></span>
                    </summary>
                    <div className="grid-controls-color-picker-panel">
                      <p className="grid-controls-color-picker-title">{colorPaletteLabel}</p>
                      <p className="grid-controls-color-group-label">{systemColorsLabel}</p>
                      <div className="grid-controls-color-swatch-grid">
                        {SYSTEM_DRAW_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
                            type="button"
                            aria-label={`${systemColorsLabel} ${color}`}
                            title={color}
                            style={{ backgroundColor: color }}
                            onClick={(event) => handleSystemColorSelect(event, color)}
                            disabled={isGameRunning}
                          ></button>
                        ))}
                      </div>
                      <p className="grid-controls-color-group-label">{customColorsLabel}</p>
                      <div className="grid-controls-color-swatch-grid grid-controls-color-swatch-grid-custom">
                        {customColorSlots.map((color, index) => (
                          <button
                            key={`${color}-${index}`}
                            className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
                            type="button"
                            aria-label={`${customColorsLabel} ${index + 1} ${color}`}
                            title={color}
                            style={{ backgroundColor: color }}
                            onClick={(event) => handleCustomColorSelect(event, color, index)}
                            disabled={isGameRunning}
                          ></button>
                        ))}
                      </div>
                      <div className="grid-controls-custom-color-row">
                        <label className="grid-controls-custom-color-label" htmlFor="custom-draw-color-sidebar">{customColorLabel}</label>
                        <div className="grid-controls-custom-color-inputs">
                          <input
                            id="custom-draw-color-sidebar"
                            className="grid-controls-color-native-input"
                            type="color"
                            value={selectedDrawColor}
                            onChange={(event) => {
                              onDrawColorChange(event.target.value);
                              setCustomHexValue(event.target.value);
                              setCustomColorSlots((previous) => {
                                const next = [...previous];
                                next[activeCustomSlotIndex] = event.target.value;
                                return next;
                              });
                            }}
                            disabled={isGameRunning}
                            aria-label={customColorLabel}
                          />
                          <input
                            className="grid-controls-color-hex-input"
                            type="text"
                            inputMode="text"
                            value={customHexValue}
                            onChange={(event) => setCustomHexValue(event.target.value)}
                            onBlur={(event) => applyCustomHex(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                const committedColor = applyCustomHex(customHexValue);
                                if (committedColor) {
                                  onCustomColorCommitted?.(committedColor);
                                  closeClosestColorMenu(event.currentTarget);
                                }
                              }
                            }}
                            placeholder="#22c55e"
                            aria-label={customColorHexLabel}
                            disabled={isGameRunning}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default GridControls;
