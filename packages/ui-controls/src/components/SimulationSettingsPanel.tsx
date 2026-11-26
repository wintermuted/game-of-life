import type { MouseEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface SimulationSettingsPanelProps {
  stabilityOverlayEnabled: boolean;
  birthDeathPreviewEnabled: boolean;
  onStabilityOverlayChange: (enabled: boolean) => void;
  onBirthDeathPreviewChange: (enabled: boolean) => void;
  onShowHelp: (event: MouseEvent<HTMLSpanElement>, description: string) => void;
  onHideHelp: () => void;
}

export function SimulationSettingsPanel({
  stabilityOverlayEnabled,
  birthDeathPreviewEnabled,
  onStabilityOverlayChange,
  onBirthDeathPreviewChange,
  onShowHelp,
  onHideHelp,
}: SimulationSettingsPanelProps): ReactElement {
  const { t } = useTranslation();
  const settings = [
    {
      id: 'stability',
      checked: stabilityOverlayEnabled,
      onChange: onStabilityOverlayChange,
      label: t('diagnostics.stabilityOverlayEnabled'),
      description: t('diagnostics.stabilityOverlayDescription'),
    },
    {
      id: 'birthDeath',
      checked: birthDeathPreviewEnabled,
      onChange: onBirthDeathPreviewChange,
      label: t('diagnostics.birthDeathPreviewEnabled'),
      description: t('diagnostics.birthDeathPreviewDescription'),
    },
  ];
  return (
    <div className="wm-toggle-list">
      {settings.map((setting) => (
        <div className="settings-toggle-item" key={setting.id}>
          <span className="rules-checkbox-main">
            <label className="rules-checkbox-row">
              <input
                type="checkbox"
                className="rules-checkbox-input"
                checked={setting.checked}
                onChange={(event) => setting.onChange(event.target.checked)}
              />
              <span className="rules-checkbox-label">{setting.label}</span>
            </label>
            <span className="rules-popover-wrap">
              <span
                className="rules-popover-trigger"
                aria-label={setting.description}
                role="img"
                onMouseEnter={(event) => onShowHelp(event, setting.description)}
                onMouseLeave={onHideHelp}
              >
                <span className="rules-popover-trigger-icon" aria-hidden="true">
                  i
                </span>
              </span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
