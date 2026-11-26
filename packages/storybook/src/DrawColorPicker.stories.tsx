import { DrawColorPicker } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Controls/DrawColorPicker',
  component: DrawColorPicker,
  parameters: {
    docs: {
      description: {
        component:
          'Product adapter around the canonical @wintermuted/ui-react ColorPicker; not a duplicate implementation.',
      },
    },
  },
  args: {
    variant: 'edit',
    selectedPaletteId: 'classic',
    selectedDrawColor: '#22c55e',
    draftValue: '#22c55e',
    customColors: ['#ffffff', '#000000', '#f43f5e', '#14b8a6'],
    isGameRunning: false,
    onDraftChange: fn(),
    onSelect: fn(),
    onChange: fn(),
    onCustomColorCommitted: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof DrawColorPicker>>();
    return (
      <DrawColorPicker
        {...args}
        onDraftChange={(draftValue) => {
          args.onDraftChange(draftValue);
          updateArgs({ draftValue });
        }}
        onSelect={(selectedDrawColor, group, index) => {
          args.onSelect(selectedDrawColor, group, index);
          updateArgs({ selectedDrawColor, draftValue: selectedDrawColor });
        }}
        onChange={(selectedDrawColor) => {
          args.onChange(selectedDrawColor);
          updateArgs({ selectedDrawColor, draftValue: selectedDrawColor });
        }}
      />
    );
  },
} satisfies Meta<typeof DrawColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Toolbar: Story = { args: { variant: 'play' } };
export const InvalidDraft: Story = { args: { draftValue: 'not-a-color' } };
export const Disabled: Story = { args: { isGameRunning: true } };
