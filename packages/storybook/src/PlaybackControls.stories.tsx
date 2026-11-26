import { PlaybackControls } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Product/Controls/PlaybackControls',
  component: PlaybackControls,
  args: {
    isEditMode: false,
    isSystemPattern: false,
    activeEditTool: 'grab',
    isGameRunning: false,
    generationSpeed: 5,
    onEditToolChange: fn(),
    onEnterEditMode: fn(),
    onEnterPlayMode: fn(),
    toggleGame: fn(),
    nextGeneration: fn(),
    onResetRequested: fn(),
    updateGenerationSpeed: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof PlaybackControls>>();
    return (
      <div className="grid-controls-form grid-controls-form-play">
        <PlaybackControls
          {...args}
          toggleGame={() => {
            args.toggleGame();
            updateArgs({ isGameRunning: !args.isGameRunning });
          }}
          updateGenerationSpeed={(generationSpeed) => {
            args.updateGenerationSpeed(generationSpeed);
            updateArgs({ generationSpeed });
          }}
          onEnterEditMode={() => {
            args.onEnterEditMode?.();
            updateArgs({ isEditMode: true });
          }}
          onEnterPlayMode={() => {
            args.onEnterPlayMode?.();
            updateArgs({ isEditMode: false });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof PlaybackControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Running: Story = { args: { isGameRunning: true } };
export const EditMode: Story = { args: { isEditMode: true } };
export const SpeedLimit: Story = { args: { generationSpeed: 10 } };
export const TogglePlayback: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Start' }));
    await waitFor(async (): Promise<void> => {
      await expect(canvas.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    });
  },
};
