import { createLifeGrid, gosperGliderGun, simkinGliderGun, LifeGrid, patterns } from '@game-of-life/core';

export interface LandingShowcasePattern {
  name: string;
  grid: LifeGrid;
  rulesetId: string;
  author: string;
}

const SYSTEM_AUTHOR = 'System';
const STANDARD_RULESET_ID = 'standard';

function offsetGrid(grid: LifeGrid, offsetX: number, offsetY: number): LifeGrid {
  const result: Record<string, boolean | string> = {};

  for (const [coordinate, value] of Object.entries(grid)) {
    const [xRaw, yRaw] = coordinate.split(',');
    const x = Number(xRaw);
    const y = Number(yRaw);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    result[`${x + offsetX},${y + offsetY}`] = value;
  }

  return createLifeGrid(result);
}

export const LANDING_SHOWCASE_GRID: LifeGrid = createLifeGrid({
  ...offsetGrid(gosperGliderGun, -38, -7),
  ...offsetGrid(simkinGliderGun, 15, -4),
});

const METHUSELAH_SHOWCASES: LandingShowcasePattern[] = patterns
  .filter((pattern) => pattern.category === 'Methuselah')
  .map(({ name, grid, rulesetId = STANDARD_RULESET_ID }) => ({
    name,
    grid,
    rulesetId,
    author: SYSTEM_AUTHOR,
  }));

const ALTERNATE_RULESET_SHOWCASES: LandingShowcasePattern[] = patterns
  .filter((pattern) => pattern.rulesetId && pattern.rulesetId !== STANDARD_RULESET_ID)
  .map(({ name, grid, rulesetId }) => ({
    name,
    grid,
    rulesetId: rulesetId ?? STANDARD_RULESET_ID,
    author: SYSTEM_AUTHOR,
  }));

export const LANDING_SHOWCASE_PATTERNS: LandingShowcasePattern[] = [
  {
    name: 'Glider Gun Crossfire',
    grid: LANDING_SHOWCASE_GRID,
    rulesetId: STANDARD_RULESET_ID,
    author: SYSTEM_AUTHOR,
  },
  {
    name: 'Gosper Glider Gun',
    grid: offsetGrid(gosperGliderGun, -18, -5),
    rulesetId: STANDARD_RULESET_ID,
    author: SYSTEM_AUTHOR,
  },
  {
    name: 'Simkin Glider Gun',
    grid: offsetGrid(simkinGliderGun, -16, -7),
    rulesetId: STANDARD_RULESET_ID,
    author: SYSTEM_AUTHOR,
  },
  ...METHUSELAH_SHOWCASES,
  ...ALTERNATE_RULESET_SHOWCASES,
];
