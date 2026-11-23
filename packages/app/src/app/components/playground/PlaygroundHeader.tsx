import { ChevronDown, GitFork, Pencil, Save, SaveAll, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardPersistence } from './useBoardPersistence';
import type { BoardSocial } from './useBoardSocial';
import type { BoardDiagnostics } from './useBoardDiagnostics';

export function PlaygroundHeader(props: {
  board: Pick<PlaygroundBoardState, 'isEditMode'>;
  metadata: Pick<
    PlaygroundMetadata,
    | 'isSystemPattern'
    | 'forkOrigin'
    | 'isUnsavedDraftBoard'
    | 'isUnsavedEditableBoard'
    | 'headerTitle'
    | 'patternStars'
    | 'patternForks'
    | 'isStarredByCurrentUser'
  >;
  persistence: Pick<
    BoardPersistence,
    'saveTemplate' | 'openDraftSaveConfirmModal' | 'openEditNameModal' | 'runSaveMenuAction'
  >;
  social: Pick<BoardSocial, 'setActivePopularityModal' | 'toggleCurrentPatternStar'>;
  diagnostics: Pick<BoardDiagnostics, 'canSaveTemplate'>;
}): React.JSX.Element {
  const { isEditMode } = props.board;
  const {
    isSystemPattern,
    forkOrigin,
    isUnsavedDraftBoard,
    isUnsavedEditableBoard,
    headerTitle,
    patternStars,
    patternForks,
    isStarredByCurrentUser,
  } = props.metadata;
  const { saveTemplate, openDraftSaveConfirmModal, openEditNameModal, runSaveMenuAction } =
    props.persistence;
  const { setActivePopularityModal, toggleCurrentPatternStar } = props.social;
  const { canSaveTemplate } = props.diagnostics;
  const { t } = useTranslation();
  return (
    <div className="playground-header">
      <div className="playground-header-title-row">
        <div className="playground-header-title-block">
          <div className="playground-header-title-wrap">
            <h3 className="playground-header-title">
              <span className="playground-header-title-text">{headerTitle}</span>
            </h3>
            {!isSystemPattern ? (
              <button
                className="playground-header-title-edit-btn"
                type="button"
                onClick={openEditNameModal}
                aria-label={t('playground.editTitle')}
                title={t('playground.editTitle')}
              >
                <Pencil size={13} aria-hidden="true" />
              </button>
            ) : null}
            {!isEditMode && !isUnsavedDraftBoard && forkOrigin ? (
              <div
                className="playground-header-meta-row"
                aria-label={t('playground.patternMetadata')}
              >
                <span className="wm-badge wm-badge-neutral playground-header-meta-badge">
                  {t('playground.forkedFrom', { name: forkOrigin.parentTitle })}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        {isUnsavedEditableBoard ? (
          <div className="playground-header-unsaved-note-row">
            <span className="playground-header-unsaved-note">
              {t('playground.unsavedEmptyBoardNotice')}
            </span>
          </div>
        ) : null}
        <div className="playground-header-actions">
          {!isUnsavedDraftBoard || isSystemPattern ? (
            <>
              <button
                className="btn btn-sm btn-secondary-neutral"
                type="button"
                onClick={toggleCurrentPatternStar}
                aria-label={isStarredByCurrentUser ? t('explore.favorited') : t('explore.favorite')}
                title={isStarredByCurrentUser ? t('explore.favorited') : t('explore.favorite')}
              >
                <Star size={12} fill={isStarredByCurrentUser ? 'currentColor' : 'none'} />
                <span>{t('playground.infoStarsLabel', { count: patternStars })}</span>
              </button>
              {isSystemPattern ? (
                <button
                  className="btn btn-sm btn-secondary-neutral"
                  type="button"
                  onClick={() => setActivePopularityModal('forks')}
                  aria-label={t('playground.viewForks')}
                  title={t('playground.viewForks')}
                >
                  <GitFork size={12} />
                  <span>{t('playground.infoForksLabel', { count: patternForks })}</span>
                </button>
              ) : null}
            </>
          ) : null}
          {!isSystemPattern ? (
            isUnsavedDraftBoard ? (
              <button
                className="btn btn-sm btn-primary"
                type="button"
                onClick={() => openDraftSaveConfirmModal('save')}
                aria-label={t('playground.save')}
                title={t('playground.save')}
              >
                <Save size={12} />
                <span>{t('playground.save')}</span>
              </button>
            ) : (
              <div
                className="playground-save-compound"
                role="group"
                aria-label={t('playground.save')}
              >
                <button
                  className="btn btn-sm btn-secondary-neutral"
                  type="button"
                  onClick={() => saveTemplate(false)}
                  aria-label={t('playground.save')}
                  title={t('playground.save')}
                  disabled={!canSaveTemplate}
                >
                  <Save size={12} />
                  <span>{t('playground.save')}</span>
                </button>
                <details className="playground-save-menu">
                  <summary
                    className="playground-save-menu-trigger"
                    aria-label={t('playground.saveOptions')}
                    title={t('playground.saveOptions')}
                  >
                    <ChevronDown size={12} aria-hidden="true" />
                  </summary>
                  <div
                    className="playground-save-menu-panel"
                    role="menu"
                    aria-label={t('playground.saveOptions')}
                  >
                    <button
                      className="playground-save-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={(event) => runSaveMenuAction(event, () => saveTemplate(false))}
                      disabled={!canSaveTemplate}
                    >
                      <Save size={12} aria-hidden="true" />
                      <span>{t('playground.save')}</span>
                    </button>
                    <button
                      className="playground-save-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={(event) => runSaveMenuAction(event, openEditNameModal)}
                    >
                      <SaveAll size={12} aria-hidden="true" />
                      <span>{t('playground.saveAs')}</span>
                    </button>
                  </div>
                </details>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
