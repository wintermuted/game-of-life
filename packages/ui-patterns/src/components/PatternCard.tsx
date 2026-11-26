import { GitFork, Star } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { LifeGrid } from '@game-of-life/core';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import PatternPreview from './PatternPreview';
import { PatternLink, type PatternLinkRenderer } from './PatternLink';

export interface PatternCardProps {
  name: string;
  grid: LifeGrid;
  href: string;
  selectedPaletteId?: string;
  favorite: boolean;
  favoriteCount: number;
  forkCount: number;
  sourceBadge?: ReactNode;
  metadata?: ReactNode;
  onOpen?: () => void;
  onFork: () => void;
  onFavorite: () => void;
  renderLink?: PatternLinkRenderer;
}

// DEDUPLICATE-LATER: ProfileBoardSection retains its profile-specific card.
export function PatternCard({
  name,
  grid,
  href,
  selectedPaletteId = DEFAULT_PALETTE_ID,
  favorite,
  favoriteCount,
  forkCount,
  sourceBadge,
  metadata,
  onOpen,
  onFork,
  onFavorite,
  renderLink = PatternLink,
}: PatternCardProps): ReactElement {
  const { t } = useTranslation();
  return (
    <article className="card card-body explore-pattern-card">
      {renderLink({
        href,
        className: 'explore-card-preview-link',
        onClick: onOpen,
        children: (
          <div className="profile-board-preview">
            <PatternPreview grid={grid} size={88} palette={getPaletteById(selectedPaletteId)} />
          </div>
        ),
      })}
      <div className="profile-board-meta">
        <div className="profile-board-meta-title-row">
          {renderLink({
            href,
            className: 'explore-card-title-link',
            onClick: onOpen,
            children: <h3>{name}</h3>,
          })}
          {sourceBadge}
        </div>
        {metadata}
      </div>
      <div className="explore-pattern-actions">
        <button
          className="btn btn-sm btn-secondary-neutral explore-action-btn"
          type="button"
          onClick={onFork}
        >
          <GitFork size={13} aria-hidden="true" />
          {t('explore.forkPattern')}
          <span className="explore-action-count">{forkCount}</span>
        </button>
        <button
          className="btn btn-sm btn-secondary-neutral explore-action-btn explore-favorite-btn"
          type="button"
          onClick={onFavorite}
        >
          <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
          <span>{favorite ? t('explore.favorited') : t('explore.favorite')}</span>
          <span className="explore-action-count">{favoriteCount}</span>
        </button>
      </div>
    </article>
  );
}
