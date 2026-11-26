import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PatternCard, PatternInfoPanel, PatternMetadataBadges, PatternSourceBadge } from '../index';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

describe('Extracted pattern presentation', () => {
  test('uses host links and forwards card actions without app services', () => {
    const onOpen = vi.fn();
    const onFork = vi.fn();
    const onFavorite = vi.fn();
    render(
      <PatternCard
        name="Glider"
        grid={{ '0,0': '#22c55e' }}
        href="/board/glider"
        favorite={false}
        favoriteCount={0}
        forkCount={2}
        onOpen={onOpen}
        onFork={onFork}
        onFavorite={onFavorite}
        renderLink={({ href, children, className, onClick }) => (
          <button className={className} data-route={href} onClick={onClick}>
            {children}
          </button>
        )}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Glider' }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Glider' })).toHaveAttribute(
      'data-route',
      '/board/glider',
    );
    fireEvent.click(screen.getByRole('button', { name: /explore.forkPattern/ }));
    fireEvent.click(screen.getByRole('button', { name: /explore.favorite/ }));
    expect(onFork).toHaveBeenCalledOnce();
    expect(onFavorite).toHaveBeenCalledOnce();
  });

  test('forwards source and metadata filter values without app query state', () => {
    const onSource = vi.fn();
    const onCategory = vi.fn();
    const onRuleset = vi.fn();
    const onTag = vi.fn();
    render(
      <>
        <PatternSourceBadge source="user" creatorName="Pattern author" onSelect={onSource} />
        <PatternMetadataBadges
          category="Spaceships"
          rulesetId="highlife"
          rulesetLabel="HighLife"
          tags={['moving']}
          onCategorySelect={onCategory}
          onRulesetSelect={onRuleset}
          onTagSelect={onTag}
        />
      </>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'explore.sourceFilterLabel: patternSource.user' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'explore.categoryFilterLabel: Spaceships' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'explore.rulesetFilterLabel: HighLife' }));
    fireEvent.click(screen.getByRole('button', { name: 'explore.tagFilterLabel: moving' }));
    expect(onSource).toHaveBeenCalledWith('user');
    expect(onCategory).toHaveBeenCalledWith('Spaceships');
    expect(onRuleset).toHaveBeenCalledWith('highlife');
    expect(onTag).toHaveBeenCalledWith('moving');
  });

  test('renders static source badges without an interactive filter', () => {
    render(<PatternSourceBadge source="system" />);
    expect(screen.getByText('patternSource.system')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('keeps host metadata details and links while respecting read-only info', () => {
    const onEdit = vi.fn();
    const { container, rerender } = render(
      <PatternInfoPanel
        description="A diagonal spaceship."
        tags={[{ label: 'moving', href: '/tags/moving' }]}
        onEdit={onEdit}
        items={[
          {
            id: 'forks',
            icon: null,
            label: 'Forks',
            value: <span>2</span>,
            details: (
              <ul aria-label="Forks">
                <li>Another board</li>
              </ul>
            ),
          },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'moving' })).toHaveAttribute('href', '/tags/moving');
    expect(container.querySelector('.play-about-meta-list > ul')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'playground.editPatternInfo' }));
    expect(onEdit).toHaveBeenCalledOnce();
    rerender(<PatternInfoPanel description="Read-only board." tags={[]} items={[]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
