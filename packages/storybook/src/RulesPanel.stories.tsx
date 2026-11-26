import { DEFAULT_RULES, RULESETS, STANDARD_RULESET } from '@game-of-life/core';
import { RulesPanel } from '@game-of-life/ui-controls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactElement } from 'react';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';

const meta = {
  title: 'Product/Controls/RulesPanel',
  component: RulesPanel,
  args: {
    rules: DEFAULT_RULES,
    selectedRulesetId: STANDARD_RULESET.id,
    activeRulesetClassification: STANDARD_RULESET.classification,
    disabled: false,
    embedded: false,
    rulesLocked: false,
    onRulesChange: fn(),
    onRulesetChange: fn(),
  },
  render: function Render(args): ReactElement {
    const [, updateArgs] = useArgs<ComponentProps<typeof RulesPanel>>();
    return (
      <RulesPanel
        {...args}
        onRulesChange={(rules) => {
          args.onRulesChange(rules);
          updateArgs({ rules, selectedRulesetId: 'custom' });
        }}
        onRulesetChange={(selectedRulesetId) => {
          args.onRulesetChange?.(selectedRulesetId);
          const ruleset = RULESETS.find((entry) => entry.id === selectedRulesetId);
          if (ruleset) {
            updateArgs({
              selectedRulesetId,
              rules: ruleset.rules,
              activeRulesetClassification: ruleset.classification,
            });
          }
        }}
      />
    );
  },
} satisfies Meta<typeof RulesPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Locked: Story = { args: { rulesLocked: true } };
export const Embedded: Story = { args: { embedded: true } };
export const Spanish: Story = { globals: { locale: 'es' } };
