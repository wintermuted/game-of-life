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

function SegmentedControl({ options, selectedValue, onChange, ariaLabel }: SegmentedControlProps) {
  return (
    <div className="btn-group" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`btn btn-sm ${selectedValue === option.value ? 'btn-primary-neutral' : 'btn-secondary-neutral'}`}
          aria-pressed={selectedValue === option.value}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type { SegmentedOption };
export default SegmentedControl;
