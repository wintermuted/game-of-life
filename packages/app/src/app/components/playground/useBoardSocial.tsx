import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toggleFavoriteBoard } from '@game-of-life/api';
import type { Dispatch, SetStateAction } from 'react';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardNotifications } from './useBoardNotifications';
export interface BoardSocial {
  setActivePopularityModal: Dispatch<SetStateAction<'stars' | 'forks' | null>>;
  toggleCurrentPatternStar: () => void;
  isRemoveStarConfirmModalOpen: boolean;
  cancelRemoveCurrentPatternStar: () => void;
  confirmRemoveCurrentPatternStar: () => void;
  activePopularityModal: 'stars' | 'forks' | null;
}

export function useBoardSocial(input: {
  metadata: Pick<
    PlaygroundMetadata,
    'storedProfileName' | 'socialPatternHash' | 'headerTitle' | 'isStarredByCurrentUser'
  >;
  notifications: Pick<BoardNotifications, 'notify'>;
}): BoardSocial {
  const { storedProfileName, socialPatternHash, headerTitle, isStarredByCurrentUser } =
    input.metadata;
  const { notify } = input.notifications;
  const { t } = useTranslation();
  const [isRemoveStarConfirmModalOpen, setIsRemoveStarConfirmModalOpen] = useState(false);

  const [activePopularityModal, setActivePopularityModal] = useState<'stars' | 'forks' | null>(
    null,
  );

  function commitCurrentPatternStarToggle(): void {
    const hash = socialPatternHash;
    if (!hash) return;

    const nextStarred = toggleFavoriteBoard(hash, headerTitle, storedProfileName);
    notify(
      t(nextStarred ? 'messages.patternFavorited' : 'messages.patternUnfavorited', {
        name: headerTitle,
      }),
    );
  }

  function toggleCurrentPatternStar(): void {
    if (isStarredByCurrentUser) {
      setIsRemoveStarConfirmModalOpen(true);
      return;
    }

    commitCurrentPatternStarToggle();
  }

  function cancelRemoveCurrentPatternStar(): void {
    setIsRemoveStarConfirmModalOpen(false);
  }

  function confirmRemoveCurrentPatternStar(): void {
    commitCurrentPatternStarToggle();
    setIsRemoveStarConfirmModalOpen(false);
  }
  return {
    setActivePopularityModal,
    toggleCurrentPatternStar,
    isRemoveStarConfirmModalOpen,
    cancelRemoveCurrentPatternStar,
    confirmRemoveCurrentPatternStar,
    activePopularityModal,
  };
}
