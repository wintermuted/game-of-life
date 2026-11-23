import {
  DEFAULT_RULES,
  RULESETS,
  patterns,
  type GameRuleKey,
  type GameRules,
  type LifeGrid,
} from '@game-of-life/core';
import {
  getFavoriteBoards,
  getForkOrigins,
  getSavedBoards,
  getStoredProfileUser,
  hashToGrid,
  type ForkOriginRecord,
} from '@game-of-life/api';
import { encodeGridToBase64 } from '@game-of-life/util';
import type { TFunction } from 'i18next';
import { seededUserPatterns } from '../../data/socialPatternCatalog';
import {
  CUSTOM_RULESET_ID,
  SYSTEM_AUTHOR_KEY,
  UNKNOWN_USER_AUTHOR_KEY,
  type ExplorePattern,
} from './exploreTypes';
export function getCurrentProfileName(): string {
  const normalized = getStoredProfileUser().name?.trim();
  return normalized && normalized.length > 0 ? normalized : 'James Nyeholt';
}

export function getFavoriteHashesForActor(actorName: string): Set<string> {
  return new Set(
    getFavoriteBoards()
      .filter((entry) => (entry.actorName ?? '').trim() === actorName)
      .map((entry) => entry.hash),
  );
}

export function buildPatternMetrics(
  patternList: ExplorePattern[],
): Record<string, { favorites: number; forks: number }> {
  const favoriteCounts = getFavoriteBoards().reduce<Record<string, number>>((acc, entry) => {
    acc[entry.hash] = (acc[entry.hash] ?? 0) + 1;
    return acc;
  }, {});

  const forkCounts = getForkOrigins().reduce<Record<string, number>>((acc, entry) => {
    acc[entry.parentHash] = (acc[entry.parentHash] ?? 0) + 1;
    return acc;
  }, {});

  const metrics: Record<string, { favorites: number; forks: number }> = {};
  for (const pattern of patternList) {
    const hash = encodeGridToBase64(pattern.grid);
    metrics[hash] = {
      favorites: favoriteCounts[hash] ?? 0,
      forks: forkCounts[hash] ?? 0,
    };
  }

  return metrics;
}

export function detectPersistedRuleset(rules?: GameRules): string | undefined {
  if (!rules) return undefined;

  const matchingRuleset = RULESETS.find((ruleset) => {
    if (!ruleset.implemented) return false;

    const togglesMatch = (Object.keys(DEFAULT_RULES) as GameRuleKey[]).every((ruleKey) => {
      const persistedEnabled = rules[ruleKey]?.enabled ?? DEFAULT_RULES[ruleKey].enabled;
      return persistedEnabled === ruleset.rules[ruleKey].enabled;
    });
    const profilesMatch =
      JSON.stringify(rules.lifeLikeProfile ?? null) ===
      JSON.stringify(ruleset.rules.lifeLikeProfile ?? null);
    return togglesMatch && profilesMatch;
  });

  return matchingRuleset?.id ?? CUSTOM_RULESET_ID;
}

export function getPatternHash(patternGrid: LifeGrid): string {
  return encodeGridToBase64(patternGrid);
}

export function getPatternAuthorKey(pattern: ExplorePattern): string {
  if (pattern.source === 'system') {
    return SYSTEM_AUTHOR_KEY;
  }

  const authorName = pattern.creatorName?.trim();
  return authorName && authorName.length > 0 ? authorName : UNKNOWN_USER_AUTHOR_KEY;
}

export function getPatternRulesetId(pattern: ExplorePattern): string {
  if (pattern.rulesetId) return pattern.rulesetId;
  return pattern.source === 'system' ? 'standard' : CUSTOM_RULESET_ID;
}

export function buildExploreCatalog(): ExplorePattern[] {
  const savedMetadataByHash = new Map(getSavedBoards().map((record) => [record.hash, record]));
  const systemPatterns = patterns.map((pattern) => {
    const savedMetadata = savedMetadataByHash.get(encodeGridToBase64(pattern.grid));
    return {
      ...pattern,
      rulesetId: pattern.rulesetId ?? detectPersistedRuleset(savedMetadata?.rules),
      tags: savedMetadata?.tags?.length ? savedMetadata.tags : pattern.tags,
      source: 'system' as const,
      visibility: 'public' as const,
      favoriteCount: Math.max(4, Math.floor(Object.keys(pattern.grid).length / 2) + 6),
      forkCount: Math.max(2, Math.floor(Object.keys(pattern.grid).length / 3) + 3),
    };
  });

  const seeds: ExplorePattern[] = seededUserPatterns;
  const userPatterns = seeds.map((pattern) => {
    const savedMetadata = savedMetadataByHash.get(encodeGridToBase64(pattern.grid));
    return {
      ...pattern,
      rulesetId: detectPersistedRuleset(savedMetadata?.rules) ?? pattern.rulesetId,
      tags: savedMetadata?.tags?.length ? savedMetadata.tags : pattern.tags,
      visibility: savedMetadata?.visibility ?? 'public',
    };
  });

  return [...systemPatterns, ...userPatterns];
}
export function buildForkedPatterns(
  allPatterns: ExplorePattern[],
  forkOrigins: ForkOriginRecord[],
  t: TFunction,
): ExplorePattern[] {
  const parentPatternsByHash = new Map(
    allPatterns.map((pattern) => [encodeGridToBase64(pattern.grid), pattern]),
  );
  const savedBoardsById = new Map(
    getSavedBoards().map((record) => [record.boardId ?? record.hash, record]),
  );

  return forkOrigins.flatMap((forkOrigin) => {
    const parentPattern = parentPatternsByHash.get(forkOrigin.parentHash);
    if (!parentPattern) return [];

    const savedBoard = savedBoardsById.get(forkOrigin.hash);
    const savedGrid = savedBoard ? hashToGrid(savedBoard.hash) : null;
    return [
      {
        ...parentPattern,
        name:
          savedBoard?.title ||
          forkOrigin.forkedPatternTitle ||
          `${forkOrigin.parentTitle} (${t('explore.forkSuffix')})`,
        category: savedBoard?.category || parentPattern.category,
        source: 'user' as const,
        creatorName: forkOrigin.forkerName,
        visibility: savedBoard?.visibility ?? 'public',
        rulesetId: detectPersistedRuleset(savedBoard?.rules) ?? parentPattern.rulesetId,
        tags: savedBoard?.tags?.length ? savedBoard.tags : parentPattern.tags,
        favoriteCount: 0,
        forkCount: 0,
        boardId: forkOrigin.hash,
        grid: savedGrid ?? parentPattern.grid,
      },
    ];
  });
}
export function getPatternPlayUrl(pattern: ExplorePattern): string {
  const params = new URLSearchParams({ pattern: getPatternHash(pattern.grid) });
  if (pattern.boardId) {
    params.set('board', pattern.boardId);
  } else if (pattern.source === 'system') {
    params.set('catalog', pattern.name);
  }
  if (
    pattern.rulesetId &&
    RULESETS.some((ruleset) => ruleset.id === pattern.rulesetId && ruleset.implemented)
  ) {
    params.set('ruleset', pattern.rulesetId);
  }
  return `/play?${params.toString()}`;
}
