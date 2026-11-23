import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SYSTEM_DRAW_COLORS, type DrawColors } from '../hooks/useDrawColors';
import type { GridControlsProps } from './GridControls.types';

interface Props extends Pick<
  GridControlsProps,
  'selectedPaletteId' | 'selectedDrawColor' | 'isGameRunning' | 'onCustomColorCommitted'
> {
  variant: 'play' | 'edit';
  colors: DrawColors;
}

export function DrawColorPicker({
  variant,
  colors,
  selectedPaletteId,
  selectedDrawColor,
  isGameRunning,
  onCustomColorCommitted,
}: Props): ReactElement {
  const { t } = useTranslation();
  const colorPaletteLabel = variant === 'play' ? t('controls.drawColor') : t('colors.title');
  const systemColorsLabel = t('controls.systemColors');
  const customColorsLabel = t('controls.customColors');
  const customColorLabel = t('controls.customColor');
  const customColorHexLabel = t('controls.customColorHex');
  const inputId = variant === 'play' ? 'custom-draw-color-play' : 'custom-draw-color-sidebar';

  return (
    <details
      className={`grid-controls-color-picker grid-controls-color-picker-${selectedPaletteId}`}
      aria-label={colorPaletteLabel}
    >
      <summary
        className={
          variant === 'play'
            ? 'btn btn-sm btn-secondary-neutral grid-controls-color-picker-trigger grid-controls-edit-tool-button grid-controls-edit-tool-button-right'
            : 'grid-controls-color-picker-trigger'
        }
        aria-label={colorPaletteLabel}
      >
        <span
          className="grid-controls-color-picker-dot"
          style={{ backgroundColor: selectedDrawColor }}
          aria-hidden="true"
        ></span>
      </summary>
      <div className="grid-controls-color-picker-panel">
        <p className="grid-controls-color-picker-title">{colorPaletteLabel}</p>
        <p className="grid-controls-color-group-label">{systemColorsLabel}</p>
        <div className="grid-controls-color-swatch-grid">
          {SYSTEM_DRAW_COLORS.map((color) => (
            <button
              key={color}
              className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
              type="button"
              aria-label={`${systemColorsLabel} ${color}`}
              title={color}
              style={{ backgroundColor: color }}
              onClick={(event) => colors.selectSystemColor(event, color)}
              disabled={isGameRunning}
            ></button>
          ))}
        </div>
        <p className="grid-controls-color-group-label">{customColorsLabel}</p>
        <div className="grid-controls-color-swatch-grid grid-controls-color-swatch-grid-custom">
          {colors.customColorSlots.map((color, index) => (
            <button
              key={`${color}-${index}`}
              className={`grid-controls-color-swatch${selectedDrawColor.toLowerCase() === color.toLowerCase() ? ' grid-controls-color-swatch-active' : ''}`}
              type="button"
              aria-label={`${customColorsLabel} ${index + 1} ${color}`}
              title={color}
              style={{ backgroundColor: color }}
              onClick={(event) => colors.selectCustomColor(event, color, index)}
              disabled={isGameRunning}
            ></button>
          ))}
        </div>
        <div className="grid-controls-custom-color-row">
          <label className="grid-controls-custom-color-label" htmlFor={inputId}>
            {customColorLabel}
          </label>
          <div className="grid-controls-custom-color-inputs">
            <input
              id={inputId}
              className="grid-controls-color-native-input"
              type="color"
              value={selectedDrawColor}
              onChange={(event) => colors.changeNativeColor(event.target.value)}
              disabled={isGameRunning}
              aria-label={customColorLabel}
            />
            <input
              className="grid-controls-color-hex-input"
              type="text"
              inputMode="text"
              value={colors.customHexValue}
              onChange={(event) => colors.setCustomHexValue(event.target.value)}
              onBlur={(event) => colors.applyCustomHex(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  const committedColor = colors.applyCustomHex(colors.customHexValue);
                  if (committedColor) {
                    onCustomColorCommitted?.(committedColor);
                    colors.closeMenu(event.currentTarget);
                  }
                }
              }}
              placeholder="#22c55e"
              aria-label={customColorHexLabel}
              disabled={isGameRunning}
            />
          </div>
        </div>
      </div>
    </details>
  );
}
