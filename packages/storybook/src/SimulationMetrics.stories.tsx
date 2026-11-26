import { SimulationMetrics, type SimulationDiagnostics } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';

const empty: SimulationDiagnostics = {
  liveColorLeaderboard: [],
  maxLiveColorCount: 0,
  overcrowdingPressureLeaderboard: [],
  maxOvercrowdingPressureCount: 0,
  experimentalBirthLeaderboard: [],
  maxExperimentalBirthCount: 0,
  hasExperimentalRulesEnabled: false,
};
const meta = {
  title: 'Product/Controls/SimulationMetrics',
  component: SimulationMetrics,
  args: {
    generation: 42,
    stats: { liveCells: 12, births: 7, deaths: 3 },
    diagnostics: {
      ...empty,
      liveColorLeaderboard: [
        { color: '#22c55e', count: 8 },
        { color: '#3b82f6', count: 4 },
      ],
      maxLiveColorCount: 8,
      overcrowdingPressureLeaderboard: [{ color: '#3b82f6', count: 3 }],
      maxOvercrowdingPressureCount: 3,
    },
  },
} satisfies Meta<typeof SimulationMetrics>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {
  args: { generation: 0, stats: { liveCells: 0, births: 0, deaths: 0 }, diagnostics: empty },
};
export const ExperimentalBirths: Story = {
  args: {
    diagnostics: {
      ...empty,
      hasExperimentalRulesEnabled: true,
      experimentalBirthLeaderboard: [{ color: '#22c55e', count: 7, tieBreakCount: 2 }],
      maxExperimentalBirthCount: 7,
    },
  },
};
