import { DisclosureSection } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Primitives/DisclosureSection',
  component: DisclosureSection,
  parameters: {
    docs: {
      description: {
        component:
          'Native disclosure shell extracted from the diagnostics and information panels. Content and optional header actions are supplied by the host. No dialog, menu, or persistence infrastructure is introduced.',
      },
    },
  },
  args: { title: 'Statistics', children: <p>Generation 42; 5 live cells.</p>, defaultOpen: true },
  argTypes: { children: { control: false }, headerAction: { control: false } },
  render: (args): ReactElement => (
    <div className="diagnostics-panel">
      <DisclosureSection {...args} />
    </div>
  ),
} satisfies Meta<typeof DisclosureSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Expanded: Story = {};
export const Collapsed: Story = { args: { defaultOpen: false } };
export const HeaderAction: Story = {
  args: {
    title: 'Rules',
    headerAction: (
      <button
        className="btn btn-sm btn-secondary-neutral"
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        Lock rules
      </button>
    ),
  },
  play: async ({ canvasElement }): Promise<void> => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Lock rules' }));
    await expect(canvasElement.querySelector('details')).toHaveAttribute('open');
  },
};
