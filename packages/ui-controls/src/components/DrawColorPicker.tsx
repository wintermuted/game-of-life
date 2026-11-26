import { useId, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@wintermuted/ui-react';
import { SYSTEM_DRAW_COLORS, type DrawColors } from '../hooks/useDrawColors';
import type { GridControlsProps } from './GridControls.types';

export interface DrawColorPickerProps extends Pick<
  GridControlsProps,
  'selectedPaletteId' | 'selectedDrawColor' | 'isGameRunning' | 'onCustomColorCommitted'
> {
  variant: 'play' | 'edit';
  draftValue: DrawColors['customHexValue'];
  onDraftChange: DrawColors['setCustomHexValue'];
  customColors: DrawColors['customColorSlots'];
  onSelect: DrawColors['selectColor'];
  onChange: DrawColors['changeColor'];
}

export function DrawColorPicker({
  variant,
  draftValue,
  onDraftChange,
  customColors,
  onSelect,
  onChange,
  selectedDrawColor,
  isGameRunning,
  onCustomColorCommitted,
}: DrawColorPickerProps): ReactElement {
  const { t } = useTranslation();
  const inputId = useId();
  const systemLabel = t('controls.systemColors');
  const customLabel = t('controls.customColors');
  return (
    <ColorPicker
      value={selectedDrawColor}
      inputId={inputId}
      draftValue={draftValue}
      onDraftChange={onDraftChange}
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
          choices: customColors.map((value, index) => ({
            value,
            label: `${customLabel} ${index + 1} ${value}`,
          })),
        },
      ]}
      onSelect={onSelect}
      onChange={onChange}
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
