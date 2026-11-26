import { CellDataInspector } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Controls/CellDataInspector',
  component: CellDataInspector,
  parameters: {
    docs: {
      description: {
        component:
          'Product diagnostics composition for cell colors and coordinate actions. The host owns clipboard operations, copy-feedback timing, and viewport movement.',
      },
    },
  },
  args: {
    entries: [
      ['0,0', '#22c55e'],
      ['1,0', '#ef4444'],
    ],
    copied: false,
    onCopy: fn(),
    onCoordinateSelect: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs();
    return (
      <div className="diagnostics-panel">
        <CellDataInspector
          {...args}
          onCopy={() => {
            args.onCopy();
            updateArgs({ copied: true });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof CellDataInspector>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Empty: Story = { args: { entries: [] } };
export const Copied: Story = { args: { copied: true } };
export const CopyAndSelect: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '"0,0"' }));
    await expect(args.onCoordinateSelect).toHaveBeenCalledWith('0,0');
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(canvas.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
  },
};
