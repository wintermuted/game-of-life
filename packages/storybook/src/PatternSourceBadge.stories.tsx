import { PatternSourceBadge } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Patterns/PatternSourceBadge',
  component: PatternSourceBadge,
  parameters: {
    docs: {
      description: {
        component: 'DEDUPLICATE-LATER: ProfileBoardSection retains its own static source badges.',
      },
    },
  },
  args: { source: 'system', onSelect: fn() },
} satisfies Meta<typeof PatternSourceBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const User: Story = { args: { source: 'user', creatorName: 'Pattern author' } };
export const Static: Story = { args: { onSelect: undefined } };
