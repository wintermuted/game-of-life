import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import {
  getFavoriteBoards,
  getForkOrigins,
  getSavedBoards,
  getRecentBoards,
  setSavedBoards,
  setStoredProfileUser,
} from '@game-of-life/api';
import { seededUserPatterns } from '../data/socialPatternCatalog';
import { getPatternHash } from './explore/exploreCatalog';
import Explore from './Explore';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: translate }),
}));
vi.mock('@game-of-life/ui-patterns', () => ({
  PatternPreview: (): React.JSX.Element => <div data-testid="preview" />,
}));

function translate(key: string): string {
  return key === 'patternSource.system' ? 'Sistema' : key;
}

function RouteProbe(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-testid="query">{location.search}</output>
      <button onClick={() => navigate('/explore?q=Twin&view=cards&unknown=keep')}>external</button>
      <button onClick={() => navigate(-1)}>back</button>
    </>
  );
}

function mount(search = ''): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[`/explore${search}`]}>
      <Explore />
      <RouteProbe />
    </MemoryRouter>,
  );
}

function query(): URLSearchParams {
  return new URLSearchParams(screen.getByTestId('query').textContent ?? '');
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);

describe('Explore route and results characterization', () => {
  test('hydrates repeated/comma filters, legacy grouping and external navigation without overwriting unknown parameters', () => {
    mount(
      '?q=Signal&category=User%20Creations,invalid&category=User%20Creations&groupByCategory=1&view=table&unknown=keep',
    );
    expect(query().getAll('category')).toStrictEqual(['User Creations,invalid', 'User Creations']);
    expect(query().get('groupByCategory')).toBe('1');
    expect(screen.getByRole('searchbox').getAttribute('value')).toBe('Signal');
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('category');
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Signal Weave' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'external' }));
    expect(screen.getByRole('searchbox').getAttribute('value')).toBe('Twin');
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(screen.getByRole('searchbox').getAttribute('value')).toBe('Signal');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Orbit' } });
    expect(query().get('unknown')).toBe('keep');
    expect(query().getAll('category')).toStrictEqual(['User Creations']);
    expect(query().get('groupBy')).toBe('category');
    expect(query().has('groupByCategory')).toBe(false);
  });

  test('invalid options fall back and search includes translated source labels', () => {
    const { container } = mount(
      '?source=invalid&sort=invalid&direction=invalid&view=invalid&ruleset=invalid',
    );
    expect(container.querySelector('.explore-patterns-grid')).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Sistema' } });
    expect(container.querySelectorAll('.explore-pattern-card').length).toBeGreaterThan(3);
    expect(screen.queryByRole('heading', { name: 'Signal Weave' })).toBeNull();
    expect(query().has('source')).toBe(false);
    expect(query().has('ruleset')).toBe(false);
  });

  test('empty-state clearing preserves sort/group/view while sidebar clearing resets sort/group', () => {
    mount(
      '?q=not-a-pattern&sort=name&direction=asc&groupBy=author&view=table&favorites=true&forked=true',
    );
    const empty = screen
      .getByRole('heading', { name: 'explore.noResultsTitle' })
      .closest('.explore-empty-state');
    if (!empty) throw new Error('Missing empty state');
    fireEvent.click(
      within(empty as HTMLElement).getByRole('button', { name: 'explore.clearFilters' }),
    );
    expect(query().get('sort')).toBe('name');
    expect(query().get('groupBy')).toBe('author');
    expect(query().get('view')).toBe('table');
    expect(query().has('favorites')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'explore.clearFilters' }));
    expect(query().has('sort')).toBe(false);
    expect(query().has('groupBy')).toBe(false);
    expect(query().get('view')).toBe('table');
  });

  test('card and table actions retain content-hash favorites and distinct fork board IDs', () => {
    const { container } = mount('?q=Signal');
    const card = container.querySelector('.explore-pattern-card');
    if (!card) throw new Error('Missing card');
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: /explore.favorite/ }));
    const favorite = getFavoriteBoards().find(
      (entry) => entry.actorName === 'James Nyeholt' && entry.title === 'Signal Weave',
    );
    expect(favorite).toBeTruthy();
    expect(screen.getByRole('link', { name: 'explore.viewFavorites' }).getAttribute('href')).toBe(
      '/profile#favorites',
    );
    fireEvent.click(
      within(card as HTMLElement).getByRole('button', { name: /explore.forkPattern/ }),
    );
    const fork = getForkOrigins().find(
      (entry) => entry.forkerName === 'James Nyeholt' && entry.parentTitle === 'Signal Weave',
    );
    expect(fork?.hash).toContain(`${favorite?.hash}-fork-`);
    expect(getSavedBoards().find((entry) => entry.boardId === fork?.hash)?.hash).toBe(
      favorite?.hash,
    );
    expect(getRecentBoards()[0].hash).toBe(favorite?.hash);
    fireEvent.click(screen.getByRole('button', { name: 'explore.forkedOnly' }));
    fireEvent.click(screen.getByRole('button', { name: 'explore.viewTable' }));
    const links = screen.getAllByRole('link', { name: /Signal Weave/ });
    expect(
      links.some(
        (link) =>
          new URLSearchParams(link.getAttribute('href')?.split('?')[1]).get('board') === fork?.hash,
      ),
    ).toBe(true);
    expect(screen.getByRole('table')).toBeTruthy();
  });

  test('table sorting uses translated headers, ascending field clicks and descending direction clicks', () => {
    mount('?category=User%20Creations&view=table');
    fireEvent.click(screen.getByRole('button', { name: 'explore.tablePattern', exact: true }));
    expect(query().get('sort')).toBe('name');
    expect(query().get('direction')).toBe('asc');
    expect(
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('link')[0].textContent),
    ).toStrictEqual(['Orbit Stack', 'Signal Weave', 'Twin Lantern']);
    fireEvent.click(
      screen.getByRole('button', { name: 'explore.sortDirectionLabel - explore.tableSource' }),
    );
    expect(query().get('sort')).toBe('user');
    expect(query().has('direction')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'explore.tableSource', exact: true }));
    expect(query().get('direction')).toBe('asc');
  });

  test('descriptive tags exclude metadata, retain the three-tag limit, and badge filtering works identically in cards/table', () => {
    const hash = getPatternHash(seededUserPatterns[0].grid);
    setSavedBoards([
      {
        hash,
        title: 'Signal Weave',
        updatedAt: 1,
        tags: [
          'User Creations',
          'patternSource.user',
          'James Nyeholt',
          'custom',
          'first',
          'FIRST',
          'second',
          'third',
          'fourth',
        ],
      },
    ]);
    const { container } = mount('?q=Signal');
    expect(
      Array.from(container.querySelectorAll('.explore-pattern-tag')).map(
        (element) => element.textContent,
      ),
    ).toStrictEqual(['first', 'second', 'third']);
    const cardBadge = screen.getByRole('button', { name: 'explore.tagFilterLabel: second' });
    fireEvent.click(cardBadge);
    expect(query().getAll('tag')).toStrictEqual(['second']);
    fireEvent.click(screen.getByRole('button', { name: 'explore.viewTable' }));
    expect(
      Array.from(container.querySelectorAll('.explore-pattern-tag')).map(
        (element) => element.textContent,
      ),
    ).toStrictEqual(['first', 'second', 'third']);
    fireEvent.click(screen.getByRole('button', { name: 'explore.tagFilterLabel: third' }));
    expect(query().getAll('tag')).toStrictEqual(['third']);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'fourth' } });
    expect(screen.getByRole('link', { name: 'Signal Weave' })).toBeTruthy();
  });

  test('favorites remain scoped to the trimmed current actor and table removal leaves other actors untouched', () => {
    setStoredProfileUser({ name: '  Test Actor  ' });
    mount('?q=Signal&view=table');
    const otherFavorites = getFavoriteBoards().filter((entry) => entry.actorName !== 'Test Actor');
    fireEvent.click(
      within(screen.getByRole('table')).getByRole('button', { name: /explore.favorite/ }),
    );
    expect(getFavoriteBoards().filter((entry) => entry.actorName === 'Test Actor')).toHaveLength(1);
    fireEvent.click(
      within(screen.getByRole('table')).getByRole('button', { name: /explore.favorited/ }),
    );
    expect(getFavoriteBoards().filter((entry) => entry.actorName === 'Test Actor')).toHaveLength(0);
    expect(getFavoriteBoards().filter((entry) => entry.actorName !== 'Test Actor')).toStrictEqual(
      otherFavorites,
    );
  });
});
