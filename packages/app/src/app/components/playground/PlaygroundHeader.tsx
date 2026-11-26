import { BoardHeader } from '@game-of-life/ui-controls';
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
    'saveTemplate' | 'openDraftSaveConfirmModal' | 'openEditNameModal'
  >;
  social: Pick<BoardSocial, 'setActivePopularityModal' | 'toggleCurrentPatternStar'>;
  diagnostics: Pick<BoardDiagnostics, 'canSaveTemplate'>;
}): React.JSX.Element {
  const { metadata, persistence, social } = props;
  return (
    <BoardHeader
      isEditMode={props.board.isEditMode}
      isSystemPattern={metadata.isSystemPattern}
      forkOriginTitle={metadata.forkOrigin?.parentTitle}
      isUnsavedDraftBoard={metadata.isUnsavedDraftBoard}
      isUnsavedEditableBoard={metadata.isUnsavedEditableBoard}
      title={metadata.headerTitle}
      stars={metadata.patternStars}
      forks={metadata.patternForks}
      starred={metadata.isStarredByCurrentUser}
      canSave={props.diagnostics.canSaveTemplate}
      onRename={persistence.openEditNameModal}
      onSave={() => persistence.saveTemplate(false)}
      onSaveDraft={() => persistence.openDraftSaveConfirmModal('save')}
      onToggleStar={social.toggleCurrentPatternStar}
      onViewForks={() => social.setActivePopularityModal('forks')}
    />
  );
}
