import { BoardPopularityList } from '@game-of-life/ui-patterns';
import { glider } from '@game-of-life/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Patterns/BoardPopularityList',
  component: BoardPopularityList,
  parameters: {
    docs: {
      description: {
        component:
          'Product composition for stars and fork records, including previews and metadata. Routing, date formatting, recent tracking, and modal actions remain host-owned. Not a generic list primitive. DEDUPLICATE-LATER: PlaygroundPatternInfo still renders a compact fork list.',
      },
    },
  },
  args: {
    mode: 'forks',
    starredByUsers: ['Pattern author', 'Another player'],
    forks: [
      {
        id: 'glider-fork',
        name: 'Glider variation',
        author: 'Pattern author',
        grid: glider,
        href: '#glider-fork',
        forkedAt: 'Yesterday',
        updatedAt: 'Today',
        stars: 3,
      },
    ],
    onOpenFork: fn(),
  },
  render: (args): ReactElement => (
    <div className="wm-modal-body">
      <BoardPopularityList {...args} />
    </div>
  ),
} satisfies Meta<typeof BoardPopularityList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Forks: Story = {};
export const Stars: Story = { args: { mode: 'stars' } };
export const NoForks: Story = { args: { forks: [] } };
export const NoStars: Story = { args: { mode: 'stars', starredByUsers: [] } };
