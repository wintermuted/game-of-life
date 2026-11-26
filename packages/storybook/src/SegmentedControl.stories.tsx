import { SegmentedControl } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Product/Primitives/SegmentedControl',
  component: SegmentedControl,
  args: {
    ariaLabel: 'Edit tool',
    options: [
      { value: 'pencil', label: 'Pencil' },
      { value: 'eraser', label: 'Eraser' },
      { value: 'stamp', label: 'Stamp', disabled: true },
    ],
    selectedValue: 'pencil',
    onChange: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof SegmentedControl>>();
    return (
      <SegmentedControl
        {...args}
        onChange={(selectedValue) => {
          args.onChange(selectedValue);
          updateArgs({ selectedValue });
        }}
      />
    );
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectTool: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Eraser' }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('button', { name: 'Eraser' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
    await expect(canvas.getByRole('button', { name: 'Stamp' })).toBeDisabled();
  },
};
