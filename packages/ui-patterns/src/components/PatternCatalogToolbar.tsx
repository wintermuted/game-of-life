import { ToggleGroup } from '@wintermuted/ui-react';
import { useMemo } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpAZ,
  ChevronDown,
  Cpu,
  FolderTree,
  GitFork,
  LayoutGrid,
  Rows3,
  Star,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
export type CatalogGroupMode = 'none' | 'category' | 'ruleset' | 'author';
export type CatalogViewMode = 'cards' | 'table';
export type CatalogSortField = 'favorites' | 'forks' | 'name' | 'user' | 'category';
export type CatalogSortDirection = 'asc' | 'desc';

export interface PatternCatalogToolbarProps {
  viewMode: CatalogViewMode;
  onViewModeChange: (value: CatalogViewMode) => void;
  groupMode: CatalogGroupMode;
  onGroupModeChange: (value: CatalogGroupMode) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
  forkedOnly: boolean;
  onForkedOnlyChange: (value: boolean) => void;
  sortField: CatalogSortField;
  onSortFieldChange: (value: CatalogSortField) => void;
  sortDirection: CatalogSortDirection;
  onSortDirectionChange: (value: CatalogSortDirection) => void;
}

export function PatternCatalogToolbar(props: PatternCatalogToolbarProps): React.JSX.Element {
  const { t } = useTranslation();
  const {
    viewMode,
    onViewModeChange: setViewMode,
    groupMode,
    onGroupModeChange: setGroupMode,
    favoritesOnly,
    onFavoritesOnlyChange: setFavoritesOnly,
    forkedOnly,
    onForkedOnlyChange: setForkedOnly,
    sortField,
    onSortFieldChange: setSortField,
    sortDirection,
    onSortDirectionChange: setSortDirection,
  } = props;
  const groupOptions: { value: CatalogGroupMode; label: string; icon: typeof FolderTree }[] = [
    { value: 'none', label: t('explore.groupNone'), icon: Rows3 },
    { value: 'category', label: t('explore.groupCategory'), icon: FolderTree },
    { value: 'ruleset', label: t('explore.groupRuleset'), icon: Cpu },
    { value: 'author', label: t('explore.groupAuthor'), icon: User },
  ];
  const selectedGroupOption =
    groupOptions.find((option) => option.value === groupMode) ?? groupOptions[0];
  const SelectedGroupIcon = selectedGroupOption.icon;

  const sortFieldLabel =
    sortField === 'favorites'
      ? t('explore.sortFavorites')
      : sortField === 'forks'
        ? t('explore.sortForks')
        : sortField === 'name'
          ? t('explore.sortName')
          : sortField === 'category'
            ? t('explore.sortCategory')
            : t('explore.sortUser');

  const SortFieldIcon =
    sortField === 'favorites'
      ? Star
      : sortField === 'forks'
        ? GitFork
        : sortField === 'name'
          ? ArrowUpAZ
          : sortField === 'category'
            ? FolderTree
            : User;

  const sortDirectionLabel =
    sortDirection === 'desc' ? t('explore.sortDirectionDesc') : t('explore.sortDirectionAsc');
  const SortDirectionIcon = sortDirection === 'desc' ? ArrowDown : ArrowUp;
  const selectedSortLabel = `${sortFieldLabel} (${sortDirectionLabel})`;

  const sortMenuSections = useMemo(() => {
    const fields = [
      { value: 'favorites' as const, label: t('explore.sortFavorites'), icon: Star },
      { value: 'forks' as const, label: t('explore.sortForks'), icon: GitFork },
      { value: 'name' as const, label: t('explore.sortName'), icon: ArrowUpAZ },
      { value: 'category' as const, label: t('explore.sortCategory'), icon: FolderTree },
      { value: 'user' as const, label: t('explore.sortUser'), icon: User },
    ];

    const directions = [
      { value: 'desc' as const, label: t('explore.sortDirectionDesc'), icon: ArrowDown },
      { value: 'asc' as const, label: t('explore.sortDirectionAsc'), icon: ArrowUp },
    ];

    return fields.map((field) => ({
      ...field,
      options: directions.map((direction) => ({
        key: `${field.value}-${direction.value}`,
        field: field.value,
        direction: direction.value,
        label: direction.label,
        icon: direction.icon,
      })),
    }));
  }, [t]);

  return (
    <section className="explore-results-toolbar">
      <div className="explore-results-toolbar-left">
        <ToggleGroup
          appearance="outline"
          label={t('explore.viewModeLabel')}
          value={viewMode}
          onChange={setViewMode}
          options={[
            {
              value: 'cards',
              label: t('explore.viewCards'),
              icon: <LayoutGrid size={12} aria-hidden="true" />,
            },
            {
              value: 'table',
              label: t('explore.viewTable'),
              icon: <Rows3 size={12} aria-hidden="true" />,
            },
          ]}
        />

        <div className="explore-group-select-wrap">
          <SelectedGroupIcon className="explore-group-select-icon" size={12} aria-hidden="true" />
          <select
            className="wm-select explore-group-select"
            aria-label={t('explore.groupByLabel')}
            value={groupMode}
            onChange={(event) => {
              const selected = groupOptions.find((option) => option.value === event.target.value);
              if (selected) setGroupMode(selected.value);
            }}
          >
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`btn btn-sm btn-secondary-neutral explore-boolean-toggle${favoritesOnly ? ' is-active' : ''}`}
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Star size={12} fill={favoritesOnly ? 'currentColor' : 'none'} aria-hidden="true" />
          <span>{t('explore.favoritesOnly')}</span>
        </button>

        <button
          className={`btn btn-sm btn-secondary-neutral explore-boolean-toggle${forkedOnly ? ' is-active' : ''}`}
          type="button"
          aria-pressed={forkedOnly}
          onClick={() => setForkedOnly(!forkedOnly)}
        >
          <GitFork size={12} aria-hidden="true" />
          <span>{t('explore.forkedOnly')}</span>
        </button>
      </div>

      <div className="explore-results-toolbar-right">
        <details className="header-user-menu explore-sort-menu">
          <summary
            className="header-user-menu-trigger explore-sort-menu-trigger"
            aria-label={t('explore.sortLabel')}
          >
            <span className="explore-sort-menu-selected">
              <SortFieldIcon size={12} aria-hidden="true" />
              <SortDirectionIcon size={12} aria-hidden="true" />
              <span className="explore-sort-menu-value">{selectedSortLabel}</span>
            </span>
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div
            className="header-user-menu-panel explore-sort-menu-panel"
            role="menu"
            aria-label={t('explore.sortLabel')}
          >
            {sortMenuSections.map((section) => (
              <div key={section.value} className="explore-sort-menu-group" role="none">
                <div className="explore-sort-menu-heading" role="presentation">
                  <section.icon size={12} aria-hidden="true" />
                  <span>{section.label}</span>
                </div>

                {section.options.map((option) => {
                  const active = option.field === sortField && option.direction === sortDirection;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      className={`header-user-menu-item explore-sort-menu-item${active ? ' is-active' : ''}`}
                      onClick={(event) => {
                        setSortField(option.field);
                        setSortDirection(option.direction);
                        event.currentTarget.closest('details')?.removeAttribute('open');
                      }}
                    >
                      <option.icon size={12} aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
