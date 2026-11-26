import { glider, lwss } from '@game-of-life/core';
import { DEFAULT_PALETTE_ID, getPaletteById } from '@game-of-life/ui';
import { PatternPreview } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Product/Patterns/PatternPreview',
  component: PatternPreview,
  args: { grid: glider, size: 120, palette: getPaletteById(DEFAULT_PALETTE_ID) },
  argTypes: { size: { control: { type: 'range', min: 40, max: 240, step: 10 } } },
  parameters: {
    docs: {
      description: {
        component:
          'Canvas thumbnail for product patterns. Uses engine fixtures and the shared theme context.',
      },
    },
  },
} satisfies Meta<typeof PatternPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Glider: Story = {};
export const LightweightSpaceship: Story = { args: { grid: lwss } };
export const Empty: Story = { args: { grid: {} } };
export const Dark: Story = { globals: { theme: 'dark' } };
