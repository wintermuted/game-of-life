import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RULESETS } from '@game-of-life/core';
import { getDescriptiveTags } from '../../util/patternMetadata';
import {
  CUSTOM_RULESET_ID,
  SYSTEM_AUTHOR_KEY,
  UNKNOWN_USER_AUTHOR_KEY,
  type ExplorePattern,
  type QueryOptions,
} from './exploreTypes';
import { getPatternAuthorKey, getPatternRulesetId } from './exploreCatalog';
export interface ExploreLabels extends QueryOptions {
  getAuthorLabel: (key: string) => string;
  getRulesetLabel: (id: string) => string;
  getPatternTags: (pattern: ExplorePattern) => string[];
}
export function useExploreLabels(allPatterns: ExplorePattern[]): ExploreLabels {
  const { t } = useTranslation();
  const getAuthorLabel = useCallback(
    (authorKey: string): string => {
      if (authorKey === SYSTEM_AUTHOR_KEY) {
        return t('patternSource.system');
      }

      if (authorKey === UNKNOWN_USER_AUTHOR_KEY) {
        return t('patternSource.user');
      }

      return authorKey;
    },
    [t],
  );

  const getRulesetLabel = useCallback(
    (rulesetId: string): string => {
      if (rulesetId === CUSTOM_RULESET_ID) return t('explore.rulesetCustom');
      if (rulesetId === 'standard') return t('diagnostics.rulesetStandardOption');
      if (rulesetId === 'highlife') return t('diagnostics.rulesetHighlifeOption');
      const ruleset = RULESETS.find((candidate) => candidate.id === rulesetId);
      return ruleset ? `${ruleset.name} (${ruleset.classification})` : rulesetId;
    },
    [t],
  );

  const getPatternTags = useCallback(
    (pattern: ExplorePattern): string[] => {
      const sourceLabel =
        pattern.source === 'system' ? t('patternSource.system') : t('patternSource.user');
      const visibilityLabel =
        pattern.visibility === 'private'
          ? t('playground.visibilityPrivate')
          : t('playground.visibilityPublic');
      const rulesetId = getPatternRulesetId(pattern);
      return getDescriptiveTags(pattern.tags ?? [], [
        pattern.category,
        sourceLabel,
        visibilityLabel,
        pattern.creatorName ?? '',
        rulesetId,
        getRulesetLabel(rulesetId),
      ]).slice(0, 3);
    },
    [getRulesetLabel, t],
  );

  const categoryOptions = useMemo(() => {
    return ['all', ...Array.from(new Set(allPatterns.map((pattern) => pattern.category)))];
  }, [allPatterns]);

  const authorOptions = useMemo(() => {
    const uniqueAuthorKeys = new Set<string>();
    for (const pattern of allPatterns) {
      uniqueAuthorKeys.add(getPatternAuthorKey(pattern));
    }

    return ['all', ...Array.from(uniqueAuthorKeys)];
  }, [allPatterns]);

  const rulesetOptions = useMemo(
    () => [
      ...RULESETS.filter((ruleset) => ruleset.implemented).map((ruleset) => ruleset.id),
      CUSTOM_RULESET_ID,
    ],
    [],
  );

  const tagOptions = useMemo(
    () => [
      'all',
      ...Array.from(new Set(allPatterns.flatMap((pattern) => getPatternTags(pattern)))),
    ],
    [allPatterns, getPatternTags],
  );

  return useMemo(
    () => ({
      getAuthorLabel,
      getRulesetLabel,
      getPatternTags,
      categoryOptions,
      authorOptions,
      rulesetOptions,
      tagOptions,
    }),
    [
      getAuthorLabel,
      getRulesetLabel,
      getPatternTags,
      categoryOptions,
      authorOptions,
      rulesetOptions,
      tagOptions,
    ],
  );
}
