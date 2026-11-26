import { useId, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { BoardNameForm } from '@game-of-life/ui-patterns';
import type { BoardPersistence } from './useBoardPersistence';

export function BoardNameDialog({
  persistence,
}: {
  persistence: Pick<
    BoardPersistence,
    | 'isEditNameModalOpen'
    | 'patternNameDraft'
    | 'setPatternNameDraft'
    | 'nameModalMode'
    | 'closeEditNameModal'
    | 'confirmEditNameModal'
  >;
}): JSX.Element | null {
  const titleId = useId();
  const { t } = useTranslation();
  if (!persistence.isEditNameModalOpen) return null;
  return (
    <div className="wm-modal-overlay" onClick={persistence.closeEditNameModal}>
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
              persistence.nameModalMode === 'fork'
                ? 'playground.forkTitle'
                : 'playground.editTitle',
            )}
          </h3>
        </div>
        <BoardNameForm
          name={persistence.patternNameDraft}
          mode={persistence.nameModalMode}
          onNameChange={persistence.setPatternNameDraft}
          onSubmit={persistence.confirmEditNameModal}
          onCancel={persistence.closeEditNameModal}
          autoFocus
        />
      </div>
    </div>
  );
}
