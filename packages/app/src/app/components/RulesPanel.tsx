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

  const allRuleEntries = Object.entries(rules) as Array<[keyof GameRules, GameRules[keyof GameRules]]>;
  const standardRuleEntries = allRuleEntries.filter(([key]) => !String(key).startsWith('experimental'));
  const experimentalRuleEntries = allRuleEntries.filter(([key]) => String(key).startsWith('experimental'));
  
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
      <div className={embedded ? 'rules-panel-body rules-panel-body-embedded' : 'card-body rules-panel-body'}>
        <details className="rules-subsection rules-subsection-collapsible" open>
          <summary className="rules-subsection-summary">
            <h5 className="rules-subsection-heading">{t('rules.standardSection')}</h5>
          </summary>
          <div className="rules-subsection-content">
            <div className="wm-toggle-list">
              {standardRuleEntries.map(([key, rule]) => (
                <div key={rule.id}>
                  <label className="wm-toggle">
                    <input
                      type="checkbox"
                      className="wm-toggle-input"
                      checked={rule.enabled}
                      onChange={() => handleToggle(key)}
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
        </details>

        {experimentalRuleEntries.length > 0 && (
          <details className="rules-subsection rules-subsection-collapsible" open>
            <summary className="rules-subsection-summary">
              <h5 className="rules-subsection-heading">{t('rules.experimentalSection')}</h5>
            </summary>
            <div className="rules-subsection-content">
              <div className="wm-toggle-list">
                {experimentalRuleEntries.map(([key, rule]) => (
                  <div key={rule.id}>
                    <label className="wm-toggle">
                      <input
                        type="checkbox"
                        className="wm-toggle-input"
                        checked={rule.enabled}
                        onChange={() => handleToggle(key)}
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
          </details>
        )}
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return <div className="card rules-panel-card">{content}</div>;
}

export default RulesPanel;
