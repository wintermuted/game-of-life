import { EditToolControls } from '@game-of-life/ui-controls';
import { useThemeMode } from '@game-of-life/ui';
import { rotateGridAroundBoundsCenter, rotateStampRotationClockwise } from '@game-of-life/util';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Controls/EditToolControls',
  component: EditToolControls,
  args: {
    activeEditTool: 'pencil',
    selectedPaletteId: 'classic',
    selectedDrawColor: '#22c55e',
    draftValue: '#22c55e',
    customColors: ['#ffffff', '#000000', '#f43f5e', '#14b8a6'],
    isGameRunning: false,
    canUndoBoardChange: false,
    stampRotation: 0,
    onEditToolChange: fn(),
    onFillSelectionColor: fn(),
    onUndoBoardChange: fn(),
    onDraftChange: fn(),
    onSelect: fn(),
    onChange: fn(),
    onCustomColorCommitted: fn(),
    onStampPatternSelect: fn(),
    onRotateStamp: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof EditToolControls>>();
    const { mode } = useThemeMode();
    return (
      <div className="grid-stage storybook-grid" data-theme-mode={mode}>
        <div className="grid-overlay-controls grid-overlay-controls-top-left">
          <div className="GridControls">
            <div className="grid-controls-form grid-controls-form-play">
              <EditToolControls
                {...args}
                stampPreviewPattern={
                  args.stampPreviewPattern
                    ? rotateGridAroundBoundsCenter(
                        args.stampPreviewPattern,
                        args.stampRotation ?? 0,
                      )
                    : args.stampPreviewPattern
                }
                onEditToolChange={(activeEditTool) => {
                  args.onEditToolChange?.(activeEditTool);
                  updateArgs({ activeEditTool });
                }}
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
                onStampPatternSelect={(stampPattern) => {
                  args.onStampPatternSelect?.(stampPattern);
                  updateArgs({
                    stampPattern,
                    stampPreviewPattern: stampPattern,
                    activeEditTool: 'stamp',
                  });
                }}
                onRotateStamp={() => {
                  args.onRotateStamp?.();
                  updateArgs({
                    stampRotation: rotateStampRotationClockwise(args.stampRotation ?? 0),
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
} satisfies Meta<typeof EditToolControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selection: Story = { args: { activeEditTool: 'selection', canUndoBoardChange: true } };
export const Eraser: Story = { args: { activeEditTool: 'eraser' } };
