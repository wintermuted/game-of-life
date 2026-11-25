import { COLOR_PALETTES } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import { ToggleGroup } from '@wintermuted/ui-react';
import type { ReactElement } from 'react';

interface Props {
  selectedPaletteId: string;
  onPaletteChange: (paletteId: string) => void;
  disabled?: boolean;
}

function ColorPaletteSelector({
  selectedPaletteId,
  onPaletteChange,
  disabled = false,
}: Props): ReactElement {
  const { t } = useTranslation();
  return (
    <div className="ColorPaletteSelector">
      <h5>{t('colors.title')}</h5>
      <ToggleGroup
        options={COLOR_PALETTES.map((palette) => ({
          value: palette.id,
          label: palette.name,
          swatchColor: palette.liveCell,
          title: palette.description || palette.name,
        }))}
        value={selectedPaletteId}
        onChange={onPaletteChange}
        label={t('colors.title')}
        disabled={disabled}
        orientation="vertical"
        appearance="swatches"
        fullWidth
      />
    </div>
  );
}

export default ColorPaletteSelector;
