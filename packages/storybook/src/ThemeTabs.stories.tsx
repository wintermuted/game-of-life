import { ThemeTabs } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Product/Primitives/ThemeTabs',
  component: ThemeTabs,
  args: {
    ariaLabel: 'Pattern category',
    options: [
      { value: 'still', label: 'Still lifes' },
      { value: 'oscillators', label: 'Oscillators' },
      { value: 'spaceships', label: 'Spaceships' },
    ],
    activeValue: 'still',
    onChange: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof ThemeTabs>>();
    return (
      <ThemeTabs
        {...args}
        onChange={(activeValue) => {
          args.onChange(activeValue);
          updateArgs({ activeValue });
        }}
      />
    );
  },
} satisfies Meta<typeof ThemeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectCategory: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Oscillators' }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('tab', { name: 'Oscillators' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  },
};
