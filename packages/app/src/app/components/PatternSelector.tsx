import { patterns, Pattern, LifeGrid } from '@game-of-life/core';
import PatternPreview from './PatternPreview';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';

interface Props {
  onSelectPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
  selectedPaletteId?: string;
}

function PatternSelector({ onSelectPattern, disabled = false, selectedPaletteId = DEFAULT_PALETTE_ID }: Props) {
  const palette = getPaletteById(selectedPaletteId);

  function formatPatternTitle(name: string) {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

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
              justifyContent: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              textAlign: 'left',
              borderRadius: 0,
            }}
          >
            <PatternPreview grid={pattern.grid} size={60} palette={palette} />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  lineHeight: 1.2,
                  textTransform: 'none',
                  letterSpacing: 0,
                }}
              >
                {formatPatternTitle(pattern.name)}
              </div>
              <span className="badge" style={{ marginTop: '0.25rem' }}>{pattern.category}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PatternSelector;
