import { GameRules } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';

interface Props {
  rules: GameRules;
  onRulesChange: (rules: GameRules) => void;
  disabled?: boolean;
  embedded?: boolean;
}

function RulesPanel({ rules, onRulesChange, disabled = false, embedded = false }: Props) {
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

  const content = (
    <>
      {!embedded && (
        <div className="card-header">
          <h4>{t('rules.title')}</h4>
        </div>
      )}
      <div className="card-body">
        <p className="rules-description">
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
    </>
  );

  if (embedded) {
    return content;
  }

  return <div className="card rules-panel-card">{content}</div>;
}

export default RulesPanel;
