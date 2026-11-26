import { useId, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { BoardPopularityList } from '@game-of-life/ui-patterns';
import { useTranslation } from 'react-i18next';
import { trackRecentBoard } from '@game-of-life/api';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { BoardPersistence } from './useBoardPersistence';
import type { BoardSocial } from './useBoardSocial';
import type { BoardPresentation } from './useBoardPresentation';

export function BoardPopularityDialog(props: {
  metadata: Pick<
    PlaygroundMetadata,
    'isSystemPattern' | 'headerTitle' | 'starredByUsers' | 'forkedByRecords' | 'getBoardHref'
  >;
  persistence: Pick<BoardPersistence, 'openForkNameModal'>;
  social: Pick<BoardSocial, 'activePopularityModal' | 'setActivePopularityModal'>;
  presentation: Pick<BoardPresentation, 'selectedPalette'>;
}): JSX.Element | null {
  const { isSystemPattern, headerTitle, starredByUsers, forkedByRecords, getBoardHref } =
    props.metadata;
  const { activePopularityModal, setActivePopularityModal } = props.social;
  const titleId = useId();
  const { t } = useTranslation();
  if (!activePopularityModal) return null;
  return (
    <div className="wm-modal-overlay" onClick={() => setActivePopularityModal(null)}>
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
              activePopularityModal === 'stars'
                ? 'playground.starsModalTitle'
                : 'playground.forksModalTitle',
              { pattern: headerTitle },
            )}
          </h3>
        </div>
        <div className="wm-modal-body">
          <BoardPopularityList
            mode={activePopularityModal}
            starredByUsers={starredByUsers}
            palette={props.presentation.selectedPalette}
            forks={forkedByRecords.map((entry) => ({
              id: entry.boardId,
              name: entry.pattern,
              author: entry.forker,
              grid: entry.boardGrid,
              href: getBoardHref(entry.boardHash, entry.boardId),
              forkedAt: entry.forkedAt,
              updatedAt: entry.updatedAt,
              stars: entry.stars,
            }))}
            renderLink={({ href, children, ...linkProps }) => (
              <Link to={href} {...linkProps}>
                {children}
              </Link>
            )}
            onOpenFork={(id) => {
              const entry = forkedByRecords.find((record) => record.boardId === id);
              if (entry) trackRecentBoard(entry.boardHash, entry.pattern, entry.boardId);
              setActivePopularityModal(null);
            }}
          />
        </div>
        <div className="wm-modal-footer">
          {activePopularityModal === 'forks' && isSystemPattern ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={props.persistence.openForkNameModal}
            >
              {t('playground.fork')}
            </button>
          ) : null}
          <button
            className="btn btn-secondary btn-outline"
            type="button"
            onClick={() => setActivePopularityModal(null)}
          >
            {t('dialogs.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
