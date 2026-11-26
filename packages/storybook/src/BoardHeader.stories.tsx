import { BoardHeader, type BoardHeaderProps } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Controls/BoardHeader',
  component: BoardHeader,
  parameters: {
    docs: {
      description: {
        component:
          'Product board-header composition with title, provenance, unsaved status, popularity, and save menu. All persistence and social actions are callbacks; this is not a generic page header.',
      },
    },
  },
  args: {
    title: 'My glider',
    isEditMode: false,
    isSystemPattern: false,
    isUnsavedDraftBoard: false,
    isUnsavedEditableBoard: false,
    starred: false,
    stars: 2,
    forks: 1,
    canSave: true,
    onRename: fn(),
    onSave: fn(),
    onSaveDraft: fn(),
    onToggleStar: fn(),
    onViewForks: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<BoardHeaderProps>();
    return (
      <BoardHeader
        {...args}
        onToggleStar={() => {
          args.onToggleStar();
          updateArgs({ starred: !args.starred, stars: args.stars + (args.starred ? -1 : 1) });
        }}
      />
    );
  },
} satisfies Meta<typeof BoardHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SavedBoard: Story = {};
export const UnsavedDraft: Story = {
  args: {
    isEditMode: true,
    isUnsavedDraftBoard: true,
    isUnsavedEditableBoard: true,
    title: 'New board',
  },
};
export const SystemPattern: Story = { args: { isSystemPattern: true, title: 'Glider' } };
export const ForkOrigin: Story = { args: { forkOriginTitle: 'Glider' } };
export const CannotSave: Story = { args: { canSave: false } };
export const LongTitle: Story = {
  args: { title: 'A colorful spaceship with a deliberately long descriptive board title' },
};
