import { ToggleGroup } from '@game-of-life/ui-staging';
import type { ReactElement } from 'react';

interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

function SegmentedControl({
  options,
  selectedValue,
  onChange,
  ariaLabel,
}: SegmentedControlProps): ReactElement {
  return (
    <ToggleGroup options={options} value={selectedValue} onChange={onChange} label={ariaLabel} />
  );
}

export type { SegmentedOption };
export default SegmentedControl;
