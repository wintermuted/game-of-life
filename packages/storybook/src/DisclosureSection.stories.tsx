import { DisclosureSection } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Playground/DisclosureSection',
  component: DisclosureSection,
  parameters: {
    docs: {
      description: {
        component:
          'Playground layout around the central Accordion. The sibling Rules lock action preserves native disabled and keyboard behavior without toggling or expanding the disclosure. Generic Accordion documentation lives in Wintermuted UI.',
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
      <button className="btn btn-sm btn-secondary-neutral" type="button">
        Lock rules
      </button>
    ),
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Lock rules' });
    const disclosure = canvasElement.querySelector('details');
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(action).toHaveFocus();
    await expect(disclosure).toHaveAttribute('open');
    await userEvent.click(canvas.getByRole('heading', { name: 'Rules' }));
    await expect(disclosure).not.toHaveAttribute('open');
    await userEvent.click(action);
    await expect(disclosure).not.toHaveAttribute('open');
    canvasElement.querySelector('summary')?.focus();
    await expect(canvasElement.querySelector('summary')).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', { name: 'Rules' }));
    await expect(disclosure).toHaveAttribute('open');
  },
};
export const UnsavedBoard: Story = {
  args: {
    title: 'Rules',
    defaultOpen: false,
    headerAction: (
      <button type="button" disabled>
        Lock rules
      </button>
    ),
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Lock rules' })).toBeDisabled();
    canvasElement.querySelector('summary')?.focus();
    await expect(canvasElement.querySelector('summary')).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', { name: 'Rules' }));
    await expect(canvasElement.querySelector('details')).toHaveAttribute('open');
  },
};
export const HeaderFocusOrder: Story = {
  args: {
    title: 'Rules',
    headerAction: <button type="button">Lock rules</button>,
    children: <input aria-label="Rule draft" defaultValue="draft" />,
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    canvasElement.querySelector('summary')?.focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Lock rules' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: 'Rule draft' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(canvas.getByRole('button', { name: 'Lock rules' })).toHaveFocus();
    await userEvent.click(canvas.getByRole('heading', { name: 'Rules' }));
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    canvasElement.querySelector('summary')?.focus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Lock rules' })).toHaveFocus();
  },
};
