import { BoardNameForm, type BoardNameFormProps } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Forms/BoardNameForm',
  component: BoardNameForm,
  parameters: {
    docs: {
      description: {
        component:
          'Full product form for renaming or forking a board. The host owns its modal, submission, and persistence; this is not an input primitive.',
      },
    },
  },
  args: { name: 'Glider', mode: 'rename', onNameChange: fn(), onSubmit: fn(), onCancel: fn() },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<BoardNameFormProps>();
    return (
      <div className="wm-modal-panel">
        <BoardNameForm
          {...args}
          onNameChange={(name) => {
            args.onNameChange(name);
            updateArgs({ name });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof BoardNameForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Rename: Story = {};
export const Fork: Story = { args: { mode: 'fork', name: 'Glider (fork)' } };
export const Spanish: Story = { globals: { locale: 'es' } };
export const SubmitWithEnter: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'My glider{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
