import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import {
  getFavoriteBoards,
  getRecentBoards,
  setSavedBoards,
  setStoredProfileUser,
  toggleFavoriteBoard,
} from '@game-of-life/api';
import { encodeGridToBase64 } from '@game-of-life/util';
import Profile from './Profile';

vi.mock('@game-of-life/ui-patterns', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@game-of-life/ui-patterns')>()),
  PatternPreview: (): React.JSX.Element => <div data-testid="preview" />,
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);

function mount(search = ''): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[`/profile${search}`]}>
      <Profile />
    </MemoryRouter>,
  );
}

describe('Profile gallery integration', () => {
  test('preserves board links and recent tracking when switching from cards to table', () => {
    const hash = encodeGridToBase64({ '0,0': '#ff0000', '3,5': '#00ff00' });
    setSavedBoards([{ hash, boardId: 'my-board', title: 'My board', updatedAt: Date.now() }]);
    const { container } = mount();
    const myBoards = container.querySelector('#myBoards');
    if (!(myBoards instanceof HTMLElement)) throw new Error('Expected personal boards');
    expect(within(myBoards).getByRole('heading', { name: 'My board' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Table' }));
    const link = within(myBoards).getByRole('link', { name: 'Open Board' });
    const params = new URLSearchParams(link.getAttribute('href')?.split('?')[1]);
    expect(params.get('pattern')).toBe(hash);
    expect(params.get('board')).toBe('my-board');
    expect(within(myBoards).getByRole('cell', { name: '2' })).toBeInTheDocument();
    fireEvent.click(link);
    expect(getRecentBoards()[0]).toMatchObject({ hash, boardId: 'my-board', title: 'My board' });
  });

  test('un-starring through the gallery persists the change and refreshes the empty state', () => {
    const hash = encodeGridToBase64({ '5,7': '#ff0000' });
    setStoredProfileUser({ name: 'Gallery Tester' });
    toggleFavoriteBoard(hash, 'Starred seed', 'Gallery Tester');
    const { container } = mount();
    const favorites = container.querySelector('#favorites');
    if (!(favorites instanceof HTMLElement)) throw new Error('Expected favorites');
    expect(within(favorites).getByRole('heading', { name: 'Starred seed' })).toBeInTheDocument();

    fireEvent.click(within(favorites).getByRole('button', { name: 'Remove star' }));
    expect(getFavoriteBoards()).toStrictEqual([]);
    expect(
      within(favorites).getByText('No stars yet. Star boards in Explore to see them here.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Removed Starred seed from favorites')).toBeInTheDocument();
  });

  test('keeps empty-board creation and favorite removal exclusive to the profile owner', () => {
    const { unmount } = mount();
    expect(screen.getByRole('link', { name: 'Create empty board' })).toHaveAttribute(
      'href',
      `/play?${new URLSearchParams({ pattern: encodeGridToBase64({}) }).toString()}`,
    );
    unmount();
    const hash = encodeGridToBase64({ '5,7': '#ff0000' });
    toggleFavoriteBoard(hash, 'Anika seed', 'Anika Shah');
    mount('?creator=anika-shah');
    expect(screen.getByRole('heading', { name: 'Anika seed' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create empty board' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove star' })).not.toBeInTheDocument();
  });
});
