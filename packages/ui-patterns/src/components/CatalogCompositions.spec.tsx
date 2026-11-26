import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardPopularityList, CatalogEmptyState, PatternCatalogToolbar } from '../index';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

describe('Catalog compositions', () => {
  test('preserves fork focus across host renderer changes and renders empty popularity states', () => {
    const onOpenFork = vi.fn();
    const forks = [
      {
        id: 'fork',
        name: 'My fork',
        author: 'Pattern author',
        href: '/play/fork',
        grid: {},
        forkedAt: 'Yesterday',
        updatedAt: 'Today',
        stars: 2,
      },
    ];
    const { rerender } = render(
      <BoardPopularityList
        mode="forks"
        starredByUsers={[]}
        forks={forks}
        onOpenFork={onOpenFork}
        renderLink={({ href, children, onClick }) => (
          <button data-href={href} onClick={onClick}>
            {children}
          </button>
        )}
      />,
    );
    const link = screen.getByRole('button', { name: /My fork/ });
    expect(link).toHaveAttribute('data-href', '/play/fork');
    fireEvent.click(link);
    expect(onOpenFork).toHaveBeenCalledWith('fork');
    link.focus();
    const preview = link.querySelector('canvas');
    expect(preview).not.toBeNull();
    const onOpenUpdatedFork = vi.fn();
    rerender(
      <BoardPopularityList
        mode="forks"
        starredByUsers={[]}
        forks={forks}
        onOpenFork={onOpenUpdatedFork}
        renderLink={({ href, children, onClick }) => (
          <button data-href={href} onClick={onClick}>
            {children}
          </button>
        )}
      />,
    );
    const updatedLink = screen.getByRole('button', { name: /My fork/ });
    expect(updatedLink).toBe(link);
    expect(updatedLink).toHaveFocus();
    expect(updatedLink.querySelector('canvas')).toBe(preview);
    fireEvent.click(updatedLink);
    expect(onOpenUpdatedFork).toHaveBeenCalledWith('fork');
    expect(onOpenFork).toHaveBeenCalledOnce();
    rerender(<BoardPopularityList mode="forks" starredByUsers={[]} forks={[]} />);
    expect(screen.getByText('playground.noForksYet')).toBeInTheDocument();
    rerender(<BoardPopularityList mode="stars" starredByUsers={[]} forks={[]} />);
    expect(screen.getByText('playground.noStarsYet')).toBeInTheDocument();
  });

  test('forwards toolbar values and closes the sort menu after selection', () => {
    const onFavoritesOnlyChange = vi.fn();
    const onForkedOnlyChange = vi.fn();
    const onGroupModeChange = vi.fn();
    const onSortFieldChange = vi.fn();
    const onSortDirectionChange = vi.fn();
    const { container } = render(
      <PatternCatalogToolbar
        viewMode="cards"
        groupMode="none"
        sortField="favorites"
        sortDirection="desc"
        favoritesOnly={false}
        forkedOnly={true}
        onViewModeChange={vi.fn()}
        onFavoritesOnlyChange={onFavoritesOnlyChange}
        onForkedOnlyChange={onForkedOnlyChange}
        onGroupModeChange={onGroupModeChange}
        onSortFieldChange={onSortFieldChange}
        onSortDirectionChange={onSortDirectionChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'explore.favoritesOnly' }));
    fireEvent.click(screen.getByRole('button', { name: 'explore.forkedOnly' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'author' } });
    expect(onFavoritesOnlyChange).toHaveBeenCalledWith(true);
    expect(onForkedOnlyChange).toHaveBeenCalledWith(false);
    expect(onGroupModeChange).toHaveBeenCalledWith('author');
    const menu = container.querySelector('details')!;
    menu.open = true;
    fireEvent.click(screen.getAllByRole('menuitemradio', { name: 'explore.sortDirectionAsc' })[2]);
    expect(onSortFieldChange).toHaveBeenCalledWith('name');
    expect(onSortDirectionChange).toHaveBeenCalledWith('asc');
    expect(menu.open).toBe(false);
  });

  test('forwards the catalog reset action without manipulating query state', () => {
    const onReset = vi.fn();
    render(
      <CatalogEmptyState
        title="No results"
        description="Clear filters to try again."
        actionLabel="Clear filters"
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
