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
    <ul className="pattern-selector-list">
      {patterns.map((pattern, index) => (
        <li
          key={pattern.name}
          className={`pattern-selector-item${index === patterns.length - 1 ? ' pattern-selector-item-last' : ''}`}
        >
          <button
            className="btn btn-ghost pattern-selector-btn"
            type="button"
            onClick={() => handlePatternClick(pattern)}
            disabled={disabled}
          >
            <PatternPreview grid={pattern.grid} size={60} palette={palette} />
            <div className="pattern-selector-meta">
              <div className="pattern-selector-title">
                {formatPatternTitle(pattern.name)}
              </div>
              <span className="badge pattern-selector-badge">{pattern.category}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PatternSelector;
