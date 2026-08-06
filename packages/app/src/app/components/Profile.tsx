import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock3, Cpu, GitFork, LayoutGrid, Rows3, Star, User } from 'lucide-react';
import {
  LifeGrid,
  glider,
  blinker,
  pulsar,
  patterns,
} from '@game-of-life/core';
import PatternPreview from './PatternPreview';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';
import { encodeGridToBase64 } from '../util/urlState';
import {
  formatRelativeTime,
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
} from '../util/browserStorage';
import { loadCurrentUserProfile } from '../util/backendClient';

interface BoardGalleryItem {
  id: string;
  title: string;
  hash: string;
  boardId?: string;
  grid: LifeGrid;
  updatedLabel: string;
  source: 'system' | 'user';
  forkOriginTitle?: string;
}

interface FallbackBoard {
  id: string;
  titleKey: string;
  updatedKey: string;
  grid: LifeGrid;
  source: 'system' | 'user';
}

function Profile() {
  const { t } = useTranslation();
  const location = useLocation();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const [sectionViewMode, setSectionViewMode] = useState<'cards' | 'table'>('cards');
  const [favoriteRefreshToken, setFavoriteRefreshToken] = useState(0);
  const [profileFeedbackMessage, setProfileFeedbackMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<StoredProfileUser>(() => getStoredProfileUser());

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
  const viewedUser = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const creator = params.get('creator');
    if (!creator) {
      return currentUser;
    }

    return creatorProfileMap[creator] ?? currentUser;
  }, [location.search, currentUser]);
  const isOwnProfile = viewedUser.name === currentUser.name;
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
        updatedLabel: formatRelativeTime(entry.updatedAt, (value, unit) => relativeFormatter.format(value, unit)),
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
        updatedLabel: formatRelativeTime(entry.openedAt, (value, unit) => relativeFormatter.format(value, unit)),
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
        updatedLabel: formatRelativeTime(entry.favoritedAt, (value, unit) => relativeFormatter.format(value, unit)),
        source: libraryPatternHashes.has(entry.hash) ? 'system' : 'user',
      } as BoardGalleryItem;
    })
    .filter((entry): entry is BoardGalleryItem => entry !== null);

  const favoriteBoardIds = new Set(favoriteBoardsFromStorage.map((board) => board.boardId ?? board.hash));

  const userForkedBoards = savedBoardsFromStorage.filter((board) => {
    const forkOrigin = getForkOrigin(board.boardId ?? board.hash);
    return !!forkOrigin && (forkOrigin.forkerName ?? '').trim() === viewedUser.name;
  }).map((board) => {
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

  const recentBoards: BoardGalleryItem[] = recentBoardsFromStorage.length > 0
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
  const emptyBoardHash = encodeGridToBase64({});

  void favoriteRefreshToken;

  useEffect(() => {
    let isMounted = true;

    loadCurrentUserProfile().then((profile) => {
      if (!isMounted || !profile) {
        return;
      }

      const nextUser: StoredProfileUser = {
        name: profile.displayName,
        email: profile.email ?? currentUser.email,
        memberSince: profile.memberSince,
        timezone: profile.timezone,
        favoritePalette: profile.favoritePalette,
        avatarInitials: profile.avatarInitials,
      };
      setCurrentUser(nextUser);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleToggleStar(board: BoardGalleryItem): void {
    const nextStarred = toggleFavoriteBoard(board.hash, board.title, currentUser.name);
    setFavoriteRefreshToken((value) => value + 1);
    setProfileFeedbackMessage(
      t(nextStarred ? 'messages.patternFavorited' : 'messages.patternUnfavorited', { name: board.title }),
    );
  }

  function getBoardDetailLabel(board: BoardGalleryItem): string {
    if (board.forkOriginTitle) {
      return t('profile.tableOriginFork', { name: board.forkOriginTitle });
    }

    if (board.source === 'user') {
      return t('profile.tableOriginMine');
    }

    return t('profile.tableOriginLibrary');
  }

  function renderBoardSection(
    title: string,
    boards: BoardGalleryItem[],
    emptyMessage?: string,
    sectionId?: string,
    icon?: React.ReactNode,
  ) {
    const showUnstarAction = sectionId === 'favorites' && isOwnProfile;
    const showCreateEmptyBoardAction = sectionId === 'myBoards' && isOwnProfile;

    return (
      <section id={sectionId} className="profile-gallery-section">
        <div className="profile-section-heading-row">
          <h2>
            <span className="profile-section-heading-label">
              {icon}
              <span>{title}</span>
            </span>
          </h2>
          <span className="wm-badge wm-badge-neutral">{boards.length}</span>
        </div>
        {boards.length > 0 ? (
          sectionViewMode === 'cards' ? (
            <div className="profile-boards-grid">
              {boards.map((board) => (
                <article key={board.id} className="card card-body profile-board-card">
                  <Link
                    className="profile-card-board-link profile-board-preview"
                    to={getBoardHref(board.hash, board.boardId)}
                    onClick={() => handleOpenBoard(board.hash, board.boardId, board.title)}
                  >
                    <PatternPreview grid={board.grid} size={88} palette={previewPalette} />
                  </Link>
                  <div className="profile-board-meta">
                    <div className="profile-board-meta-title-row">
                      <h3>
                        <Link
                          className="profile-card-board-link profile-card-board-title-link"
                          to={getBoardHref(board.hash, board.boardId)}
                          onClick={() => handleOpenBoard(board.hash, board.boardId, board.title)}
                        >
                          {board.title}
                        </Link>
                      </h3>
                      <span className="wm-badge wm-badge-neutral">
                        <span className="pattern-source-badge-content">
                          {board.source === 'system' ? <Cpu size={11} aria-hidden="true" /> : <User size={11} aria-hidden="true" />}
                          <span>{board.source === 'system' ? t('patternSource.system') : t('patternSource.user')}</span>
                        </span>
                      </span>
                    </div>
                    <p>{board.updatedLabel}</p>
                    {board.forkOriginTitle ? (
                      <p className="profile-board-owner-line">{t('profile.forkedFrom', { name: board.forkOriginTitle })}</p>
                    ) : null}
                    {board.source === 'user' && !board.forkOriginTitle ? <p className="profile-board-owner-line">{t('patternSource.byUser', { name: viewedUser.name })}</p> : null}
                  </div>
                  <p className="profile-board-stats">{t('profile.liveCells', { count: getLiveCellCount(board.grid) })}</p>
                  {showUnstarAction ? (
                    <div className="profile-board-actions-row">
                      <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={() => handleToggleStar(board)}>
                        <Star size={13} aria-hidden="true" fill="currentColor" />
                        <span>{t('profile.removeStar')}</span>
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-boards-table-wrap">
              <table className="profile-boards-table">
                <thead>
                  <tr>
                    <th>{t('profile.tableBoard')}</th>
                    <th>{t('explore.tableSource')}</th>
                    <th>{t('profile.tableDetails')}</th>
                    <th>{t('profile.tableUpdated')}</th>
                    <th>{t('profile.tableLiveCells')}</th>
                    <th>{t('explore.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map((board) => (
                    <tr key={board.id}>
                      <td>
                        <Link
                          className="profile-table-board-link"
                          to={getBoardHref(board.hash, board.boardId)}
                          onClick={() => handleOpenBoard(board.hash, board.boardId, board.title)}
                        >
                          <div className="profile-table-board-cell">
                            <PatternPreview grid={board.grid} size={48} palette={previewPalette} />
                            <span>{board.title}</span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <span className="wm-badge wm-badge-neutral">
                          <span className="pattern-source-badge-content">
                            {board.source === 'system' ? <Cpu size={11} aria-hidden="true" /> : <User size={11} aria-hidden="true" />}
                            <span>{board.source === 'system' ? t('patternSource.system') : t('patternSource.user')}</span>
                          </span>
                        </span>
                      </td>
                      <td>{getBoardDetailLabel(board)}</td>
                      <td>{board.updatedLabel}</td>
                      <td>{getLiveCellCount(board.grid)}</td>
                      <td>
                        <div className="profile-board-actions-row">
                          <Link className="btn btn-sm btn-secondary-neutral" to={getBoardHref(board.hash, board.boardId)} onClick={() => handleOpenBoard(board.hash, board.boardId, board.title)}>
                            {t('profile.openBoard')}
                          </Link>
                          {showUnstarAction ? (
                            <button className="btn btn-sm btn-secondary-neutral" type="button" onClick={() => handleToggleStar(board)}>
                              <Star size={13} aria-hidden="true" fill="currentColor" />
                              <span>{t('profile.removeStar')}</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : emptyMessage ? (
          <div className="profile-empty-state">
            <p className="profile-persistence-note">{emptyMessage}</p>
            {showCreateEmptyBoardAction ? (
              <Link
                className="btn btn-sm btn-secondary-neutral"
                to={getBoardHref(emptyBoardHash)}
                onClick={() => handleOpenBoard(emptyBoardHash, undefined, t('profile.emptyBoardTitle'))}
              >
                {t('profile.createEmptyBoard')}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  function getBoardHref(hash: string, boardId?: string): string {
    const params = new URLSearchParams();
    params.set('pattern', hash);
    if (boardId && boardId !== hash) {
      params.set('board', boardId);
    }
    return `/play?${params.toString()}`;
  }

  function handleOpenBoard(hash: string, boardId: string | undefined, title: string): void {
    const fallbackTitle = savedTemplateNames[boardId ?? hash] || title;
    trackRecentBoard(hash, fallbackTitle, boardId ?? hash);
  }

  function getLiveCellCount(grid: LifeGrid): number {
    return Object.keys(grid).length;
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
              <div className="profile-avatar" aria-hidden="true">{viewedUser.avatarInitials}</div>
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
              {t('profile.storageModeLabel')}: {storageMode === 'local' ? t('settings.storage.local') : t('settings.storage.session')}
            </p>
            <p className="profile-persistence-note">{t('profile.persistenceNote')}</p>
          </section>
        </aside>

        <div className="profile-main-column">
          {profileFeedbackMessage ? <p className="profile-status-message">{profileFeedbackMessage}</p> : null}
          <div className="profile-view-toggle-row">
            <span className="profile-view-toggle-label">{t('explore.viewModeLabel')}</span>
            <div className="explore-view-toggle" role="group" aria-label={t('explore.viewModeLabel')}>
              <button
                className={`btn btn-sm btn-secondary-neutral explore-view-toggle-btn${sectionViewMode === 'cards' ? ' is-active' : ''}`}
                type="button"
                onClick={() => setSectionViewMode('cards')}
              >
                <LayoutGrid size={14} aria-hidden="true" />
                <span>{t('explore.viewCards')}</span>
              </button>
              <button
                className={`btn btn-sm btn-secondary-neutral explore-view-toggle-btn${sectionViewMode === 'table' ? ' is-active' : ''}`}
                type="button"
                onClick={() => setSectionViewMode('table')}
              >
                <Rows3 size={14} aria-hidden="true" />
                <span>{t('explore.viewTable')}</span>
              </button>
            </div>
          </div>

          {renderBoardSection(
            t('profile.myBoards.title'),
            myGameBoards,
            t('profile.myBoards.empty'),
            'myBoards',
            <LayoutGrid size={16} aria-hidden="true" />,
          )}

          {renderBoardSection(
            t('profile.forkedBoards.title'),
            userForkedBoards,
            t('profile.forkedBoards.empty'),
            undefined,
            <GitFork size={16} aria-hidden="true" />,
          )}

          {renderBoardSection(
            t('profile.stars.title'),
            favoriteBoards,
            t('profile.stars.empty'),
            'favorites',
            <Star size={16} aria-hidden="true" />,
          )}

          {renderBoardSection(
            t('profile.recentBoards.title'),
            recentBoards,
            undefined,
            undefined,
            <Clock3 size={16} aria-hidden="true" />,
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
