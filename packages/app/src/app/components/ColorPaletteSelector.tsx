import { COLOR_PALETTES, ColorPalette } from '../constants/colors';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedPaletteId: string;
  onPaletteChange: (paletteId: string) => void;
  disabled?: boolean;
}

function ColorPaletteSelector({ selectedPaletteId, onPaletteChange, disabled = false }: Props) {
  const { t } = useTranslation();

  return (
    <div className="ColorPaletteSelector">
      <h5>{t('colors.title')}</h5>
      <div
        className="wm-toggle-group wm-toggle-group-vertical wm-toggle-group-full"
        role="group"
        aria-label={t('colors.title')}
      >
        {COLOR_PALETTES.map((palette: ColorPalette) => (
          <button
            key={palette.id}
            className={`wm-toggle-group-btn${selectedPaletteId === palette.id ? ' wm-toggle-group-btn-active' : ''}`}
            type="button"
            aria-pressed={selectedPaletteId === palette.id}
            title={palette.description || palette.name}
            disabled={disabled}
            onClick={() => onPaletteChange(palette.id)}
          >
            <span
              className="wm-toggle-group-swatch"
              style={{ background: palette.liveCell, borderColor: 'rgba(255,255,255,0.2)' }}
            />
            <span>{palette.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ColorPaletteSelector;
