import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Eraser, Hand, PaintBucket, Pencil, RotateCcw, Square } from 'lucide-react';
import type { DrawColors } from '../hooks/useDrawColors';
import type { StampPatterns } from '../hooks/useStampPatterns';
import type { StampMenu } from '../hooks/useStampMenu';
import type { GridControlsProps } from './GridControls.types';
import { DrawColorPicker } from './DrawColorPicker';
import { StampPicker } from './StampPicker';

interface Props extends Pick<
  GridControlsProps,
  | 'activeEditTool'
  | 'onEditToolChange'
  | 'onFillSelectionColor'
  | 'onUndoBoardChange'
  | 'canUndoBoardChange'
  | 'selectedPaletteId'
  | 'selectedDrawColor'
  | 'isGameRunning'
  | 'onCustomColorCommitted'
  | 'stampPreviewPattern'
  | 'stampPatternName'
  | 'stampRotation'
  | 'onRotateStamp'
> {
  colors: DrawColors;
  stamps: StampPatterns;
  menu: StampMenu;
}

export function EditToolControls({
  colors,
  stamps,
  menu,
  activeEditTool,
  onEditToolChange,
  onFillSelectionColor,
  onUndoBoardChange,
  canUndoBoardChange,
  selectedPaletteId,
  selectedDrawColor,
  isGameRunning,
  onCustomColorCommitted,
  stampPreviewPattern,
  stampPatternName,
  stampRotation,
  onRotateStamp,
}: Props): ReactElement {
  const { t } = useTranslation();
  const pencilLabel = t('controls.pencil');
  const eraserLabel = t('controls.eraser');
  const grabPanLabel = t('controls.grabPan');
  const selectionLabel = t('controls.selection');
  const fillSelectionLabel = t('controls.fillSelection');
  const undoLabel = t('controls.undo');

  return (
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
          <DrawColorPicker
            variant="play"
            colors={colors}
            selectedPaletteId={selectedPaletteId}
            selectedDrawColor={selectedDrawColor}
            isGameRunning={isGameRunning}
            onCustomColorCommitted={onCustomColorCommitted}
          />
        </div>
        <StampPicker
          stamps={stamps}
          menu={menu}
          selectedPaletteId={selectedPaletteId}
          activeEditTool={activeEditTool}
          onEditToolChange={onEditToolChange}
          stampPreviewPattern={stampPreviewPattern}
          stampPatternName={stampPatternName}
          stampRotation={stampRotation}
          onRotateStamp={onRotateStamp}
        />
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
  );
}
