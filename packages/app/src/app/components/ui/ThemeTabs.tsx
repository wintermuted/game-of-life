interface TabOption {
  value: string;
  label: string;
}

interface ThemeTabsProps {
  options: TabOption[];
  activeValue: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

function ThemeTabs({ options, activeValue, onChange, ariaLabel = 'Tabs' }: ThemeTabsProps) {
  return (
    <div className="tab-bar" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`tab-btn${activeValue === option.value ? ' tab-btn-active' : ''}`}
          role="tab"
          aria-selected={activeValue === option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type { TabOption };
export default ThemeTabs;
