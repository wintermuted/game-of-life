import { calculateNextGeneration, DEFAULT_RULES } from './game';
import { GameRules } from '../interfaces';

describe('calculateNextGeneration with custom rules', () => {
  test('disabling survival2 rule causes cells with 2 neighbors to die', () => {
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      survival2: { ...DEFAULT_RULES.survival2, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With survival2 disabled, cells with only 2 neighbors should die
    // Only the cell at 1,1 should be created (has 3 neighbors)
    expect(next["1,1"]).toBe(true);
    expect(Object.keys(next).length).toBe(1);
  });

  test('disabling survival3 rule causes cells with 3 neighbors to die', () => {
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    };

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
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };

    const customRules: GameRules = {
      ...DEFAULT_RULES,
      birth3: { ...DEFAULT_RULES.birth3, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With birth3 disabled, no new cells should be born
    // All cells have 2 neighbors, so they survive
    expect(next["0,0"]).toBe(true);
    expect(next["0,1"]).toBe(true);
    expect(next["1,0"]).toBe(true);
    expect(next["1,1"]).toBeUndefined(); // This cell should not be born
    expect(Object.keys(next).length).toBe(3);
  });

  test('disabling all rules results in empty grid', () => {
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };

    const customRules: GameRules = {
      survival2: { ...DEFAULT_RULES.survival2, enabled: false },
      survival3: { ...DEFAULT_RULES.survival3, enabled: false },
      birth3: { ...DEFAULT_RULES.birth3, enabled: false },
      death: { ...DEFAULT_RULES.death, enabled: false }
    };

    const next = calculateNextGeneration(grid, customRules);

    // With all rules disabled, no cells survive or are born
    expect(Object.keys(next).length).toBe(0);
  });

  test('default rules work as expected', () => {
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };

    const next = calculateNextGeneration(grid, DEFAULT_RULES);

    // This should work like standard Conway's Game of Life
    expect(next["0,0"]).toBe(true);
    expect(next["0,1"]).toBe(true);
    expect(next["1,0"]).toBe(true);
    expect(next["1,1"]).toBe(true);
  });
});
