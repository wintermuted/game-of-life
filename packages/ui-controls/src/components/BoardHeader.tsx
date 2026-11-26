import { ChevronDown, GitFork, Pencil, Save, SaveAll, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type * as React from 'react';
export interface BoardHeaderProps {
  isEditMode: boolean;
  isSystemPattern: boolean;
  forkOriginTitle?: string;
  isUnsavedDraftBoard: boolean;
  isUnsavedEditableBoard: boolean;
  title: string;
  stars: number;
  forks: number;
  starred: boolean;
  canSave: boolean;
  onRename: () => void;
  onSave: () => void;
  onSaveDraft: () => void;
  onToggleStar: () => void;
  onViewForks: () => void;
}

export function BoardHeader(props: BoardHeaderProps): React.JSX.Element {
  const {
    isEditMode,
    isSystemPattern,
    forkOriginTitle,
    isUnsavedDraftBoard,
    isUnsavedEditableBoard,
    title: headerTitle,
    stars: patternStars,
    forks: patternForks,
    starred: isStarredByCurrentUser,
    onRename: openEditNameModal,
    onSave,
    onSaveDraft,
    onToggleStar: toggleCurrentPatternStar,
    onViewForks,
    canSave: canSaveTemplate,
  } = props;
  const { t } = useTranslation();
  function runMenuAction(event: React.MouseEvent<HTMLButtonElement>, action: () => void): void {
    event.currentTarget.closest('details')?.removeAttribute('open');
    action();
  }
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
            {!isEditMode && !isUnsavedDraftBoard && forkOriginTitle ? (
              <div
                className="playground-header-meta-row"
                aria-label={t('playground.patternMetadata')}
              >
                <span className="wm-badge wm-badge-neutral playground-header-meta-badge">
                  {t('playground.forkedFrom', { name: forkOriginTitle })}
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
                  onClick={onViewForks}
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
                onClick={onSaveDraft}
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
                  onClick={onSave}
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
                      onClick={(event) => runMenuAction(event, onSave)}
                      disabled={!canSaveTemplate}
                    >
                      <Save size={12} aria-hidden="true" />
                      <span>{t('playground.save')}</span>
                    </button>
                    <button
                      className="playground-save-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={(event) => runMenuAction(event, openEditNameModal)}
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
