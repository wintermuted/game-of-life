import {
  SimulationSettingsPanel,
  type SimulationSettingsPanelProps,
} from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ReactElement } from 'react';

const meta = {
  title: 'Product/Compositions/Controls/SimulationSettingsPanel',
  component: SimulationSettingsPanel,
  parameters: {
    docs: {
      description: {
        component:
          'Product composition of simulation overlay settings. Values and help-popover behavior are controlled by the host; this does not replace a generic checkbox primitive.',
      },
    },
  },
  args: {
    stabilityOverlayEnabled: false,
    birthDeathPreviewEnabled: false,
    onStabilityOverlayChange: fn(),
    onBirthDeathPreviewChange: fn(),
    onShowHelp: fn(),
    onHideHelp: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<SimulationSettingsPanelProps>();
    return (
      <div className="diagnostics-panel play-info-panel">
        <SimulationSettingsPanel
          {...args}
          onStabilityOverlayChange={(stabilityOverlayEnabled) => {
            args.onStabilityOverlayChange(stabilityOverlayEnabled);
            updateArgs({ stabilityOverlayEnabled });
          }}
          onBirthDeathPreviewChange={(birthDeathPreviewEnabled) => {
            args.onBirthDeathPreviewChange(birthDeathPreviewEnabled);
            updateArgs({ birthDeathPreviewEnabled });
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof SimulationSettingsPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DisabledOverlays: Story = {};
export const EnabledOverlays: Story = {
  args: { stabilityOverlayEnabled: true, birthDeathPreviewEnabled: true },
};
export const Spanish: Story = { globals: { locale: 'es' } };
export const ToggleOverlays: Story = {
  play: async ({ canvasElement, args }): Promise<void> => {
    const toggles = within(canvasElement).getAllByRole('checkbox');
    await userEvent.click(toggles[0]);
    await expect(args.onStabilityOverlayChange).toHaveBeenCalledWith(true);
    await expect(toggles[0]).toBeChecked();
    await expect(toggles[1]).not.toBeChecked();
  },
};
