import { Cpu, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPatternRulesetId } from './exploreCatalog';
import type { BadgeProps } from './exploreViewTypes';
export function SourceBadge({
  pattern,
  filters,
}: Pick<BadgeProps, 'pattern' | 'filters'>): React.JSX.Element {
  const { t } = useTranslation();
  const { setSelectedSource } = filters;
  const sourceLabel =
    pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user');
  const displayLabel =
    pattern.source === 'user' ? (pattern.creatorName ?? sourceLabel) : sourceLabel;
  const SourceIcon = pattern.source === 'user' ? User : Cpu;

  return (
    <button
      className="wm-badge wm-badge-neutral explore-filter-badge"
      type="button"
      aria-label={`${t('explore.sourceFilterLabel')}: ${sourceLabel}`}
      onClick={() => setSelectedSource(pattern.source)}
    >
      <span className="pattern-source-badge-content">
        <SourceIcon size={11} aria-hidden="true" />
        <span>{displayLabel}</span>
      </span>
    </button>
  );
}

export function PatternBadges({ pattern, labels, filters }: BadgeProps): React.JSX.Element {
  const { t } = useTranslation();
  const { getPatternTags, getRulesetLabel } = labels;
  const { setSelectedCategories, setSelectedRulesets, setSelectedTags } = filters;
  const tags = getPatternTags(pattern);
  const rulesetId = getPatternRulesetId(pattern);

  return (
    <div className="explore-pattern-detail-rows">
      <div className="explore-pattern-category-row">
        <button
          className="wm-badge wm-badge-neutral explore-filter-badge"
          type="button"
          aria-label={`${t('explore.categoryFilterLabel')}: ${pattern.category}`}
          onClick={() => setSelectedCategories(new Set([pattern.category]))}
        >
          {pattern.category}
        </button>
      </div>
      <div className="explore-pattern-ruleset-row">
        <button
          className="wm-badge wm-badge-neutral explore-pattern-ruleset-badge explore-filter-badge"
          type="button"
          aria-label={`${t('explore.rulesetFilterLabel')}: ${getRulesetLabel(rulesetId)}`}
          onClick={() => setSelectedRulesets(new Set([rulesetId]))}
        >
          {getRulesetLabel(rulesetId)}
        </button>
      </div>
      {tags.length > 0 ? (
        <div className="explore-pattern-tag-row">
          {tags.map((tag) => (
            <button
              key={tag}
              className="wm-badge wm-badge-neutral explore-pattern-tag explore-filter-badge"
              type="button"
              aria-label={`${t('explore.tagFilterLabel')}: ${tag}`}
              onClick={() => setSelectedTags(new Set([tag]))}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
