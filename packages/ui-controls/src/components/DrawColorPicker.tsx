import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@game-of-life/ui-staging';
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
  selectedDrawColor,
  isGameRunning,
  onCustomColorCommitted,
}: Props): ReactElement {
  const { t } = useTranslation();
  const systemLabel = t('controls.systemColors');
  const customLabel = t('controls.customColors');
  return (
    <ColorPicker
      value={selectedDrawColor}
      inputId={variant === 'play' ? 'custom-draw-color-play' : 'custom-draw-color-sidebar'}
      draftValue={colors.customHexValue}
      onDraftChange={colors.setCustomHexValue}
      label={variant === 'play' ? t('controls.drawColor') : t('colors.title')}
      inputLabel={t('controls.customColor')}
      hexLabel={t('controls.customColorHex')}
      invalidLabel={t('uiControls:invalidHex')}
      groups={[
        {
          id: 'system',
          label: systemLabel,
          choices: SYSTEM_DRAW_COLORS.map((value) => ({ value, label: `${systemLabel} ${value}` })),
        },
        {
          id: 'custom',
          label: customLabel,
          choices: colors.customColorSlots.map((value, index) => ({
            value,
            label: `${customLabel} ${index + 1} ${value}`,
          })),
        },
      ]}
      onSelect={colors.selectColor}
      onChange={colors.changeColor}
      onCommit={onCustomColorCommitted}
      disabled={isGameRunning}
      placement={variant === 'play' ? 'right' : 'above'}
      triggerClassName={
        variant === 'play'
          ? 'btn btn-sm btn-secondary-neutral grid-controls-edit-tool-button grid-controls-edit-tool-button-right'
          : undefined
      }
    />
  );
}
