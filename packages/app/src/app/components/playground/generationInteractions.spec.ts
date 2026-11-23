import { DEFAULT_RULES, type GameRules, type LifeGrid } from '@game-of-life/core';
import { analyzeGenerationInteractions, mergeColorCountLedger } from './generationInteractions';

describe('generation interaction diagnostics', () => {
  test('overcrowding attributes a death to the dominant foreign neighbor color', () => {
    const previous: LifeGrid = {
      '0,0': '#ff0000',
      '-1,0': '#00ff00',
      '1,0': '#00ff00',
      '0,1': '#00ff00',
      '0,-1': '#0000ff',
    };
    const next = { ...previous };
    delete next['0,0'];
    expect(analyzeGenerationInteractions(previous, next, DEFAULT_RULES)).toStrictEqual({
      overcrowdingDeathsByPressureColor: { '#00ff00': 1 },
      experimentalBirthsByColor: {},
      tieBreakBirthsByColor: {},
    });
    expect(previous['0,0']).toBe('#ff0000');
  });
  test('mixed births count only when experimental competition is enabled', () => {
    const previous: LifeGrid = { '-1,0': '#ff0000', '1,0': '#00ff00', '0,1': '#0000ff' };
    const next = { ...previous, '0,0': '#00ff00' };
    const rules: GameRules = {
      ...DEFAULT_RULES,
      experimentalSpeciesCompetitionBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth,
        enabled: true,
      },
      experimentalSpeciesCompetitionTieBreakBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionTieBreakBirth,
        enabled: true,
      },
    };
    expect(
      analyzeGenerationInteractions(previous, next, DEFAULT_RULES).experimentalBirthsByColor,
    ).toStrictEqual({});
    expect(analyzeGenerationInteractions(previous, next, rules)).toStrictEqual({
      overcrowdingDeathsByPressureColor: {},
      experimentalBirthsByColor: { '#00ff00': 1 },
      tieBreakBirthsByColor: { '#00ff00': 1 },
    });
  });
  test('a diagnostic ledger accumulates counts without mutating earlier generations', () => {
    const previous = { '#ff0000': 2 };
    expect(mergeColorCountLedger(previous, {})).toBe(previous);
    expect(mergeColorCountLedger(previous, { '#ff0000': 1, '#00ff00': 4 })).toStrictEqual({
      '#ff0000': 3,
      '#00ff00': 4,
    });
    expect(previous).toStrictEqual({ '#ff0000': 2 });
  });
});
