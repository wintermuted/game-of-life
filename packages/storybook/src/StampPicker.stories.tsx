import { StampPicker } from '@game-of-life/ui-controls';
import { useThemeMode } from '@game-of-life/ui';
import { glider } from '@game-of-life/core';
import { rotateGridAroundBoundsCenter, rotateStampRotationClockwise } from '@game-of-life/util';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Controls/StampPicker',
  component: StampPicker,
  args: {
    selectedPaletteId: 'classic',
    activeEditTool: 'stamp',
    stampRotation: 0,
    stampPattern: null,
    stampPreviewPattern: null,
    stampPatternName: '',
    searchQuery: '',
    selectedCategory: 'all',
    onSearchQueryChange: fn(),
    onCategoryChange: fn(),
    onEditToolChange: fn(),
    onStampPatternSelect: fn(),
    onRotateStamp: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof StampPicker>>();
    const { mode } = useThemeMode();
    return (
      <div className="grid-stage storybook-grid" data-theme-mode={mode}>
        <StampPicker
          {...args}
          stampPreviewPattern={
            args.stampPreviewPattern
              ? rotateGridAroundBoundsCenter(args.stampPreviewPattern, args.stampRotation ?? 0)
              : args.stampPreviewPattern
          }
          onSearchQueryChange={(searchQuery) => {
            args.onSearchQueryChange?.(searchQuery);
            updateArgs({ searchQuery });
          }}
          onCategoryChange={(selectedCategory) => {
            args.onCategoryChange?.(selectedCategory);
            updateArgs({ selectedCategory });
          }}
          onStampPatternSelect={(stampPattern) => {
            args.onStampPatternSelect?.(stampPattern);
            updateArgs({ stampPattern, stampPreviewPattern: stampPattern });
          }}
          onRotateStamp={() => {
            args.onRotateStamp?.();
            updateArgs({ stampRotation: rotateStampRotationClockwise(args.stampRotation ?? 0) });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof StampPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selected: Story = {
  args: { stampPattern: glider, stampPreviewPattern: glider, stampPatternName: 'Glider' },
};
export const EmptySearch: Story = { args: { searchQuery: 'no-such-pattern' } };
export const Rotated: Story = {
  args: {
    stampPattern: glider,
    stampPreviewPattern: glider,
    stampPatternName: 'Glider',
    stampRotation: 90,
  },
};
