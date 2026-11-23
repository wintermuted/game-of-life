import i18next from 'i18next';
import { DEFAULT_RULES, RULESETS, createLifeGrid, patterns } from '@game-of-life/core';
import { setSavedBoards, type ForkOriginRecord } from '@game-of-life/api';
import {
  buildExploreCatalog,
  buildForkedPatterns,
  detectPersistedRuleset,
  getPatternHash,
  getPatternPlayUrl,
} from './exploreCatalog';
import { seededUserPatterns } from '../../data/socialPatternCatalog';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('Explore catalog metadata and identities', () => {
  test('enriches shared seeds while retaining system ruleset precedence and source visibility', () => {
    const system = patterns[0];
    const highlife = RULESETS.find((ruleset) => ruleset.id === 'highlife');
    if (!highlife) throw new Error('Missing Highlife ruleset');
    setSavedBoards([
      {
        hash: getPatternHash(system.grid),
        title: 'saved title',
        rules: highlife.rules,
        tags: ['persisted'],
        visibility: 'private',
        updatedAt: 1,
      },
      {
        hash: getPatternHash(seededUserPatterns[0].grid),
        title: 'saved title',
        tags: ['user tag'],
        visibility: 'private',
        rules: highlife.rules,
        updatedAt: 2,
      },
    ]);
    const catalog = buildExploreCatalog();
    const enrichedSystem = catalog.find((pattern) => pattern.name === system.name);
    const enrichedSeed = catalog.find((pattern) => pattern.name === 'Signal Weave');
    expect(enrichedSystem?.rulesetId).toBe(system.rulesetId ?? 'highlife');
    expect(enrichedSystem?.visibility).toBe('public');
    expect(enrichedSystem?.tags).toStrictEqual(['persisted']);
    expect(enrichedSeed?.rulesetId).toBe('highlife');
    expect(enrichedSeed?.visibility).toBe('private');
    expect(enrichedSeed?.tags).toStrictEqual(['user tag']);
    expect(
      catalog.filter((pattern) => pattern.source === 'user').map((pattern) => pattern.name),
    ).toStrictEqual(['Signal Weave', 'Twin Lantern', 'Orbit Stack']);
  });

  test('resolves saved forks by board ID rather than content hash and preserves private visibility and changed grids', () => {
    const catalog = buildExploreCatalog();
    const parent = catalog[0];
    const changedGrid = createLifeGrid({ '-7,2': true });
    const changedHash = getPatternHash(changedGrid);
    const parentHash = getPatternHash(parent.grid);
    setSavedBoards([
      {
        hash: changedHash,
        boardId: 'independent-board',
        title: 'Private fork',
        category: 'Fork category',
        tags: ['fork tag'],
        visibility: 'private',
        updatedAt: 1,
      },
    ]);
    const origin: ForkOriginRecord = {
      hash: 'independent-board',
      parentHash,
      parentTitle: parent.name,
      parentSource: parent.source,
      forkerName: 'Other Author',
      createdAt: 1,
    };
    const forks = buildForkedPatterns(
      catalog,
      [origin, { ...origin, hash: 'missing-parent', parentHash: 'unknown' }],
      i18next.t,
    );
    expect(forks).toHaveLength(1);
    expect(forks[0].grid).toStrictEqual(changedGrid);
    expect(forks[0].name).toBe('Private fork');
    expect(forks[0].source).toBe('user');
    expect(forks[0].creatorName).toBe('Other Author');
    expect(forks[0].visibility).toBe('private');
    expect(forks[0].tags).toStrictEqual(['fork tag']);
    const params = new URLSearchParams(getPatternPlayUrl(forks[0]).split('?')[1]);
    expect(params.get('pattern')).toBe(changedHash);
    expect(params.get('board')).toBe('independent-board');
    expect(params.has('catalog')).toBe(false);
  });

  test('includes catalog identity only for system originals and omits unsupported custom play rulesets', () => {
    const parent = buildExploreCatalog()[0];
    const systemParams = new URLSearchParams(getPatternPlayUrl(parent).split('?')[1]);
    expect(systemParams.get('catalog')).toBe(parent.name);
    expect(systemParams.has('board')).toBe(false);
    const customParams = new URLSearchParams(
      getPatternPlayUrl({ ...parent, source: 'user', rulesetId: 'custom' }).split('?')[1],
    );
    expect(customParams.has('ruleset')).toBe(false);
    expect(customParams.has('catalog')).toBe(false);
  });

  test('detects persisted supported profiles and preserves custom toggle combinations', () => {
    expect(detectPersistedRuleset()).toBeUndefined();
    expect(detectPersistedRuleset(DEFAULT_RULES)).toBe('standard');
    for (const ruleset of RULESETS.filter((entry) => entry.implemented)) {
      expect(detectPersistedRuleset(ruleset.rules)).toBe(ruleset.id);
    }
    expect(
      detectPersistedRuleset({
        ...DEFAULT_RULES,
        survival2: { ...DEFAULT_RULES.survival2, enabled: false },
        birth6: { ...DEFAULT_RULES.birth6, enabled: true },
      }),
    ).toBe('custom');
  });
});
