import { NumberStepper } from '@game-of-life/ui-staging';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightLeft,
  ChevronRight,
  Hand,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Square,
} from 'lucide-react';
import type { GridControlsProps } from './GridControls.types';

const GENERATION_SPEED_MIN = 1;
const GENERATION_SPEED_MAX = 10;

type Props = Pick<
  GridControlsProps,
  | 'isEditMode'
  | 'isSystemPattern'
  | 'activeEditTool'
  | 'onEditToolChange'
  | 'onEnterEditMode'
  | 'onEnterPlayMode'
  | 'isGameRunning'
  | 'toggleGame'
  | 'nextGeneration'
  | 'onResetRequested'
  | 'generationSpeed'
  | 'updateGenerationSpeed'
>;

export function PlaybackControls({
  isEditMode,
  isSystemPattern,
  activeEditTool,
  onEditToolChange,
  onEnterEditMode,
  onEnterPlayMode,
  isGameRunning,
  toggleGame,
  nextGeneration,
  onResetRequested,
  generationSpeed,
  updateGenerationSpeed,
}: Props): ReactElement {
  const { t } = useTranslation();
  const toggleLabel = isGameRunning ? t('controls.pause') : t('controls.start');
  const nextLabel = t('controls.next');
  const resetLabel = t('controls.reset');
  const generationSpeedLabel = t('controls.generationSpeed');
  const decreaseSpeedLabel = t('controls.generationSpeedDecrease');
  const increaseSpeedLabel = t('controls.generationSpeedIncrease');
  const currentSpeedLabel = t('controls.generationSpeedValue', { level: generationSpeed });
  const modeToggleLabel = isEditMode ? t('nav.play') : t('controls.edit');
  const modeToggleHotkeyLabel = t('controls.modeToggleHotkey');
  const grabPanLabel = t('controls.grabPan');
  const selectionLabel = t('controls.selection');
  const controlsDisabled = isEditMode;

  return (
    <>
      <div className="grid-controls-section grid-controls-section-mode-toggle">
        <div className="grid-controls-actions-row">
          <span
            className="control-tooltip-trigger"
            data-tooltip={`${modeToggleLabel} (${modeToggleHotkeyLabel})`}
          >
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
              <NumberStepper
                value={generationSpeed}
                min={GENERATION_SPEED_MIN}
                max={GENERATION_SPEED_MAX}
                step={1}
                onChange={updateGenerationSpeed}
                disabled={controlsDisabled}
                label={generationSpeedLabel}
                decreaseLabel={decreaseSpeedLabel}
                increaseLabel={increaseSpeedLabel}
                valueLabel={currentSpeedLabel}
                decreaseIcon={<Minus size={12} />}
                increaseIcon={<Plus size={12} />}
                tooltipPlacement="right"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
