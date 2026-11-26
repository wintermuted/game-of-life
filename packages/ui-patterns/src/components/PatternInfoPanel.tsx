import { Settings } from 'lucide-react';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PatternLink, type PatternLinkRenderer } from './PatternLink';

export interface PatternInfoItem {
  id: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
  details?: ReactNode;
}

export interface PatternInfoTag {
  label: string;
  href: string;
}

export interface PatternInfoPanelProps {
  description: string;
  tags: readonly PatternInfoTag[];
  referenceUrl?: string;
  items: readonly PatternInfoItem[];
  onEdit?: () => void;
  renderLink?: PatternLinkRenderer;
}

export function PatternInfoPanel({
  description,
  tags,
  referenceUrl,
  items,
  onEdit,
  renderLink = PatternLink,
}: PatternInfoPanelProps): ReactElement {
  const { t } = useTranslation();
  return (
    <section className="play-about-section" aria-label={t('playground.infoTitle')}>
      <div className="play-about-header-row">
        <h4 className="diagnostics-section-heading">{t('playground.infoTitle')}</h4>
        {onEdit && (
          <button
            className="control-tooltip-trigger play-about-settings-btn"
            type="button"
            onClick={onEdit}
            aria-label={t('playground.editPatternInfo')}
            data-tooltip={t('playground.editPatternInfo')}
          >
            <Settings size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="play-about-content">
        <p className="play-about-description">{description}</p>
        {tags.length > 0 && (
          <div className="play-about-tags" aria-label="Tags">
            {tags.map((tag) => (
              <Fragment key={tag.label}>
                {renderLink({
                  href: tag.href,
                  className: 'wm-badge wm-badge-neutral play-about-tag',
                  children: tag.label,
                })}
              </Fragment>
            ))}
          </div>
        )}
        {referenceUrl && (
          <a
            className="play-about-meta-value-link"
            href={referenceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Wikipedia
          </a>
        )}
        <div className="play-about-meta-list">
          {items.map(({ id, icon, label, value, details }) => (
            <Fragment key={id}>
              <div className="play-about-meta-item">
                <span className="play-about-meta-icon" aria-hidden="true">
                  {icon}
                </span>
                <span className="play-about-meta-label">{label}</span>
                {value}
              </div>
              {details}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
