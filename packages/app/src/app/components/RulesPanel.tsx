import { GameRules } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';

interface Props {
  rules: GameRules;
  onRulesChange: (rules: GameRules) => void;
  disabled?: boolean;
}

function RulesPanel({ rules, onRulesChange, disabled = false }: Props) {
  const { t } = useTranslation();
  
  const handleToggle = (ruleId: keyof GameRules) => {
    const updatedRules = {
      ...rules,
      [ruleId]: {
        ...rules[ruleId],
        enabled: !rules[ruleId].enabled
      }
    };
    onRulesChange(updatedRules);
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div className="card-header">
        <h4>{t('rules.title')}</h4>
      </div>
      <div className="card-body">
        <p style={{ fontSize: '0.875rem', color: 'var(--wm-color-text-muted)', marginBottom: '0.75rem', marginTop: 0 }}>
          {t('rules.description')}
        </p>
        <div className="wm-toggle-list">
          {Object.entries(rules).map(([key, rule]) => (
            <div key={rule.id}>
              <label className="wm-toggle">
                <input
                  type="checkbox"
                  className="wm-toggle-input"
                  checked={rule.enabled}
                  onChange={() => handleToggle(key as keyof GameRules)}
                  disabled={disabled}
                />
                <span className="wm-toggle-track"><span className="wm-toggle-thumb"></span></span>
                <span className="wm-toggle-label">{rule.name}</span>
              </label>
              <p className="wm-toggle-description">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RulesPanel;
