import { useId, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { BoardDetailsForm } from '@game-of-life/ui-patterns';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardPersistence } from './useBoardPersistence';

export function BoardDetailsDialog({
  metadata,
  persistence,
}: {
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
}): JSX.Element | null {
  const titleId = useId();
  const { t } = useTranslation();
  if (!persistence.isDraftSaveConfirmModalOpen) return null;
  return (
    <div className="wm-modal-overlay" onClick={persistence.closeDraftSaveConfirmModal}>
      <div
        className="wm-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wm-modal-header">
          <h3 id={titleId} className="wm-modal-title">
            {t(
              persistence.draftSaveModalMode === 'edit'
                ? 'playground.confirmDraftEditTitle'
                : 'playground.confirmDraftSaveTitle',
            )}
          </h3>
        </div>
        <BoardDetailsForm
          values={{
            name: persistence.draftSaveName,
            category: persistence.draftSaveCategory,
            description: persistence.draftSaveDescription,
            tags: persistence.draftSaveTags,
            visibility: persistence.draftSaveVisibility,
          }}
          categoryOptions={metadata.draftCategoryOptions}
          onChange={(values) => {
            persistence.setDraftSaveName(values.name);
            persistence.setDraftSaveCategory(values.category);
            persistence.setDraftSaveDescription(values.description);
            persistence.setDraftSaveTags(values.tags);
            persistence.setDraftSaveVisibility(values.visibility);
          }}
          onSubmit={persistence.confirmDraftSave}
          onCancel={persistence.closeDraftSaveConfirmModal}
          autoFocus
        />
      </div>
    </div>
  );
}
