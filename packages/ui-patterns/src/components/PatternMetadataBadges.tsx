import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface PatternMetadataBadgesProps {
  category: string;
  rulesetId: string;
  rulesetLabel: string;
  tags: readonly string[];
  onCategorySelect: (category: string) => void;
  onRulesetSelect: (rulesetId: string) => void;
  onTagSelect: (tag: string) => void;
}

// DEDUPLICATE-LATER: ExplorePatternTable retains its cell-specific badge markup.
export function PatternMetadataBadges({
  category,
  rulesetId,
  rulesetLabel,
  tags,
  onCategorySelect,
  onRulesetSelect,
  onTagSelect,
}: PatternMetadataBadgesProps): ReactElement {
  const { t } = useTranslation();
  return (
    <div className="explore-pattern-detail-rows">
      <div className="explore-pattern-category-row">
        <button
          className="wm-badge wm-badge-neutral explore-filter-badge"
          type="button"
          aria-label={`${t('explore.categoryFilterLabel')}: ${category}`}
          onClick={() => onCategorySelect(category)}
        >
          {category}
        </button>
      </div>
      <div className="explore-pattern-ruleset-row">
        <button
          className="wm-badge wm-badge-neutral explore-pattern-ruleset-badge explore-filter-badge"
          type="button"
          aria-label={`${t('explore.rulesetFilterLabel')}: ${rulesetLabel}`}
          onClick={() => onRulesetSelect(rulesetId)}
        >
          {rulesetLabel}
        </button>
      </div>
      {tags.length > 0 && (
        <div className="explore-pattern-tag-row">
          {tags.map((tag) => (
            <button
              key={tag}
              className="wm-badge wm-badge-neutral explore-pattern-tag explore-filter-badge"
              type="button"
              aria-label={`${t('explore.tagFilterLabel')}: ${tag}`}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
