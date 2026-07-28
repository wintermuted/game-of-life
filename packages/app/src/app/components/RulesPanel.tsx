import { GameRule, GameRuleKey, GameRules, RULESETS, STANDARD_RULESET } from '@game-of-life/core';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface Props {
  rules: GameRules;
  onRulesChange: (rules: GameRules) => void;
  selectedRulesetId?: string;
  onRulesetChange?: (rulesetId: string) => void;
  disabled?: boolean;
  embedded?: boolean;
  rulesLocked?: boolean;
  activeRulesetClassification?: string;
}

function RulesPanel({
  rules,
  onRulesChange,
  selectedRulesetId = 'standard',
  onRulesetChange,
  disabled = false,
  embedded = false,
  rulesLocked = false,
  activeRulesetClassification = STANDARD_RULESET.classification,
}: Props) {
  const { t } = useTranslation();
  const [hoverPopover, setHoverPopover] = useState<null | { text: string; left: number; top: number }>(null);

  const allRuleEntries = Object.entries(rules).filter(([key]) => key !== 'lifeLikeProfile') as Array<[GameRuleKey, GameRule]>;
  const standardRuleEntries = allRuleEntries.filter(([key]) => !String(key).startsWith('experimental') && key !== 'birth6');
  const experimentalRuleEntries = allRuleEntries.filter(([key]) => String(key).startsWith('experimental'));
  const lifeLikeProfile = rules.lifeLikeProfile;
  
  const getExperimentalRuleLabel = (ruleName: string): string => ruleName.replace(/^Experimental Species /, '');

  const getRuleDisplayName = (ruleName: string, isExperimental: boolean): string => {
    return isExperimental ? getExperimentalRuleLabel(ruleName) : ruleName;
  };

  const getRuleNotation = (ruleId: GameRuleKey): string | null => {
    if (ruleId === 'birth3') return rules.birth6.enabled ? 'B36' : 'B3';
    if (ruleId === 'survival2') return 'S0-1';
    if (ruleId === 'survival3') return 'S2-3';
    if (ruleId === 'death') return 'S4-8';
    return null;
  };

  const getRuleDescription = (ruleId: GameRuleKey): string => {
    if (ruleId === 'birth3' && rules.birth6.enabled) {
      return t('rules.highlifeReproductionDescription');
    }

    return (rules[ruleId] as GameRule).description;
  };

  const handleRulesetSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (onRulesetChange) {
      onRulesetChange(event.target.value);
    }
  };
  
  const handleToggle = (ruleId: GameRuleKey) => {
    if (rulesLocked || disabled) {
      return;
    }

    const updatedRules = {
      ...rules,
      [ruleId]: {
        ...rules[ruleId],
        enabled: !rules[ruleId].enabled
      }
    };
    onRulesChange(updatedRules);
  };

  const showPopover = (event: MouseEvent<HTMLSpanElement>, text: string) => {
    const iconBounds = event.currentTarget.getBoundingClientRect();
    setHoverPopover({
      text,
      left: iconBounds.right + 8,
      top: iconBounds.top + iconBounds.height / 2,
    });
  };

  const hidePopover = () => {
    setHoverPopover(null);
  };

  const content = (
    <>
      {!embedded && (
        <div className="card-header">
          <h4>{t('rules.title')}</h4>
        </div>
      )}
      <div className={embedded ? 'rules-panel-body rules-panel-body-embedded' : 'card-body rules-panel-body'}>
        <div className="rules-preset-block">
          <label className="rules-preset-select-label" htmlFor="ruleset-select-in-panel">
            {t('diagnostics.activeRulesetLabel')}
          </label>
          <select
            id="ruleset-select-in-panel"
            className="wm-input rules-preset-select"
            value={selectedRulesetId}
            onChange={handleRulesetSelectChange}
            disabled={disabled || rulesLocked}
          >
            {RULESETS.filter((ruleset) => ruleset.implemented).map((ruleset) => (
              <option key={ruleset.id} value={ruleset.id}>{ruleset.name}</option>
            ))}
            {selectedRulesetId === 'custom' ? (
              <option value="custom">{t('diagnostics.rulesetCustomOption')}</option>
            ) : null}
          </select>
        </div>

        <details className="rules-subsection rules-subsection-collapsible" open>
          <summary className="rules-subsection-summary">
            <h5 className="rules-subsection-heading">{t('rules.standardSection')} ({activeRulesetClassification})</h5>
          </summary>
          <div className="rules-subsection-content">
            {lifeLikeProfile ? (
              <div className="wm-toggle-list">
                <div className="rules-toggle-item">
                  <span className="rules-checkbox-main">
                    <span className="rules-checkbox-label">Birth</span>
                    <code className="rules-rule-notation">B{lifeLikeProfile.birth.join('')}</code>
                  </span>
                </div>
                <div className="rules-toggle-item">
                  <span className="rules-checkbox-main">
                    <span className="rules-checkbox-label">Survival</span>
                    <code className="rules-rule-notation">S{lifeLikeProfile.survival.join('')}</code>
                  </span>
                </div>
              </div>
            ) : (
              <div className="wm-toggle-list">
                {standardRuleEntries.map(([key, rule]) => (
                <div key={rule.id} className="rules-toggle-item">
                  <span className="rules-checkbox-main">
                    <label className="rules-checkbox-row">
                      <input
                        type="checkbox"
                        className="rules-checkbox-input"
                        checked={rule.enabled}
                        onChange={() => handleToggle(key)}
                        disabled={disabled || rulesLocked}
                      />
                      <span className="rules-checkbox-label">{getRuleDisplayName(rule.name, false)}</span>
                      {getRuleNotation(key) ? (
                        <code className="rules-rule-notation">{getRuleNotation(key)}</code>
                      ) : null}
                      {key === 'birth3' && rules.birth6.enabled ? (
                        <span className="rules-rule-tag">{t('rules.highlifeTag')}</span>
                      ) : null}
                    </label>
                    <span className="rules-popover-wrap">
                      <span
                        className="rules-popover-trigger"
                        aria-label={getRuleDescription(key)}
                        role="img"
                        onMouseEnter={(event) => showPopover(event, getRuleDescription(key))}
                        onMouseLeave={hidePopover}
                      >
                        <span className="rules-popover-trigger-icon" aria-hidden="true">i</span>
                      </span>
                    </span>
                  </span>
                </div>
                ))}
              </div>
            )}
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
                  <div key={rule.id} className="rules-toggle-item">
                    <span className="rules-checkbox-main">
                      <label className="rules-checkbox-row">
                        <input
                          type="checkbox"
                          className="rules-checkbox-input"
                          checked={rule.enabled}
                          onChange={() => handleToggle(key)}
                          disabled={disabled || rulesLocked}
                        />
                        <span className="rules-checkbox-label">{getRuleDisplayName(rule.name, true)}</span>
                      </label>
                      <span className="rules-popover-wrap">
                        <span
                          className="rules-popover-trigger"
                          aria-label={rule.description}
                          role="img"
                          onMouseEnter={(event) => showPopover(event, rule.description)}
                          onMouseLeave={hidePopover}
                        >
                          <span className="rules-popover-trigger-icon" aria-hidden="true">i</span>
                        </span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}
      </div>
      {hoverPopover ? createPortal(
        <span
          className="rules-popover-floating"
          role="tooltip"
          style={{ left: `${hoverPopover.left}px`, top: `${hoverPopover.top}px` }}
        >
          {hoverPopover.text}
        </span>,
        document.body,
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return <div className="card rules-panel-card">{content}</div>;
}

export default RulesPanel;
