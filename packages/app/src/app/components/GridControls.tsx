import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
  copyCurrentURL: () => void;
  isEditMode?: boolean;
  toggleEditMode?: () => void;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  resetBoard,
  toggleGame,
  isGameRunning,
  copyCurrentURL,
  isEditMode = false,
  toggleEditMode
}: Props) {
  const [showResetModal, setShowResetModal] = useState(false);
  const { t } = useTranslation();

  function confirmReset() {
    resetBoard();
    setShowResetModal(false);
  }

  function cancelReset() {
    setShowResetModal(false);
  }

  return (
    <div className="GridControls">
      <form onSubmit={(e) => e.preventDefault()}>
        <h5>{t('controls.title')}</h5>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            className={`btn ${isGameRunning ? 'btn-warning' : 'btn-success'}`}
            type="button"
            onClick={toggleGame}
          >
            {isGameRunning ? t('controls.pause') : t('controls.start')}
          </button>
          <button className="btn btn-secondary" type="button" onClick={nextGeneration}>
            {t('controls.next')}
          </button>
          <button
            className="btn btn-danger btn-outline"
            type="button"
            onClick={() => setShowResetModal(true)}
            disabled={isGameRunning}
          >
            {t('controls.reset')}
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btn btn-secondary btn-outline"
            type="button"
            onClick={copyCurrentURL}
            style={{ width: '100%' }}
          >
            {t('controls.copyUrl')}
          </button>
        </div>

        {toggleEditMode && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              className={`btn ${isEditMode ? 'btn-primary' : 'btn-secondary btn-outline'}`}
              type="button"
              onClick={toggleEditMode}
              disabled={isGameRunning}
              style={{ width: '100%' }}
            >
              {t('controls.editMode')}
            </button>
          </div>
        )}

        <h5>{t('controls.variables')}</h5>
        <div className="wm-slider-row">
          <span className="wm-slider-label">{t('controls.generationSpeed')}</span>
          <span className="wm-slider-value">{generationSpeed}</span>
        </div>
        <input
          type="range"
          className="wm-slider"
          name="generationSpeed"
          min={1}
          max={10}
          step={1}
          value={generationSpeed}
          onChange={(e) => updateGenerationSpeed(Number(e.target.value))}
          style={{ marginBottom: '1rem' }}
        />
      </form>

      {showResetModal && (
        <div className="modal-overlay" onClick={cancelReset}>
          <div className="modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('dialogs.confirmReset')}</h3>
            </div>
            <div className="modal-body">
              <p>{t('dialogs.resetMessage')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={cancelReset}>
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-danger" type="button" onClick={confirmReset}>
                {t('dialogs.yesReset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GridControls;