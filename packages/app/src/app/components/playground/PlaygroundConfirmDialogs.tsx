import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { PlaygroundRulesActions } from './usePlaygroundRules';
import type { BoardSocial } from './useBoardSocial';
import type { BoardTransitions } from './useBoardTransitions';

export function PlaygroundConfirmDialogs(props: {
  metadata: Pick<PlaygroundMetadata, 'headerTitle'>;
  ruleActions: Pick<
    PlaygroundRulesActions,
    'isUnlockRulesModalOpen' | 'closeUnlockRulesModal' | 'confirmUnlockRules'
  >;
  social: Pick<
    BoardSocial,
    | 'isRemoveStarConfirmModalOpen'
    | 'cancelRemoveCurrentPatternStar'
    | 'confirmRemoveCurrentPatternStar'
  >;
  transitions: Pick<
    BoardTransitions,
    'isResetModalOpen' | 'confirmResetBoard' | 'cancelResetBoard'
  >;
}): React.JSX.Element {
  const { headerTitle } = props.metadata;
  const { isUnlockRulesModalOpen, closeUnlockRulesModal, confirmUnlockRules } = props.ruleActions;
  const {
    isRemoveStarConfirmModalOpen,
    cancelRemoveCurrentPatternStar,
    confirmRemoveCurrentPatternStar,
  } = props.social;
  const { isResetModalOpen, confirmResetBoard, cancelResetBoard } = props.transitions;
  const { t } = useTranslation();
  return (
    <>
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
              <h3 id="reset-modal-title" className="wm-modal-title">
                {t('dialogs.confirmReset')}
              </h3>
            </div>
            <div className="wm-modal-body">
              <p>{t('dialogs.resetMessage')}</p>
            </div>
            <div className="wm-modal-footer">
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={cancelResetBoard}
              >
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-danger" type="button" onClick={confirmResetBoard}>
                {t('dialogs.yesReset')}
              </button>
            </div>
          </div>
        </div>
      )}
      {isRemoveStarConfirmModalOpen && (
        <div className="wm-modal-overlay" onClick={cancelRemoveCurrentPatternStar}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-star-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="remove-star-modal-title" className="wm-modal-title">
                {t('playground.removeStarConfirmTitle')}
              </h3>
            </div>
            <div className="wm-modal-body">
              <p>{t('playground.removeStarConfirmMessage', { name: headerTitle })}</p>
            </div>
            <div className="wm-modal-footer">
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={cancelRemoveCurrentPatternStar}
              >
                {t('dialogs.cancel')}
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={confirmRemoveCurrentPatternStar}
              >
                {t('playground.removeStarConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}
      {isUnlockRulesModalOpen && (
        <div className="wm-modal-overlay" onClick={closeUnlockRulesModal}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-rules-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="unlock-rules-modal-title" className="wm-modal-title">
                {t('rules.unlockConfirmTitle')}
              </h3>
            </div>
            <div className="wm-modal-body">
              <p>{t('rules.unlockConfirmMessage')}</p>
            </div>
            <div className="wm-modal-footer">
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={closeUnlockRulesModal}
              >
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-primary" type="button" onClick={confirmUnlockRules}>
                {t('rules.unlockConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
