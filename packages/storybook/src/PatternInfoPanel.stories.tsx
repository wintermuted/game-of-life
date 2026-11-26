import { PatternInfoPanel } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Patterns/PatternInfoPanel',
  component: PatternInfoPanel,
  args: {
    description: 'A small spaceship that moves diagonally across the board.',
    tags: [
      { label: 'moving', href: '#moving' },
      { label: 'small', href: '#small' },
    ],
    items: [
      {
        id: 'author',
        icon: null,
        label: 'Author',
        value: <span className="play-about-meta-value">Pattern author</span>,
      },
      {
        id: 'category',
        icon: null,
        label: 'Category',
        value: (
          <a className="play-about-meta-value-link" href="#spaceships">
            Spaceships
          </a>
        ),
      },
      {
        id: 'ruleset',
        icon: null,
        label: 'Ruleset',
        value: <span className="play-about-meta-value">Conway's Game of Life</span>,
      },
    ],
    onEdit: fn(),
  },
  argTypes: { items: { control: false } },
  render: (args): ReactElement => (
    <div className="diagnostics-panel play-info-panel">
      <PatternInfoPanel {...args} />
    </div>
  ),
} satisfies Meta<typeof PatternInfoPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ReadOnly: Story = { args: { onEdit: undefined } };
export const NoMetadata: Story = { args: { tags: [], items: [] } };
export const Spanish: Story = { globals: { locale: 'es' } };
