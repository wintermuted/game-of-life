import type { ExplorePattern, MetricsByHash } from './exploreTypes';
import type { ExploreQueryState } from './useExploreQueryState';
import type { ExploreActions } from './useExploreActions';
import type { ExploreLabels } from './useExploreLabels';
export interface BadgeProps {
  pattern: ExplorePattern;
  labels: Pick<ExploreLabels, 'getPatternTags' | 'getRulesetLabel'>;
  filters: Pick<
    ExploreQueryState,
    'setSelectedSource' | 'setSelectedCategories' | 'setSelectedRulesets' | 'setSelectedTags'
  >;
}
export interface PatternViewProps {
  favoriteHashes: Set<string>;
  patternMetrics: MetricsByHash;
  labels: BadgeProps['labels'];
  filters: BadgeProps['filters'];
  actions: Pick<ExploreActions, 'handleFavorite' | 'handleFork'>;
}
