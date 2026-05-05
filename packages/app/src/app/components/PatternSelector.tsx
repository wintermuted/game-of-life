import { patterns, Pattern, LifeGrid } from '@game-of-life/core';
import PatternPreview from './PatternPreview';

interface Props {
  onSelectPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function PatternSelector({ onSelectPattern, disabled = false }: Props) {
  function handlePatternClick(pattern: Pattern) {
    if (!disabled) {
      onSelectPattern(pattern.grid);
    }
  }

  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid var(--wm-color-border)',
        borderRadius: 'var(--wm-radius-sm)',
      }}
    >
      {patterns.map((pattern, index) => (
        <li
          key={pattern.name}
          style={{
            borderBottom: index < patterns.length - 1 ? '1px solid var(--wm-color-border)' : 'none',
          }}
        >
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => handlePatternClick(pattern)}
            disabled={disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              textAlign: 'left',
              borderRadius: 0,
            }}
          >
            <PatternPreview grid={pattern.grid} size={60} />
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{pattern.name}</div>
              <span className="badge" style={{ marginTop: '0.25rem' }}>{pattern.category}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PatternSelector;
