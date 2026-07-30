import { vi } from 'vitest';
import { createLifeGrid } from './cells';
import {
  calculateNextGeneration,
  DAY_AND_NIGHT_RULESET,
  DEFAULT_RULES,
  HIGHLIFE_RULESET,
  HIGHLIFE_RULESET_STUB,
  LIFE_WITHOUT_DEATH_RULESET,
  STANDARD_RULESET,
} from './game';
import { GameRules } from '../interfaces';
import { highLifeReplicator } from '../data/replicators';
import { lifeWithoutDeathSeed } from '../data/alternativeRules';

describe('ruleset definitions', () => {
  test('classifies Conway standard rules as B3/S23', () => {
    expect(STANDARD_RULESET.id).toBe('standard');
    expect(STANDARD_RULESET.classification).toBe('B3/S23');
    expect(STANDARD_RULESET.implemented).toBe(true);
  });

  test('includes a HighLife ruleset stub classified as B36/S23', () => {
    expect(HIGHLIFE_RULESET_STUB.id).toBe('highlife');
    expect(HIGHLIFE_RULESET_STUB.classification).toBe('B36/S23');
    expect(HIGHLIFE_RULESET_STUB.implemented).toBe(true);
    expect(HIGHLIFE_RULESET_STUB.rules.birth6.enabled).toBe(true);
  });

  test('replicates the HighLife replicator into two copies after 12 generations', () => {
    let grid = highLifeReplicator;

    for (let generation = 0; generation < 12; generation += 1) {
      grid = calculateNextGeneration(grid, HIGHLIFE_RULESET.rules);
    }

    expect(Object.keys(highLifeReplicator)).toHaveLength(12);
    expect(Object.keys(grid)).toHaveLength(24);
  });

  test('implements Day & Night as B3678/S34678', () => {
    expect(DAY_AND_NIGHT_RULESET.classification).toBe('B3678/S34678');
    expect(DAY_AND_NIGHT_RULESET.rules.lifeLikeProfile).toStrictEqual({
      birth: [3, 6, 7, 8],
      survival: [3, 4, 6, 7, 8],
    });

    const sevenNeighborBirth = createLifeGrid({
      '-1,-1': true,
      '0,-1': true,
      '1,-1': true,
      '-1,0': true,
      '1,0': true,
      '-1,1': true,
      '0,1': true,
    });
    const next = calculateNextGeneration(sevenNeighborBirth, DAY_AND_NIGHT_RULESET.rules);

    expect(next['0,0']).toBe('#22c55e');
  });

  test('applies Day & Night survival counts', () => {
    const fourNeighborSurvivor = createLifeGrid({
      '0,0': true,
      '-1,0': true,
      '1,0': true,
      '0,-1': true,
      '0,1': true,
    });
    const next = calculateNextGeneration(fourNeighborSurvivor, DAY_AND_NIGHT_RULESET.rules);

    expect(next['0,0']).toBe('#22c55e');
  });

  test('implements Life without Death as B3/S012345678', () => {
    expect(LIFE_WITHOUT_DEATH_RULESET.classification).toBe('B3/S012345678');

    const isolatedCell = createLifeGrid({ '0,0': true });
    const isolatedNext = calculateNextGeneration(isolatedCell, LIFE_WITHOUT_DEATH_RULESET.rules);
    expect(isolatedNext['0,0']).toBe('#22c55e');

    const surroundedCell = createLifeGrid({
      '0,0': true,
      '-1,-1': true,
      '0,-1': true,
      '1,-1': true,
      '-1,0': true,
      '1,0': true,
      '-1,1': true,
      '0,1': true,
      '1,1': true,
    });
    const surroundedNext = calculateNextGeneration(surroundedCell, LIFE_WITHOUT_DEATH_RULESET.rules);
    expect(surroundedNext['0,0']).toBe('#22c55e');
  });

  test('continues growing the Life without Death ladder preset', () => {
    let grid = lifeWithoutDeathSeed;
    const initialCellCount = Object.keys(grid).length;

    for (let generation = 0; generation < 12; generation += 1) {
      grid = calculateNextGeneration(grid, LIFE_WITHOUT_DEATH_RULESET.rules);
    }

    expect(Object.keys(grid).length).toBeGreaterThan(initialCellCount);
  });
});

describe('calculateNextGeneration with custom rules', () => {
  test('disabling survival2 rule causes cells with 2 neighbors to die', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      survival2: { ...DEFAULT_RULES.survival2, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With survival2 disabled, cells with only 2 neighbors should die
    // Only the cell at 1,1 should be created (has 3 neighbors)
    expect(next["1,1"]).toBe('#22c55e');
    expect(Object.keys(next).length).toBe(1);
  });

  test('disabling survival3 rule causes cells with 3 neighbors to die', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      survival3: { ...DEFAULT_RULES.survival3, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // In this grid, all cells have 3 neighbors
    // With survival3 disabled, cells with 3 neighbors die (only 2 neighbor cells survive)
    // So all current cells die, but no cells have exactly 2 neighbors
    // All cells die
    expect(Object.keys(next).length).toBe(0);
  });

  test('disabling birth3 rule prevents new cells from being born', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      birth3: { ...DEFAULT_RULES.birth3, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With birth3 disabled, no new cells should be born
    // All cells have 2 neighbors, so they survive
    expect(next["0,0"]).toBe('#22c55e');
    expect(next["0,1"]).toBe('#22c55e');
    expect(next["1,0"]).toBe('#22c55e');
    expect(next["1,1"]).toBeUndefined(); // This cell should not be born
    expect(Object.keys(next).length).toBe(3);
  });

  test('disabling all rules results in empty grid', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true
    });

    const customRules: GameRules = {
      survival2: { ...DEFAULT_RULES.survival2, enabled: false },
      survival3: { ...DEFAULT_RULES.survival3, enabled: false },
      birth3: { ...DEFAULT_RULES.birth3, enabled: false },
      birth6: { ...DEFAULT_RULES.birth6, enabled: false },
      experimentalSpeciesCompetitionBirth: { ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth, enabled: false },
      experimentalSpeciesCompetitionDominantBirth: { ...DEFAULT_RULES.experimentalSpeciesCompetitionDominantBirth, enabled: false },
      experimentalSpeciesCompetitionTieBreakBirth: { ...DEFAULT_RULES.experimentalSpeciesCompetitionTieBreakBirth, enabled: false },
      death: { ...DEFAULT_RULES.death, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With all rules disabled, no cells survive or are born
    expect(Object.keys(next).length).toBe(0);
  });

  test('default rules work as expected', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true
    });

    const next = calculateNextGeneration(grid, DEFAULT_RULES);

    // This should work like standard Conway's Game of Life
    expect(next["0,0"]).toBe('#22c55e');
    expect(next["0,1"]).toBe('#22c55e');
    expect(next["1,0"]).toBe('#22c55e');
    expect(next["1,1"]).toBe('#22c55e');
  });

  test('experimental species competition birth blocks evenly split mixed-species births', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#3b82f6',
      '1,1': '#f97316',
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      experimentalSpeciesCompetitionBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth,
        enabled: true,
      },
    };

    const next = calculateNextGeneration(grid, customRules);

    expect(next['0,0']).toBeUndefined();
  });

  test('experimental species competition birth allows a dominant species to win reproduction', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#22c55e',
      '1,1': '#3b82f6',
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      experimentalSpeciesCompetitionBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth,
        enabled: true,
      },
      experimentalSpeciesCompetitionDominantBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionDominantBirth,
        enabled: true,
      },
    };

    const next = calculateNextGeneration(grid, customRules);

    expect(next['0,0']).toBe('#22c55e');
  });

  test('experimental species competition tie-break birth randomly selects among tied colors', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#3b82f6',
      '1,1': '#f97316',
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      experimentalSpeciesCompetitionBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth,
        enabled: true,
      },
      experimentalSpeciesCompetitionDominantBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionDominantBirth,
        enabled: true,
      },
      experimentalSpeciesCompetitionTieBreakBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionTieBreakBirth,
        enabled: true,
      },
    };

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.51);
    const next = calculateNextGeneration(grid, customRules);
    randomSpy.mockRestore();

    expect(['#22c55e', '#3b82f6', '#f97316']).toContain(next['0,0']);
    expect(next['0,0']).toBe('#3b82f6');
  });

  test('dominant birth rule blocks mixed-species births when disabled', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#22c55e',
      '1,1': '#3b82f6',
    });

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      experimentalSpeciesCompetitionBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionBirth,
        enabled: true,
      },
      experimentalSpeciesCompetitionDominantBirth: {
        ...DEFAULT_RULES.experimentalSpeciesCompetitionDominantBirth,
        enabled: false,
      },
    };

    const next = calculateNextGeneration(grid, customRules);
    expect(next['0,0']).toBeUndefined();
  });

  test('HighLife B6 births occur when six neighbors surround a dead cell', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#22c55e',
      '1,1': '#22c55e',
      '0,-1': '#22c55e',
      '-1,0': '#22c55e',
      '-1,-1': '#22c55e',
    });

    const next = calculateNextGeneration(grid, HIGHLIFE_RULESET.rules);
    expect(next['0,0']).toBe('#22c55e');
  });

  test('B6 births do not occur under the standard B3/S23 ruleset', () => {
    const grid = createLifeGrid({
      '0,1': '#22c55e',
      '1,0': '#22c55e',
      '1,1': '#22c55e',
      '0,-1': '#22c55e',
      '-1,0': '#22c55e',
      '-1,-1': '#22c55e',
    });

    const next = calculateNextGeneration(grid, STANDARD_RULESET.rules);
    expect(next['0,0']).toBeUndefined();
  });
});
