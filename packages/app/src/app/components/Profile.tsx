import { ToggleGroup } from '@wintermuted/ui-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock3, GitFork, LayoutGrid, Rows3, Star } from 'lucide-react';
import { LifeGrid, glider, blinker, pulsar, patterns } from '@game-of-life/core';
import ProfileBoardSection, { BoardGalleryItem } from './ProfileBoardSection';
import { encodeGridToBase64, formatRelativeTime } from '@game-of-life/util';
import {
  getBrowserStorageMode,
  getFavoriteBoards,
  getForkOrigin,
  getRecentBoards,
  getSavedBoards,
  getSavedTemplateNames,
  getStoredProfileUser,
  type StoredProfileUser,
  hashToGrid,
  trackRecentBoard,
  toggleFavoriteBoard,
} from '@game-of-life/api';

interface FallbackBoard {
  id: string;
  titleKey: string;
  updatedKey: string;
  grid: LifeGrid;
  source: 'system' | 'user';
}

const creatorProfileMap: Record<string, StoredProfileUser> = {
  system: {
    name: 'System Library',
    email: 'system@example.com',
    memberSince: 'January 1970',
    timezone: 'UTC',
    favoritePalette: 'Classic Green',
    avatarInitials: 'SY',
  },
  'james-nyeholt': {
    name: 'James Nyeholt',
    email: 'james@example.com',
    memberSince: 'April 2026',
    timezone: 'America/Los_Angeles',
    favoritePalette: 'Classic Green',
    avatarInitials: 'JN',
  },
  'anika-shah': {
    name: 'Anika Shah',
    email: 'anika@example.com',
    memberSince: 'May 2026',
    timezone: 'America/New_York',
    favoritePalette: 'Ocean Blue',
    avatarInitials: 'AS',
  },
  'leo-martinez': {
    name: 'Leo Martinez',
    email: 'leo@example.com',
    memberSince: 'June 2026',
    timezone: 'America/Chicago',
    favoritePalette: 'Solar Ember',
    avatarInitials: 'LM',
  },
};

function Profile(): React.JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const [sectionViewMode, setSectionViewMode] = useState<'cards' | 'table'>('cards');
  const [favoriteRefreshToken, setFavoriteRefreshToken] = useState(0);
  const [profileFeedbackMessage, setProfileFeedbackMessage] = useState('');

  const defaultRecentBoards: FallbackBoard[] = [
    {
      id: 'recent-glider',
      titleKey: 'profile.recentBoards.items.glider.title',
      updatedKey: 'profile.recentBoards.items.glider.updated',
      grid: glider,
      source: 'system',
    },
    {
      id: 'recent-blinker',
      titleKey: 'profile.recentBoards.items.blinker.title',
      updatedKey: 'profile.recentBoards.items.blinker.updated',
      grid: blinker,
      source: 'system',
    },
    {
      id: 'recent-pulsar',
      titleKey: 'profile.recentBoards.items.pulsar.title',
      updatedKey: 'profile.recentBoards.items.pulsar.updated',
      grid: pulsar,
      source: 'system',
    },
  ];

  const libraryPatternHashes = new Set(patterns.map((pattern) => encodeGridToBase64(pattern.grid)));

  const storageMode = getBrowserStorageMode();
  const user = getStoredProfileUser();
  const viewedUser = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const creator = params.get('creator');
    if (!creator) {
      return user;
    }

    return creatorProfileMap[creator] ?? user;
  }, [location.search, user]);
  const isOwnProfile = viewedUser.name === user.name;
  const savedTemplateNames = getSavedTemplateNames();

  const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  const savedBoardsFromStorage = getSavedBoards()
    .map((entry) => {
      const grid = hashToGrid(entry.hash);
      if (!grid) return null;

      return {
        id: `saved-${entry.boardId ?? entry.hash}`,
        title: entry.title,
        hash: entry.hash,
        boardId: entry.boardId,
        grid,
        updatedLabel: formatRelativeTime(entry.updatedAt, (value, unit) =>
          relativeFormatter.format(value, unit),
        ),
        source: libraryPatternHashes.has(entry.hash) ? 'system' : 'user',
      } as BoardGalleryItem;
    })
    .filter((entry): entry is BoardGalleryItem => entry !== null);

  const recentBoardsFromStorage = getRecentBoards()
    .map((entry) => {
      const grid = hashToGrid(entry.hash);
      if (!grid) return null;

      return {
        id: `recent-${entry.boardId ?? entry.hash}`,
        title: entry.title,
        hash: entry.hash,
        boardId: entry.boardId,
        grid,
        updatedLabel: formatRelativeTime(entry.openedAt, (value, unit) =>
          relativeFormatter.format(value, unit),
        ),
        source: libraryPatternHashes.has(entry.hash) ? 'system' : 'user',
      } as BoardGalleryItem;
    })
    .filter((entry): entry is BoardGalleryItem => entry !== null);

  const favoriteBoardsFromStorage = getFavoriteBoards()
    .filter((entry) => (entry.actorName ?? '').trim() === viewedUser.name)
    .map((entry) => {
      const grid = hashToGrid(entry.hash);
      if (!grid) return null;

      return {
        id: `favorite-${entry.hash}`,
        title: entry.title,
        hash: entry.hash,
        boardId: entry.hash,
        grid,
        updatedLabel: formatRelativeTime(entry.favoritedAt, (value, unit) =>
          relativeFormatter.format(value, unit),
        ),
        source: libraryPatternHashes.has(entry.hash) ? 'system' : 'user',
      } as BoardGalleryItem;
    })
    .filter((entry): entry is BoardGalleryItem => entry !== null);

  const favoriteBoardIds = new Set(
    favoriteBoardsFromStorage.map((board) => board.boardId ?? board.hash),
  );

  const userForkedBoards = savedBoardsFromStorage
    .filter((board) => {
      const forkOrigin = getForkOrigin(board.boardId ?? board.hash);
      return !!forkOrigin && (forkOrigin.forkerName ?? '').trim() === viewedUser.name;
    })
    .map((board) => {
      const forkOrigin = getForkOrigin(board.boardId ?? board.hash);
      return {
        ...board,
        forkOriginTitle: forkOrigin?.parentTitle,
      };
    });

  const userForkedBoardIds = new Set(userForkedBoards.map((board) => board.boardId ?? board.hash));

  const myGameBoards = savedBoardsFromStorage.filter((board) => {
    const boardId = board.boardId ?? board.hash;
    if (favoriteBoardIds.has(boardId)) {
      return false;
    }

    if (userForkedBoardIds.has(boardId)) {
      return false;
    }

    return board.source === 'user';
  });

  const recentBoards: BoardGalleryItem[] =
    recentBoardsFromStorage.length > 0
      ? recentBoardsFromStorage
      : defaultRecentBoards.map((board) => ({
          id: board.id,
          title: t(board.titleKey),
          hash: encodeGridToBase64(board.grid),
          boardId: encodeGridToBase64(board.grid),
          grid: board.grid,
          updatedLabel: t(board.updatedKey),
          source: board.source,
        }));

  const favoriteBoards: BoardGalleryItem[] = favoriteBoardsFromStorage;

  void favoriteRefreshToken;

  function handleToggleStar(board: BoardGalleryItem): void {
    const nextStarred = toggleFavoriteBoard(board.hash, board.title, user.name);
    setFavoriteRefreshToken((value) => value + 1);
    setProfileFeedbackMessage(
      t(nextStarred ? 'messages.patternFavorited' : 'messages.patternUnfavorited', {
        name: board.title,
      }),
    );
  }

  function handleOpenBoard(hash: string, boardId: string | undefined, title: string): void {
    const fallbackTitle = savedTemplateNames[boardId ?? hash] || title;
    trackRecentBoard(hash, fallbackTitle, boardId ?? hash);
  }

  return (
    <div className="profile-layout">
      <header className="profile-header">
        <div>
          <h1 className="profile-title">{t('profile.title')}</h1>
          <p className="profile-subtitle">{t('profile.subtitle')}</p>
        </div>
        <Link className="btn btn-sm btn-secondary-neutral" to="/play">
          {t('profile.openPlayground')}
        </Link>
      </header>

      <div className="profile-page-body">
        <aside className="profile-sidebar" aria-label="Profile summary">
          <section className="card card-body profile-card">
            <div className="profile-identity-row">
              <div className="profile-avatar" aria-hidden="true">
                {viewedUser.avatarInitials}
              </div>
              <div>
                <h2 className="profile-identity-name">{viewedUser.name}</h2>
                <p className="profile-identity-handle">{viewedUser.email}</p>
              </div>
            </div>

            <dl className="profile-details-grid">
              <div>
                <dt>{t('profile.details.memberSince')}</dt>
                <dd>{viewedUser.memberSince}</dd>
              </div>
              <div>
                <dt>{t('profile.details.timezone')}</dt>
                <dd>{viewedUser.timezone}</dd>
              </div>
              <div>
                <dt>{t('profile.details.favoritePalette')}</dt>
                <dd>{viewedUser.favoritePalette}</dd>
              </div>
              <div>
                <dt>{t('profile.details.boardsSaved')}</dt>
                <dd>{savedBoardsFromStorage.length}</dd>
              </div>
            </dl>

            <p className="profile-storage-mode-line">
              {t('profile.storageModeLabel')}:{' '}
              {storageMode === 'local'
                ? t('settings.storage.local')
                : t('settings.storage.session')}
            </p>
            <p className="profile-persistence-note">{t('profile.persistenceNote')}</p>
          </section>
        </aside>

        <div className="profile-main-column">
          {profileFeedbackMessage ? (
            <p className="profile-status-message">{profileFeedbackMessage}</p>
          ) : null}
          <div className="profile-view-toggle-row">
            <span className="profile-view-toggle-label">{t('explore.viewModeLabel')}</span>
            <ToggleGroup
              appearance="outline"
              label={t('explore.viewModeLabel')}
              value={sectionViewMode}
              onChange={setSectionViewMode}
              options={[
                {
                  value: 'cards',
                  label: t('explore.viewCards'),
                  icon: <LayoutGrid size={14} aria-hidden="true" />,
                },
                {
                  value: 'table',
                  label: t('explore.viewTable'),
                  icon: <Rows3 size={14} aria-hidden="true" />,
                },
              ]}
            />
          </div>

          <ProfileBoardSection
            title={t('profile.myBoards.title')}
            boards={myGameBoards}
            emptyMessage={t('profile.myBoards.empty')}
            sectionId={'myBoards'}
            icon={<LayoutGrid size={16} aria-hidden="true" />}
            sectionViewMode={sectionViewMode}
            isOwnProfile={isOwnProfile}
            viewedUserName={viewedUser.name}
            handleToggleStar={handleToggleStar}
            handleOpenBoard={handleOpenBoard}
          />

          <ProfileBoardSection
            title={t('profile.forkedBoards.title')}
            boards={userForkedBoards}
            emptyMessage={t('profile.forkedBoards.empty')}
            sectionId={undefined}
            icon={<GitFork size={16} aria-hidden="true" />}
            sectionViewMode={sectionViewMode}
            isOwnProfile={isOwnProfile}
            viewedUserName={viewedUser.name}
            handleToggleStar={handleToggleStar}
            handleOpenBoard={handleOpenBoard}
          />

          <ProfileBoardSection
            title={t('profile.stars.title')}
            boards={favoriteBoards}
            emptyMessage={t('profile.stars.empty')}
            sectionId={'favorites'}
            icon={<Star size={16} aria-hidden="true" />}
            sectionViewMode={sectionViewMode}
            isOwnProfile={isOwnProfile}
            viewedUserName={viewedUser.name}
            handleToggleStar={handleToggleStar}
            handleOpenBoard={handleOpenBoard}
          />

          <ProfileBoardSection
            title={t('profile.recentBoards.title')}
            boards={recentBoards}
            emptyMessage={undefined}
            sectionId={undefined}
            icon={<Clock3 size={16} aria-hidden="true" />}
            sectionViewMode={sectionViewMode}
            isOwnProfile={isOwnProfile}
            viewedUserName={viewedUser.name}
            handleToggleStar={handleToggleStar}
            handleOpenBoard={handleOpenBoard}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
