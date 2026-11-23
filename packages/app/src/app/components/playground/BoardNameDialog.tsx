import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { BoardPersistence } from './useBoardPersistence';

export function BoardNameDialog(props: {
  persistence: Pick<
    BoardPersistence,
    | 'isEditNameModalOpen'
    | 'patternNameDraft'
    | 'setPatternNameDraft'
    | 'nameModalMode'
    | 'closeEditNameModal'
    | 'confirmEditNameModal'
  >;
}): React.JSX.Element {
  const {
    isEditNameModalOpen,
    patternNameDraft,
    setPatternNameDraft,
    nameModalMode,
    closeEditNameModal,
    confirmEditNameModal,
  } = props.persistence;
  const { t } = useTranslation();
  return (
    <>
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
              <h3 id="edit-name-modal-title" className="wm-modal-title">
                {nameModalMode === 'fork' ? t('playground.forkTitle') : t('playground.editTitle')}
              </h3>
            </div>
            <div className="wm-modal-body">
              <label htmlFor="pattern-name-input" className="wm-input-label">
                {t('playground.patternName')}
              </label>
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
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={closeEditNameModal}
              >
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-primary" type="button" onClick={confirmEditNameModal}>
                {nameModalMode === 'fork' ? t('playground.createFork') : t('playground.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
