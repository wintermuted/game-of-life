import { BoardDetailsForm, type BoardDetailsFormProps } from '@game-of-life/ui-patterns';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Forms/BoardDetailsForm',
  component: BoardDetailsForm,
  parameters: {
    docs: {
      description: {
        component:
          'Full board metadata form: name, category, description, tags, and visibility. The host owns save/edit mode, the dialog title, and persistence.',
      },
    },
  },
  args: {
    values: {
      name: 'My glider',
      category: 'Spaceships',
      description: 'A diagonal spaceship.',
      tags: 'small, moving',
      visibility: 'public',
    },
    categoryOptions: ['Spaceships', 'Oscillators', 'Still lifes'],
    onChange: fn(),
    onSubmit: fn(),
    onCancel: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<BoardDetailsFormProps>();
    return (
      <div className="wm-modal-panel">
        <BoardDetailsForm
          {...args}
          onChange={(values) => {
            args.onChange(values);
            updateArgs({ values });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof BoardDetailsForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {};
export const Private: Story = { args: { values: { ...meta.args.values, visibility: 'private' } } };
export const MissingRequiredFields: Story = {
  args: { values: { ...meta.args.values, name: '', category: '' } },
};
export const Spanish: Story = { globals: { locale: 'es' } };
export const CompleteAndSave: Story = {
  args: { values: { ...meta.args.values, name: '', category: '' } },
  play: async ({ canvasElement, args }): Promise<void> => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole('button', { name: 'Save board' });
    await expect(save).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: 'Pattern name' }), 'New spaceship');
    await userEvent.selectOptions(canvas.getByRole('combobox'), 'Spaceships');
    await expect(save).toBeEnabled();
    await userEvent.click(save);
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};
