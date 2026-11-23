import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, RotateCw, Stamp } from 'lucide-react';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { getPaletteById } from '@game-of-life/ui';
import type { StampPatterns } from '../hooks/useStampPatterns';
import type { StampMenu } from '../hooks/useStampMenu';
import type { GridControlsProps } from './GridControls.types';
import { formatPatternTitle, getGridSignature, highlightSearchMatch } from './stampSearch';

interface Props extends Pick<
  GridControlsProps,
  | 'selectedPaletteId'
  | 'activeEditTool'
  | 'onEditToolChange'
  | 'stampPreviewPattern'
  | 'stampPatternName'
  | 'stampRotation'
  | 'onRotateStamp'
> {
  stamps: StampPatterns;
  menu: StampMenu;
}

export function StampPicker({
  stamps,
  menu,
  selectedPaletteId,
  activeEditTool,
  onEditToolChange,
  stampPreviewPattern,
  stampPatternName,
  stampRotation,
  onRotateStamp,
}: Props): ReactElement {
  const { t } = useTranslation();
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
  const {
    stampSearchQuery,
    setStampSearchQuery,
    selectedStampCategory,
    setSelectedStampCategory,
    activeStampSignature,
    selectedPattern,
    visibleStampCategoryOptions,
    filteredStampPatterns,
    selectPattern,
    closeCategoryMenu,
  } = stamps;
  const {
    stampMenuRef,
    stampMenuPanelRef,
    stampMenuMaxHeight,
    stampMenuScrollMaxHeight,
    isRotateStampKeyPressed,
  } = menu;

  return (
    <div className="grid-controls-stamp-group">
      <span className="grid-controls-stamp-preview-trigger">
        <details
          className="grid-controls-stamp-menu"
          aria-label={stampPatternsLabel}
          ref={stampMenuRef}
          onToggle={menu.onToggle}
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
                <span className="grid-controls-stamp-preview-popover-title">
                  {stampTooltipName}
                </span>
                <span className="grid-controls-stamp-preview-popover-rotation">
                  {stampRotationLabel}
                </span>
              </span>
            </span>
          )}
          <div
            className="grid-controls-stamp-menu-panel"
            ref={stampMenuPanelRef}
            style={
              stampMenuMaxHeight !== null ? { maxHeight: `${stampMenuMaxHeight}px` } : undefined
            }
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
                <div
                  className="grid-controls-stamp-category-filter-menu"
                  role="menu"
                  aria-label={filterStampCategoryLabel}
                >
                  {visibleStampCategoryOptions.map((categoryOption) => {
                    const optionLabel =
                      categoryOption === 'all' ? allStampCategoriesLabel : categoryOption;

                    return (
                      <button
                        key={categoryOption}
                        className="grid-controls-stamp-category-filter-item"
                        type="button"
                        role="menuitem"
                        onClick={(event) => {
                          setSelectedStampCategory(categoryOption);
                          closeCategoryMenu(event.currentTarget);
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
              style={
                stampMenuScrollMaxHeight
                  ? { maxHeight: `${stampMenuScrollMaxHeight}px` }
                  : undefined
              }
            >
              <div
                className="grid-controls-stamp-menu-list"
                role="menu"
                aria-label={stampPatternsLabel}
              >
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
                      onClick={(event) => selectPattern(event, pattern)}
                    >
                      <PatternPreview grid={pattern.grid} size={34} palette={selectedPalette} />
                      <span className="grid-controls-stamp-menu-item-meta">
                        <span>{highlightSearchMatch(formattedPatternName, stampSearchQuery)}</span>
                        <span className="grid-controls-stamp-menu-category">
                          {highlightSearchMatch(pattern.category, stampSearchQuery)}
                        </span>
                      </span>
                    </button>
                  );
                })}
                {filteredStampPatterns.length === 0 && (
                  <p className="grid-controls-stamp-search-empty">
                    {t('controls.noStampPatternsFound')}
                  </p>
                )}
              </div>
              {selectedPattern && (
                <div className="grid-controls-stamp-menu-current" aria-live="polite">
                  <p className="grid-controls-stamp-menu-current-label">
                    {currentStampSelectionLabel}
                  </p>
                  <div className="grid-controls-stamp-menu-item is-active">
                    <PatternPreview
                      grid={stampPreviewPattern ?? selectedPattern.grid}
                      size={34}
                      palette={selectedPalette}
                    />
                    <span className="grid-controls-stamp-menu-item-meta">
                      <span>{formatPatternTitle(stampTooltipName)}</span>
                      <span className="grid-controls-stamp-menu-category">
                        {selectedPattern.category}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </details>
      </span>
      <span
        className="control-tooltip-trigger"
        data-tooltip={`${rotateStampLabel} (${rotateStampHotkeyLabel})`}
      >
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
  );
}
