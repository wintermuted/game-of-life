import type { ReactElement } from 'react';
import type { LifeGrid } from '@game-of-life/core';
import type { ColorPalette } from '@game-of-life/ui';
import { useTranslation } from 'react-i18next';
import PatternPreview from './PatternPreview';
import { PatternLink, type PatternLinkRenderer } from './PatternLink';

export interface BoardForkItem {
  id: string;
  name: string;
  author: string;
  grid: LifeGrid;
  href: string;
  forkedAt: string;
  updatedAt: string;
  stars: number;
}

export interface BoardPopularityListProps {
  mode: 'stars' | 'forks';
  starredByUsers: readonly string[];
  forks: readonly BoardForkItem[];
  palette?: ColorPalette;
  onOpenFork?: (id: string) => void;
  renderLink?: PatternLinkRenderer;
}

export function BoardPopularityList({
  mode,
  starredByUsers,
  forks,
  palette,
  onOpenFork,
  renderLink: Link = PatternLink,
}: BoardPopularityListProps): ReactElement {
  // DEDUPLICATE-LATER: PlaygroundPatternInfo keeps its compact fork-list presentation.
  const { t } = useTranslation();
  if (mode === 'stars') {
    return starredByUsers.length === 0 ? (
      <p>{t('playground.noStarsYet')}</p>
    ) : (
      <ul className="play-popularity-list">
        {starredByUsers.map((name, index) => (
          <li key={`${name}-${index}`}>{name}</li>
        ))}
      </ul>
    );
  }
  if (forks.length === 0) return <p>{t('playground.noForksYet')}</p>;
  return (
    <>
      <div className="play-forks-list-head" aria-hidden="true">
        <span>{t('explore.tablePattern')}</span>
        <span>{t('playground.forkedDateLabel')}</span>
        <span>{t('playground.lastModifiedDateLabel')}</span>
        <span>{t('explore.tableStars')}</span>
      </div>
      <ul className="wm-list play-forks-list">
        {forks.map((entry) => (
          <li key={entry.id}>
            <Link
              className="play-forks-list-link"
              href={entry.href}
              onClick={() => onOpenFork?.(entry.id)}
            >
              <div className="play-forks-list-row">
                <div className="play-forks-list-pattern-cell">
                  <PatternPreview grid={entry.grid} size={52} palette={palette} />
                  <div className="play-forks-list-pattern-copy">
                    <span className="play-forks-list-pattern-name">{entry.name}</span>
                    <span className="play-forks-list-pattern-meta">{entry.author}</span>
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
  );
}
