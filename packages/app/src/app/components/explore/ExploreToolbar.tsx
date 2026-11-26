import { PatternCatalogToolbar } from '@game-of-life/ui-patterns';
import type { ExploreQueryState } from './useExploreQueryState';

type ToolbarProps = Pick<
  ExploreQueryState,
  | 'viewMode'
  | 'setViewMode'
  | 'groupMode'
  | 'setGroupMode'
  | 'favoritesOnly'
  | 'setFavoritesOnly'
  | 'forkedOnly'
  | 'setForkedOnly'
  | 'sortField'
  | 'setSortField'
  | 'sortDirection'
  | 'setSortDirection'
>;

export function ExploreToolbar(props: ToolbarProps): React.JSX.Element {
  return (
    <PatternCatalogToolbar
      viewMode={props.viewMode}
      onViewModeChange={props.setViewMode}
      groupMode={props.groupMode}
      onGroupModeChange={props.setGroupMode}
      favoritesOnly={props.favoritesOnly}
      onFavoritesOnlyChange={props.setFavoritesOnly}
      forkedOnly={props.forkedOnly}
      onForkedOnlyChange={props.setForkedOnly}
      sortField={props.sortField}
      onSortFieldChange={props.setSortField}
      sortDirection={props.sortDirection}
      onSortDirectionChange={props.setSortDirection}
    />
  );
}
