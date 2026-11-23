import { Link } from 'react-router-dom';
import { GitFork, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { trackRecentBoard } from '@game-of-life/api';
import { getPatternHash, getPatternPlayUrl } from './exploreCatalog';
import { SourceBadge, PatternBadges } from './ExplorePatternBadges';
import type { ExplorePattern } from './exploreTypes';
import type { PatternViewProps } from './exploreViewTypes';
export function ExplorePatternCard({
  pattern,
  favoriteHashes,
  patternMetrics,
  labels,
  filters,
  actions,
}: PatternViewProps & { pattern: ExplorePattern }): React.JSX.Element {
  const { t } = useTranslation();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const hash = getPatternHash(pattern.grid);
  const favorite = favoriteHashes.has(hash);
  const metrics = patternMetrics[hash] ?? { favorites: 0, forks: 0 };
  const { handleFork, handleFavorite } = actions;
  return (
    <article className="card card-body explore-pattern-card">
      <Link
        className="explore-card-preview-link"
        to={getPatternPlayUrl(pattern)}
        onClick={() => trackRecentBoard(hash, pattern.name)}
      >
        <div className="profile-board-preview">
          <PatternPreview grid={pattern.grid} size={88} palette={previewPalette} />
        </div>
      </Link>

      <div className="profile-board-meta">
        <div className="profile-board-meta-title-row">
          <Link
            className="explore-card-title-link"
            to={getPatternPlayUrl(pattern)}
            onClick={() => trackRecentBoard(hash, pattern.name)}
          >
            <h3>{pattern.name}</h3>
          </Link>
          <SourceBadge pattern={pattern} filters={filters} />
        </div>
        <PatternBadges pattern={pattern} labels={labels} filters={filters} />
      </div>

      <div className="explore-pattern-actions">
        <button
          className="btn btn-sm btn-secondary-neutral explore-action-btn"
          type="button"
          onClick={() => handleFork(pattern)}
        >
          <GitFork size={13} aria-hidden="true" />
          {t('explore.forkPattern')}
          <span className="explore-action-count">{metrics.forks}</span>
        </button>
        <button
          className="btn btn-sm btn-secondary-neutral explore-action-btn explore-favorite-btn"
          type="button"
          onClick={() => handleFavorite(pattern.name, pattern.grid)}
        >
          <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
          <span>{favorite ? t('explore.favorited') : t('explore.favorite')}</span>
          <span className="explore-action-count">{metrics.favorites}</span>
        </button>
      </div>
    </article>
  );
}
