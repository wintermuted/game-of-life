import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronRight, RotateCcw, Link, Pencil } from 'lucide-react';
import { COLOR_PALETTES } from '../constants/colors';

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  onResetRequested: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
  copyCurrentURL: () => void;
  selectedPaletteId: string;
  onPaletteChange: (paletteId: string) => void;
  isEditMode?: boolean;
  toggleEditMode?: () => void;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  onResetRequested,
  toggleGame,
  isGameRunning,
  copyCurrentURL,
  selectedPaletteId,
  onPaletteChange,
  isEditMode = false,
  toggleEditMode
}: Props) {
  const { t } = useTranslation();
  const toggleLabel = isGameRunning ? t('controls.pause') : t('controls.start');
  const nextLabel = t('controls.next');
  const resetLabel = t('controls.reset');
  const copyLabel = t('controls.copyUrl');
  const editLabel = t('controls.editMode');

  return (
    <div className="GridControls">
      <form onSubmit={(e) => e.preventDefault()} className="grid-controls-form">
        <div className="controls-main-row">
          <div className="grid-controls-section grid-controls-section-start">
            <span className="wm-slider-label grid-controls-label">
              Game Controls
            </span>
            <div className="grid-controls-actions-row">
              <div className="btn-group">
              <button
                className="btn btn-sm btn-primary-neutral"
                type="button"
                onClick={toggleGame}
                aria-label={toggleLabel}
                title={toggleLabel}
              >
                {isGameRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                className="btn btn-sm btn-secondary-neutral"
                type="button"
                onClick={nextGeneration}
                aria-label={nextLabel}
                title={nextLabel}
              >
                <ChevronRight size={12} />
              </button>
              <button
                className="btn btn-sm btn-secondary-neutral"
                type="button"
                onClick={onResetRequested}
                disabled={isGameRunning}
                aria-label={resetLabel}
                title={resetLabel}
              >
                <RotateCcw size={12} />
              </button>
            </div>
            <button
              className="btn btn-sm btn-secondary-neutral"
              type="button"
              onClick={copyCurrentURL}
              aria-label={copyLabel}
              title={copyLabel}
            >
              <Link size={12} />
            </button>
            {toggleEditMode && (
              <button
                className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-secondary-neutral'}`}
                type="button"
                onClick={toggleEditMode}
                disabled={isGameRunning}
                aria-label={editLabel}
                title={editLabel}
              >
                <Pencil size={12} />
              </button>
            )}
            </div>
          </div>

          <div className="grid-controls-section">
            <span className="wm-slider-label grid-controls-label">
              {t('controls.generationSpeed')}
            </span>
            <div className="grid-controls-field-wrap">
              <div className="grid-controls-slider-row">
                <input
                  type="range"
                  className="wm-slider wm-slider-compact grid-controls-slider"
                  name="generationSpeed"
                  aria-label={t('controls.generationSpeed')}
                  min={1}
                  max={10}
                  step={1}
                  value={generationSpeed}
                  onChange={(e) => updateGenerationSpeed(Number(e.target.value))}
                />
                <span className="wm-slider-value grid-controls-slider-value">{generationSpeed}</span>
              </div>
            </div>
          </div>

          <div className="grid-controls-section grid-controls-section-end">
            <div className="grid-controls-field-wrap">
              <label htmlFor="palette-select" className="wm-slider-label grid-controls-label">
                {t('colors.title')}
              </label>
              <select
                id="palette-select"
                className={`grid-controls-palette-select grid-controls-palette-select-${selectedPaletteId}`}
                value={selectedPaletteId}
                onChange={(e) => onPaletteChange(e.target.value)}
                disabled={isGameRunning}
              >
                {COLOR_PALETTES.map((palette) => (
                  <option key={palette.id} value={palette.id}>
                    {palette.name} ({palette.liveCell})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default GridControls;