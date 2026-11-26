import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'lucide-react';
import { useDrawColors } from '../hooks/useDrawColors';
import type { GridControlsProps } from './GridControls.types';
import { DrawColorPicker } from './DrawColorPicker';
import { PlaybackControls } from './PlaybackControls';
import { EditToolControls } from './EditToolControls';

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
}: GridControlsProps): ReactElement {
  const { t } = useTranslation();
  const showPlayControls = variant === 'play';
  const showEditControls = variant === 'edit';
  const sectionLabel = showPlayControls ? t('controls.playControls') : t('controls.editControls');
  const copyLabel = t('controls.copyUrl');
  const colorPaletteLabel = showPlayControls ? t('controls.drawColor') : t('colors.title');
  const colors = useDrawColors({ selectedDrawColor, onDrawColorChange, onPaletteChange });
  const [stampSearchQuery, setStampSearchQuery] = useState('');
  const [stampCategory, setStampCategory] = useState('all');

  return (
    <div className="GridControls">
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`grid-controls-form grid-controls-form-${variant}`}
      >
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
              <PlaybackControls
                isEditMode={isEditMode}
                isSystemPattern={isSystemPattern}
                activeEditTool={activeEditTool}
                onEditToolChange={onEditToolChange}
                onEnterEditMode={onEnterEditMode}
                onEnterPlayMode={onEnterPlayMode}
                isGameRunning={isGameRunning}
                toggleGame={toggleGame}
                nextGeneration={nextGeneration}
                onResetRequested={onResetRequested}
                generationSpeed={generationSpeed}
                updateGenerationSpeed={updateGenerationSpeed}
              />
              {isEditMode && (
                <EditToolControls
                  draftValue={colors.customHexValue}
                  onDraftChange={colors.setCustomHexValue}
                  customColors={colors.customColorSlots}
                  onSelect={colors.selectColor}
                  onChange={colors.changeColor}
                  searchQuery={stampSearchQuery}
                  onSearchQueryChange={setStampSearchQuery}
                  selectedCategory={stampCategory}
                  onCategoryChange={setStampCategory}
                  stampPattern={stampPattern}
                  onStampPatternSelect={onStampPatternSelect}
                  rotateStampKeyPressToken={rotateStampKeyPressToken}
                  activeEditTool={activeEditTool}
                  onEditToolChange={onEditToolChange}
                  onFillSelectionColor={onFillSelectionColor}
                  onUndoBoardChange={onUndoBoardChange}
                  canUndoBoardChange={canUndoBoardChange}
                  selectedPaletteId={selectedPaletteId}
                  selectedDrawColor={selectedDrawColor}
                  isGameRunning={isGameRunning}
                  onCustomColorCommitted={onCustomColorCommitted}
                  stampPreviewPattern={stampPreviewPattern}
                  stampPatternName={stampPatternName}
                  stampRotation={stampRotation}
                  onRotateStamp={onRotateStamp}
                />
              )}
            </>
          )}

          {showEditControls && (
            <div className="grid-controls-section">
              <span className="wm-slider-label grid-controls-label">
                {t('controls.hoveredCell')}
              </span>
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
                <DrawColorPicker
                  variant="edit"
                  draftValue={colors.customHexValue}
                  onDraftChange={colors.setCustomHexValue}
                  customColors={colors.customColorSlots}
                  onSelect={colors.selectColor}
                  onChange={colors.changeColor}
                  selectedPaletteId={selectedPaletteId}
                  selectedDrawColor={selectedDrawColor}
                  isGameRunning={isGameRunning}
                  onCustomColorCommitted={onCustomColorCommitted}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default GridControls;
