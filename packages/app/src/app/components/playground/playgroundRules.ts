import { GameRule, GameRuleKey, GameRules, DEFAULT_RULES, RULESETS } from '@game-of-life/core';
import { RulesetSelectionId } from './playgroundTypes';
export function cloneGameRules(rules: GameRules): GameRules {
  const defaults = Object.entries(DEFAULT_RULES) as Array<[GameRuleKey, GameRule]>;
  const nextRules = Object.fromEntries(
    defaults.map(([ruleKey, defaultRule]) => {
      const sourceRule = rules[ruleKey] ?? defaultRule;
      return [ruleKey, { ...defaultRule, ...sourceRule, id: defaultRule.id }];
    }),
  ) as unknown as GameRules;

  if (rules.lifeLikeProfile) {
    nextRules.lifeLikeProfile = {
      birth: [...rules.lifeLikeProfile.birth],
      survival: [...rules.lifeLikeProfile.survival],
    };
  }

  return nextRules;
}

export function areRuleConfigurationsEquivalent(left: GameRules, right: GameRules): boolean {
  const defaults = Object.entries(DEFAULT_RULES) as Array<[GameRuleKey, GameRule]>;

  const togglesMatch = defaults.every(([ruleKey]) => {
    const leftRule = left[ruleKey];
    const rightRule = right[ruleKey];
    return Boolean(leftRule?.enabled) === Boolean(rightRule?.enabled);
  });

  const profilesMatch =
    JSON.stringify(left.lifeLikeProfile ?? null) === JSON.stringify(right.lifeLikeProfile ?? null);
  return togglesMatch && profilesMatch;
}

export function detectRulesetSelection(rules: GameRules): RulesetSelectionId {
  for (const ruleset of RULESETS) {
    if (!ruleset.implemented) {
      continue;
    }

    if (areRuleConfigurationsEquivalent(rules, ruleset.rules)) {
      return ruleset.id as RulesetSelectionId;
    }
  }

  return 'custom';
}

export function getImplementedRulesetById(
  rulesetId: string,
): (typeof RULESETS)[number] | undefined {
  return RULESETS.find((ruleset) => ruleset.id === rulesetId && ruleset.implemented);
}
