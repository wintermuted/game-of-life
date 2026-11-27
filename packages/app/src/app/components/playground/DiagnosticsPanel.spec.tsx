import { useState, type ComponentProps, type ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DiagnosticsPanel } from './DiagnosticsPanel';

function SimulationPanels(): ReactElement {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'diagnostics' | 'patterns'>(
    'diagnostics',
  );
  const props: ComponentProps<typeof DiagnosticsPanel> = {
    board: { generation: 0, stats: { liveCells: 0, births: 0, deaths: 0 } },
    playback: { isGameRunning: false },
    editing: { handleCenterCoordinateRequest: vi.fn() },
    stamp: { handlePatternInputLoad: vi.fn() },
    presentation: {
      activeSidebarTab,
      setActiveSidebarTab,
      selectedPaletteId: 'default',
      cellDataCopied: false,
      copyCellData: vi.fn(),
    },
    diagnostics: {
      gridJSON: '{}',
      cellDataEntries: [],
      liveColorLeaderboard: [],
      maxLiveColorCount: 0,
      overcrowdingPressureLeaderboard: [],
      maxOvercrowdingPressureCount: 0,
      experimentalBirthLeaderboard: [],
      maxExperimentalBirthCount: 0,
      hasExperimentalRulesEnabled: false,
    },
  };
  return <DiagnosticsPanel {...props} />;
}

describe('Simulation panel lifecycle', () => {
  test('resets diagnostics disclosures and nested pattern selection on tab changes', () => {
    const { container } = render(<SimulationPanels />);
    const statistics = screen.getByRole('heading', { name: 'Statistics' }).closest('details');
    expect(statistics).toHaveClass('wm-accordion');
    expect(statistics).toHaveAttribute('open');
    statistics?.removeAttribute('open');
    fireEvent.click(screen.getByRole('tab', { name: 'Patterns', exact: true }));
    expect(statistics).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Custom Pattern' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '0 0' } });
    fireEvent.click(screen.getByRole('tab', { name: 'State', exact: true }));
    expect(screen.queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Statistics' }).closest('details')).toHaveAttribute(
      'open',
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Patterns', exact: true }));
    expect(screen.getByRole('tab', { name: 'Starter Patterns' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
