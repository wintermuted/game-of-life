import { Cpu, User } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface PatternSourceBadgeProps {
  source: 'system' | 'user';
  creatorName?: string;
  onSelect?: (source: 'system' | 'user') => void;
}

// DEDUPLICATE-LATER: ProfileBoardSection has separate static source badges.
export function PatternSourceBadge({
  source,
  creatorName,
  onSelect,
}: PatternSourceBadgeProps): ReactElement {
  const { t } = useTranslation();
  const sourceLabel = t(source === 'system' ? 'patternSource.system' : 'patternSource.user');
  const label = source === 'user' ? (creatorName ?? sourceLabel) : sourceLabel;
  const Icon = source === 'user' ? User : Cpu;
  const content = (
    <span className="pattern-source-badge-content">
      <Icon size={11} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
  return onSelect ? (
    <button
      className="wm-badge wm-badge-neutral explore-filter-badge"
      type="button"
      aria-label={`${t('explore.sourceFilterLabel')}: ${sourceLabel}`}
      onClick={() => onSelect(source)}
    >
      {content}
    </button>
  ) : (
    <span className="wm-badge wm-badge-neutral">{content}</span>
  );
}
