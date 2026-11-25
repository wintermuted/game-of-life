import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, Star, User } from 'lucide-react';
import { LifeGrid } from '@game-of-life/core';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { encodeGridToBase64 } from '@game-of-life/util';

export interface BoardGalleryItem {
  id: string;
  title: string;
  hash: string;
  boardId?: string;
  grid: LifeGrid;
  updatedLabel: string;
  source: 'system' | 'user';
  forkOriginTitle?: string;
}

interface Props {
  title: string;
  boards: BoardGalleryItem[];
  emptyMessage?: string;
  sectionId?: string;
  icon?: ReactNode;
  sectionViewMode: 'cards' | 'table';
  isOwnProfile: boolean;
  viewedUserName: string;
  handleToggleStar: (board: BoardGalleryItem) => void;
  handleOpenBoard: (hash: string, boardId: string | undefined, title: string) => void;
}

function getBoardHref(hash: string, boardId?: string): string {
  const params = new URLSearchParams();
  params.set('pattern', hash);
  if (boardId && boardId !== hash) {
    params.set('board', boardId);
  }
  return `/play?${params.toString()}`;
}

function getLiveCellCount(grid: LifeGrid): number {
  return Object.keys(grid).length;
}

export default function ProfileBoardSection({
  title,
  boards,
  emptyMessage,
  sectionId,
  icon,
  sectionViewMode,
  isOwnProfile,
  viewedUserName,
  handleToggleStar,
  handleOpenBoard,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const emptyBoardHash = encodeGridToBase64({});

  function getBoardDetailLabel(board: BoardGalleryItem): string {
    if (board.forkOriginTitle) {
      return t('profile.tableOriginFork', { name: board.forkOriginTitle });
    }

    if (board.source === 'user') {
      return t('profile.tableOriginMine');
    }

    return t('profile.tableOriginLibrary');
  }

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
                        {board.source === 'system' ? (
                          <Cpu size={11} aria-hidden="true" />
                        ) : (
                          <User size={11} aria-hidden="true" />
                        )}
                        <span>
                          {board.source === 'system'
                            ? t('patternSource.system')
                            : t('patternSource.user')}
                        </span>
                      </span>
                    </span>
                  </div>
                  <p>{board.updatedLabel}</p>
                  {board.forkOriginTitle ? (
                    <p className="profile-board-owner-line">
                      {t('profile.forkedFrom', { name: board.forkOriginTitle })}
                    </p>
                  ) : null}
                  {board.source === 'user' && !board.forkOriginTitle ? (
                    <p className="profile-board-owner-line">
                      {t('patternSource.byUser', { name: viewedUserName })}
                    </p>
                  ) : null}
                </div>
                <p className="profile-board-stats">
                  {t('profile.liveCells', { count: getLiveCellCount(board.grid) })}
                </p>
                {showUnstarAction ? (
                  <div className="profile-board-actions-row">
                    <button
                      className="btn btn-sm btn-secondary-neutral"
                      type="button"
                      onClick={() => handleToggleStar(board)}
                    >
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
                          {board.source === 'system' ? (
                            <Cpu size={11} aria-hidden="true" />
                          ) : (
                            <User size={11} aria-hidden="true" />
                          )}
                          <span>
                            {board.source === 'system'
                              ? t('patternSource.system')
                              : t('patternSource.user')}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>{getBoardDetailLabel(board)}</td>
                    <td>{board.updatedLabel}</td>
                    <td>{getLiveCellCount(board.grid)}</td>
                    <td>
                      <div className="profile-board-actions-row">
                        <Link
                          className="btn btn-sm btn-secondary-neutral"
                          to={getBoardHref(board.hash, board.boardId)}
                          onClick={() => handleOpenBoard(board.hash, board.boardId, board.title)}
                        >
                          {t('profile.openBoard')}
                        </Link>
                        {showUnstarAction ? (
                          <button
                            className="btn btn-sm btn-secondary-neutral"
                            type="button"
                            onClick={() => handleToggleStar(board)}
                          >
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
              onClick={() =>
                handleOpenBoard(emptyBoardHash, undefined, t('profile.emptyBoardTitle'))
              }
            >
              {t('profile.createEmptyBoard')}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
