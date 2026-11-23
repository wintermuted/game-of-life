import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExploreFacet } from './exploreFacets';

interface FacetFilterProps {
  label: string;
  allLabel: string;
  facet: ExploreFacet;
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  getLabel: (value: string) => string;
}

export function ExploreFacetFilter({
  label,
  allLabel,
  facet,
  selected,
  setSelected,
  getLabel,
}: FacetFilterProps): React.JSX.Element {
  const { t } = useTranslation();
  const [showDisabled, setShowDisabled] = useState(false);
  const { counts, options, disabledOptions, hasAvailable } = facet;
  const visibleOptions = showDisabled
    ? options
    : options.filter((value) => !disabledOptions.includes(value));
  return (
    <details className="explore-filter-section" open>
      <summary className="explore-filter-section-summary">{label}</summary>
      <div className="explore-checkbox-list" role="group" aria-label={label}>
        {!hasAvailable ? (
          <p className="explore-filter-empty-state">{t('explore.noFiltersAvailable')}</p>
        ) : null}
        {hasAvailable
          ? ['all', ...visibleOptions].map((value) => {
              const checked = value === 'all' ? selected.size === 0 : selected.has(value);
              const disabled = value !== 'all' && (counts[value] ?? 0) === 0 && !checked;
              return (
                <label
                  key={value}
                  className="explore-checkbox-item explore-checkbox-item-with-count"
                >
                  <span className="explore-checkbox-item-main">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => {
                        if (value === 'all') {
                          if (event.target.checked) setSelected(new Set());
                          return;
                        }
                        setSelected((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.add(value);
                          else next.delete(value);
                          return next;
                        });
                      }}
                    />
                    <span>{value === 'all' ? allLabel : getLabel(value)}</span>
                  </span>
                  <span className="wm-badge wm-badge-neutral explore-filter-option-count">
                    {counts[value] ?? 0}
                  </span>
                </label>
              );
            })
          : null}
        {hasAvailable && disabledOptions.length > 0 ? (
          <button
            className="explore-filter-more-btn"
            type="button"
            onClick={() => setShowDisabled((current) => !current)}
          >
            {showDisabled
              ? t('explore.showFewerFilterOptions')
              : t('explore.showMoreFilterOptions', { count: disabledOptions.length })}
          </button>
        ) : null}
      </div>
    </details>
  );
}
