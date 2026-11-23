import { PatternSelector } from '@game-of-life/ui-patterns';
import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { StampEditing } from './useStampEditing';
import type { BoardPresentation } from './useBoardPresentation';

export function InsertPatternDialog(props: {
  stamp: Pick<
    StampEditing,
    'contextInsertCoordinate' | 'closeInsertPatternModal' | 'handleInsertSystemPattern'
  >;
  presentation: Pick<BoardPresentation, 'selectedPaletteId'>;
}): React.JSX.Element {
  const { contextInsertCoordinate, closeInsertPatternModal, handleInsertSystemPattern } =
    props.stamp;
  const { selectedPaletteId } = props.presentation;
  const { t } = useTranslation();
  return (
    <>
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
              <h3 id="insert-pattern-modal-title" className="wm-modal-title">
                {t('playground.insertSystemPattern')}
              </h3>
            </div>
            <div className="wm-modal-body">
              <PatternSelector
                onSelectPattern={handleInsertSystemPattern}
                selectedPaletteId={selectedPaletteId}
              />
            </div>
            <div className="wm-modal-footer">
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={closeInsertPatternModal}
              >
                {t('dialogs.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
