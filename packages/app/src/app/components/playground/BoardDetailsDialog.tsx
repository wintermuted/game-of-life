import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardPersistence } from './useBoardPersistence';

export function BoardDetailsDialog(props: {
  metadata: Pick<PlaygroundMetadata, 'draftCategoryOptions'>;
  persistence: Pick<
    BoardPersistence,
    | 'isDraftSaveConfirmModalOpen'
    | 'draftSaveModalMode'
    | 'draftSaveName'
    | 'setDraftSaveName'
    | 'draftSaveCategory'
    | 'setDraftSaveCategory'
    | 'draftSaveDescription'
    | 'setDraftSaveDescription'
    | 'draftSaveTags'
    | 'setDraftSaveTags'
    | 'draftSaveVisibility'
    | 'setDraftSaveVisibility'
    | 'closeDraftSaveConfirmModal'
    | 'confirmDraftSave'
  >;
}): React.JSX.Element {
  const { draftCategoryOptions } = props.metadata;
  const {
    isDraftSaveConfirmModalOpen,
    draftSaveModalMode,
    draftSaveName,
    setDraftSaveName,
    draftSaveCategory,
    setDraftSaveCategory,
    draftSaveDescription,
    setDraftSaveDescription,
    draftSaveTags,
    setDraftSaveTags,
    draftSaveVisibility,
    setDraftSaveVisibility,
    closeDraftSaveConfirmModal,
    confirmDraftSave,
  } = props.persistence;
  const { t } = useTranslation();
  return (
    <>
      {isDraftSaveConfirmModalOpen && (
        <div className="wm-modal-overlay" onClick={closeDraftSaveConfirmModal}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-save-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="draft-save-modal-title" className="wm-modal-title">
                {t(
                  draftSaveModalMode === 'edit'
                    ? 'playground.confirmDraftEditTitle'
                    : 'playground.confirmDraftSaveTitle',
                )}
              </h3>
            </div>
            <div className="wm-modal-body playground-board-form">
              <label htmlFor="draft-save-name-input" className="wm-input-label">
                {t('playground.patternName')}
              </label>
              <input
                id="draft-save-name-input"
                className="wm-input"
                type="text"
                value={draftSaveName}
                onChange={(e) => setDraftSaveName(e.target.value)}
                placeholder={t('playground.confirmDraftSaveNamePlaceholder')}
                autoFocus
              />
              <label htmlFor="draft-save-category-select" className="wm-input-label">
                {t('playground.confirmDraftSaveCategoryLabel')}
              </label>
              <select
                id="draft-save-category-select"
                className="wm-input"
                value={draftSaveCategory}
                onChange={(e) => setDraftSaveCategory(e.target.value)}
              >
                <option value="" disabled>
                  {t('playground.confirmDraftSaveCategoryPlaceholder')}
                </option>
                {draftCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <label htmlFor="draft-save-description-input" className="wm-input-label">
                {t('playground.infoDescriptionLabel')}
              </label>
              <textarea
                id="draft-save-description-input"
                className="wm-input"
                value={draftSaveDescription}
                onChange={(e) => setDraftSaveDescription(e.target.value)}
                placeholder={t('playground.confirmDraftSaveDescriptionPlaceholder')}
                rows={3}
              />
              <label htmlFor="draft-save-tags-input" className="wm-input-label">
                {t('playground.confirmDraftSaveTagsLabel')}
              </label>
              <input
                id="draft-save-tags-input"
                className="wm-input"
                type="text"
                value={draftSaveTags}
                onChange={(e) => setDraftSaveTags(e.target.value)}
                placeholder={t('playground.confirmDraftSaveTagsPlaceholder')}
              />
              <fieldset className="playground-visibility-toggle-group">
                <legend className="wm-input-label">
                  {t('playground.confirmDraftSaveVisibilityLabel')}
                </legend>
                <label className="playground-visibility-toggle-option">
                  <input
                    type="radio"
                    name="draft-save-visibility"
                    value="public"
                    checked={draftSaveVisibility === 'public'}
                    onChange={() => setDraftSaveVisibility('public')}
                  />
                  <span>{t('playground.visibilityPublic')}</span>
                </label>
                <label className="playground-visibility-toggle-option">
                  <input
                    type="radio"
                    name="draft-save-visibility"
                    value="private"
                    checked={draftSaveVisibility === 'private'}
                    onChange={() => setDraftSaveVisibility('private')}
                  />
                  <span>{t('playground.visibilityPrivate')}</span>
                </label>
              </fieldset>
            </div>
            <div className="wm-modal-footer">
              <button
                className="btn btn-secondary btn-outline"
                type="button"
                onClick={closeDraftSaveConfirmModal}
              >
                {t('dialogs.cancel')}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={confirmDraftSave}
                disabled={!draftSaveName.trim() || !draftSaveCategory.trim()}
              >
                {t('playground.confirmDraftSaveAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
