import { PatternInput } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Product/Compositions/Patterns/PatternInput',
  component: PatternInput,
  parameters: {
    docs: {
      description: {
        component:
          'Starter/custom pattern workflow using central Tabs. Inactive forms are unmounted so drafts, validation and help reset. Simulation state, palettes, parsing and translations stay in the product.',
      },
    },
  },
  args: { onLoadPattern: fn() },
} satisfies Meta<typeof PatternInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const StarterPatterns: Story = {};
export const RunningSimulation: Story = { args: { disabled: true } };
export const Spanish: Story = { globals: { locale: 'es' } };
export const ResetCustomDraft: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    tabs[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(tabs[1]).toHaveFocus();
    await userEvent.type(canvas.getByRole('textbox'), '0 0');
    tabs[1].focus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.queryByRole('textbox', { hidden: true })).not.toBeInTheDocument();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('textbox')).toHaveValue('');
    await expect(canvas.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tabs[1].id);
  },
};
