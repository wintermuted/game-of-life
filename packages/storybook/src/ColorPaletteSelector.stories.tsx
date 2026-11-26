import { COLOR_PALETTES, ColorPaletteSelector, DEFAULT_PALETTE_ID } from '@game-of-life/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Primitives/ColorPaletteSelector',
  component: ColorPaletteSelector,
  args: {
    selectedPaletteId: DEFAULT_PALETTE_ID,
    disabled: false,
    onPaletteChange: fn(),
  },
  argTypes: {
    selectedPaletteId: {
      control: 'select',
      options: COLOR_PALETTES.map((palette) => palette.id),
    },
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof ColorPaletteSelector>>();
    return (
      <ColorPaletteSelector
        {...args}
        onPaletteChange={(selectedPaletteId) => {
          args.onPaletteChange(selectedPaletteId);
          updateArgs({ selectedPaletteId });
        }}
      />
    );
  },
} satisfies Meta<typeof ColorPaletteSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
