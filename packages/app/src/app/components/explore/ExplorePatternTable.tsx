import { Link } from 'react-router-dom';
import { GitFork, Play, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { PatternPreview } from '@game-of-life/ui-patterns';
import { trackRecentBoard } from '@game-of-life/api';
import { getPatternHash, getPatternPlayUrl, getPatternRulesetId } from './exploreCatalog';
import { SourceBadge } from './ExplorePatternBadges';
import { ExploreSortHeader } from './ExploreSortHeader';
import type { ExplorePattern, GroupMode, SortField, SortDirection } from './exploreTypes';
import type { PatternViewProps } from './exploreViewTypes';
export interface TableSortProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleTableSort: (field: SortField) => void;
  handleTableSortDirection: (field: SortField) => void;
}
export function ExplorePatternTable({
  patterns: categoryPatterns,
  favoriteHashes,
  patternMetrics,
  labels,
  filters,
  actions,
  groupMode,
  sortField,
  sortDirection,
  handleTableSort,
  handleTableSortDirection,
}: PatternViewProps &
  TableSortProps & { patterns: ExplorePattern[]; groupMode: GroupMode }): React.JSX.Element {
  const { t } = useTranslation();
  const previewPalette = getPaletteById(DEFAULT_PALETTE_ID);
  const { getPatternTags, getRulesetLabel } = labels;
  const { setSelectedCategories, setSelectedRulesets, setSelectedTags } = filters;
  const { handleFork, handleFavorite } = actions;
  return (
    <div className="explore-patterns-table-wrap">
      <table className={`explore-patterns-table${groupMode !== 'none' ? ' is-grouped' : ''}`}>
        <colgroup>
          <col className="explore-col-pattern" />
          <col className="explore-col-source" />
          <col className="explore-col-category" />
          <col className="explore-col-ruleset" />
          <col className="explore-col-tags" />
          <col className="explore-col-forks" />
          <col className="explore-col-stars" />
          <col className="explore-col-actions" />
        </colgroup>
        <thead>
          <tr>
            <ExploreSortHeader
              field="name"
              label={t('explore.tablePattern')}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleTableSort}
              onDirection={handleTableSortDirection}
            />
            <ExploreSortHeader
              field="user"
              label={t('explore.tableSource')}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleTableSort}
              onDirection={handleTableSortDirection}
            />
            <ExploreSortHeader
              field="category"
              label={t('explore.tableCategory')}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleTableSort}
              onDirection={handleTableSortDirection}
            />
            <th>{t('explore.tableRuleset')}</th>
            <th>{t('explore.tableTags')}</th>
            <ExploreSortHeader
              field="forks"
              label={t('explore.tableForks')}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleTableSort}
              onDirection={handleTableSortDirection}
            />
            <ExploreSortHeader
              field="favorites"
              label={t('explore.tableStars')}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleTableSort}
              onDirection={handleTableSortDirection}
            />
            <th>{t('explore.tableActions')}</th>
          </tr>
        </thead>
        <tbody>
          {categoryPatterns.map((pattern) => {
            const hash = getPatternHash(pattern.grid);
            const favorite = favoriteHashes.has(hash);
            const metrics = patternMetrics[hash] ?? { favorites: 0, forks: 0 };

            return (
              <tr key={`${pattern.category}-${pattern.name}`}>
                <td>
                  <Link
                    className="explore-table-pattern-link"
                    to={getPatternPlayUrl(pattern)}
                    onClick={() => trackRecentBoard(hash, pattern.name)}
                  >
                    <div className="explore-table-pattern-cell">
                      <PatternPreview grid={pattern.grid} size={48} palette={previewPalette} />
                      <span>{pattern.name}</span>
                    </div>
                  </Link>
                </td>
                <td>
                  <SourceBadge pattern={pattern} filters={filters} />
                </td>
                <td>
                  <button
                    className="wm-badge wm-badge-neutral explore-filter-badge"
                    type="button"
                    aria-label={`${t('explore.categoryFilterLabel')}: ${pattern.category}`}
                    onClick={() => setSelectedCategories(new Set([pattern.category]))}
                  >
                    {pattern.category}
                  </button>
                </td>
                <td className="explore-table-ruleset-cell">
                  <button
                    className="wm-badge wm-badge-neutral explore-pattern-ruleset-badge explore-filter-badge"
                    type="button"
                    aria-label={`${t('explore.rulesetFilterLabel')}: ${getRulesetLabel(getPatternRulesetId(pattern))}`}
                    onClick={() => setSelectedRulesets(new Set([getPatternRulesetId(pattern)]))}
                  >
                    {getRulesetLabel(getPatternRulesetId(pattern))}
                  </button>
                </td>
                <td className="explore-table-tags-cell">
                  <div className="explore-pattern-tag-row">
                    {getPatternTags(pattern).map((tag) => (
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
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary-neutral explore-action-btn"
                    type="button"
                    onClick={() => handleFork(pattern)}
                  >
                    <GitFork size={13} aria-hidden="true" />
                    {t('explore.forkPattern')}
                    <span className="explore-action-count">{metrics.forks}</span>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary-neutral explore-action-btn explore-favorite-btn"
                    type="button"
                    onClick={() => handleFavorite(pattern.name, pattern.grid)}
                  >
                    <Star size={13} fill={favorite ? 'currentColor' : 'none'} />
                    <span>{favorite ? t('explore.favorited') : t('explore.favorite')}</span>
                    <span className="explore-action-count">{metrics.favorites}</span>
                  </button>
                </td>
                <td>
                  <div className="explore-pattern-actions explore-table-actions">
                    <Link
                      className="btn btn-sm btn-secondary-neutral explore-action-btn"
                      to={getPatternPlayUrl(pattern)}
                      onClick={() => trackRecentBoard(hash, pattern.name)}
                    >
                      <Play size={13} aria-hidden="true" />
                      {t('explore.playPattern')}
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
