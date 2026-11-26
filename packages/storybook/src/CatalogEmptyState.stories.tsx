import { CatalogEmptyState } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Product/Compositions/Patterns/CatalogEmptyState',
  component: CatalogEmptyState,
  parameters: {
    docs: {
      description: {
        component:
          'Product search empty-state composition with host-provided copy and reset action. It is not the upstream generic empty-state primitive.',
      },
    },
  },
  args: {
    title: 'No matching patterns',
    description: 'Try a different search or clear your filters.',
    actionLabel: 'Clear filters',
    onReset: fn(),
  },
} satisfies Meta<typeof CatalogEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NoResults: Story = {};
export const LongMessage: Story = {
  args: {
    description:
      'No patterns match the selected category, ruleset, author, and tags. Clear the filters to see the full catalog.',
  },
};
export const ResetFilters: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Clear filters' }));
    await expect(args.onReset).toHaveBeenCalledOnce();
  },
};
