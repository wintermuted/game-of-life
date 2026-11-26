import { Link } from 'react-router-dom';
import { PatternCard } from '@game-of-life/ui-patterns';
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
  const hash = getPatternHash(pattern.grid);
  const metrics = patternMetrics[hash] ?? { favorites: 0, forks: 0 };
  return (
    <PatternCard
      name={pattern.name}
      grid={pattern.grid}
      href={getPatternPlayUrl(pattern)}
      favorite={favoriteHashes.has(hash)}
      favoriteCount={metrics.favorites}
      forkCount={metrics.forks}
      sourceBadge={<SourceBadge pattern={pattern} filters={filters} />}
      metadata={<PatternBadges pattern={pattern} labels={labels} filters={filters} />}
      onOpen={() => trackRecentBoard(hash, pattern.name)}
      onFork={() => actions.handleFork(pattern)}
      onFavorite={() => actions.handleFavorite(pattern.name, pattern.grid)}
      renderLink={({ href, ...props }) => <Link to={href} {...props} />}
    />
  );
}
