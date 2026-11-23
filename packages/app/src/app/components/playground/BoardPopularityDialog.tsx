import { Link } from 'react-router-dom';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { useTranslation } from 'react-i18next';
import { trackRecentBoard } from '@game-of-life/api';
import type * as React from 'react';
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
}): React.JSX.Element {
  const { isSystemPattern, headerTitle, starredByUsers, forkedByRecords, getBoardHref } =
    props.metadata;
  const { openForkNameModal } = props.persistence;
  const { activePopularityModal, setActivePopularityModal } = props.social;
  const { selectedPalette } = props.presentation;
  const { t } = useTranslation();
  return (
    <>
      {activePopularityModal === 'stars' && (
        <div className="wm-modal-overlay" onClick={() => setActivePopularityModal(null)}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stars-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="stars-modal-title" className="wm-modal-title">
                {t('playground.starsModalTitle', { pattern: headerTitle })}
              </h3>
            </div>
            <div className="wm-modal-body">
              {starredByUsers.length === 0 ? (
                <p>{t('playground.noStarsYet')}</p>
              ) : (
                <ul className="play-popularity-list">
                  {starredByUsers.map((userName, index) => (
                    <li key={`${userName}-${index}`}>{userName}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="wm-modal-footer">
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
      )}
      {activePopularityModal === 'forks' && (
        <div className="wm-modal-overlay" onClick={() => setActivePopularityModal(null)}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forks-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="forks-modal-title" className="wm-modal-title">
                {t('playground.forksModalTitle', { pattern: headerTitle })}
              </h3>
            </div>
            <div className="wm-modal-body">
              {forkedByRecords.length === 0 ? (
                <p>{t('playground.noForksYet')}</p>
              ) : (
                <>
                  <div className="play-forks-list-head" aria-hidden="true">
                    <span>{t('explore.tablePattern')}</span>
                    <span>{t('playground.forkedDateLabel')}</span>
                    <span>{t('playground.lastModifiedDateLabel')}</span>
                    <span>{t('explore.tableStars')}</span>
                  </div>
                  <ul className="wm-list play-forks-list">
                    {forkedByRecords.map((entry) => (
                      <li key={entry.boardId}>
                        <Link
                          className="play-forks-list-link"
                          to={getBoardHref(entry.boardHash, entry.boardId)}
                          onClick={() => {
                            trackRecentBoard(entry.boardHash, entry.pattern, entry.boardId);
                            setActivePopularityModal(null);
                          }}
                        >
                          <div className="play-forks-list-row">
                            <div className="play-forks-list-pattern-cell">
                              <PatternPreview
                                grid={entry.boardGrid}
                                size={52}
                                palette={selectedPalette}
                              />
                              <div className="play-forks-list-pattern-copy">
                                <span className="play-forks-list-pattern-name">
                                  {entry.pattern}
                                </span>
                                <span className="play-forks-list-pattern-meta">{entry.forker}</span>
                              </div>
                            </div>
                            <span>{entry.forkedAt}</span>
                            <span>{entry.updatedAt}</span>
                            <span>{entry.stars}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="wm-modal-footer">
              {isSystemPattern ? (
                <button className="btn btn-primary" type="button" onClick={openForkNameModal}>
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
      )}
    </>
  );
}
