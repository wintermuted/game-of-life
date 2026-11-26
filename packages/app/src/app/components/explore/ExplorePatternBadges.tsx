import { PatternMetadataBadges, PatternSourceBadge } from '@game-of-life/ui-patterns';
import { getPatternRulesetId } from './exploreCatalog';
import type { BadgeProps } from './exploreViewTypes';

export function SourceBadge({
  pattern,
  filters,
}: Pick<BadgeProps, 'pattern' | 'filters'>): React.JSX.Element {
  return (
    <PatternSourceBadge
      source={pattern.source}
      creatorName={pattern.creatorName}
      onSelect={filters.setSelectedSource}
    />
  );
}

export function PatternBadges({ pattern, labels, filters }: BadgeProps): React.JSX.Element {
  const rulesetId = getPatternRulesetId(pattern);
  return (
    <PatternMetadataBadges
      category={pattern.category}
      rulesetId={rulesetId}
      rulesetLabel={labels.getRulesetLabel(rulesetId)}
      tags={labels.getPatternTags(pattern)}
      onCategorySelect={(category) => filters.setSelectedCategories(new Set([category]))}
      onRulesetSelect={(id) => filters.setSelectedRulesets(new Set([id]))}
      onTagSelect={(tag) => filters.setSelectedTags(new Set([tag]))}
    />
  );
}
