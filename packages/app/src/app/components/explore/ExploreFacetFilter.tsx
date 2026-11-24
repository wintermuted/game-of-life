import { useTranslation } from 'react-i18next';
import { FacetFilter } from '@game-of-life/ui-staging';
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
  return (
    <FacetFilter
      label={label}
      options={facet.options.map((value) => ({
        value,
        label: getLabel(value),
        count: facet.counts[value] ?? 0,
        disabled: (facet.counts[value] ?? 0) === 0 && !selected.has(value),
        hidden: facet.disabledOptions.includes(value),
      }))}
      selected={[...selected]}
      onChange={(values) => setSelected(new Set(values))}
      available={facet.hasAvailable}
      emptyLabel={t('explore.noFiltersAvailable')}
      reset={{
        label: allLabel,
        count: facet.counts.all ?? 0,
        selected: selected.size === 0,
        onSelect: () => setSelected(new Set()),
      }}
      moreLabel={t('explore.showMoreFilterOptions', { count: facet.disabledOptions.length })}
      fewerLabel={t('explore.showFewerFilterOptions')}
    />
  );
}
