import type { ComponentProps } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { DiagnosticsMetrics } from './DiagnosticsMetrics';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

function createProps(): ComponentProps<typeof DiagnosticsMetrics> {
  return {
    generation: 0,
    stats: { liveCells: 5, births: 0, deaths: 2 },
    diagnostics: {
      liveColorLeaderboard: [
        { color: '#123456', count: 4 },
        { color: '#abcdef', count: 1 },
      ],
      maxLiveColorCount: 4,
      overcrowdingPressureLeaderboard: [],
      maxOvercrowdingPressureCount: 0,
      experimentalBirthLeaderboard: [],
      maxExperimentalBirthCount: 0,
      hasExperimentalRulesEnabled: false,
    },
  };
}

describe('Published diagnostic components', () => {
  test('keeps label-first compact metrics, zero values and proportional color bars', () => {
    const { container } = render(<DiagnosticsMetrics {...createProps()} />);
    const generations = screen.getByText('diagnostics.generations').closest('article');
    expect(generations).toHaveClass('wm-stat-card-compact');
    expect(generations?.firstElementChild).toHaveTextContent('diagnostics.generations');
    expect(within(generations!).getByText('0')).toBeInTheDocument();
    const rows = within(
      screen.getByRole('list', { name: 'diagnostics.liveCellsByColor' }),
    ).getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('#123456');
    expect(rows[1]).toHaveTextContent('#abcdef');
    const bars = container.querySelectorAll<HTMLElement>('.wm-ranked-fill');
    expect([...bars].map((bar) => bar.style.width)).toStrictEqual(['100%', '25%']);
    expect(screen.getByText('diagnostics.totalBirths').closest('article')).toHaveClass(
      'wm-stat-card-success',
      'wm-stat-card-compact',
    );
    expect(screen.getByText('diagnostics.totalDeaths').closest('article')).toHaveClass(
      'wm-stat-card-danger',
      'wm-stat-card-compact',
    );
  });

  test('preserves translated empty and disabled-rule states without fabricating bars', () => {
    const props = createProps();
    props.diagnostics.liveColorLeaderboard = [];
    props.diagnostics.maxLiveColorCount = 0;
    render(<DiagnosticsMetrics {...props} />);
    expect(screen.getByText('diagnostics.noLiveCellsByColor')).toBeInTheDocument();
    expect(screen.getByText('diagnostics.noOvercrowdingDeathsByOtherColor')).toBeInTheDocument();
    expect(screen.getByText('diagnostics.experimentalRulesDisabled')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
