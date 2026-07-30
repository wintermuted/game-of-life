import { createLifeGrid } from '../core/cells';

function createGridFromRows(rows: string[]) {
  const cells: Record<string, true> = {};
  const xOffset = Math.floor(rows[0].length / 2);
  const yOffset = Math.floor(rows.length / 2);

  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === '#') {
        cells[`${x - xOffset},${y - yOffset}`] = true;
      }
    });
  });

  return createLifeGrid(cells);
}

export const dayAndNightSeed = createLifeGrid({
  '-1,-1': true,
  '0,-1': true,
  '1,-1': true,
  '-1,0': true,
  '0,0': true,
  '1,0': true,
  '-1,1': true,
  '0,1': true,
  '1,1': true,
});

export const lifeWithoutDeathSeed = createGridFromRows([
  '#.#.#.#.#.#.#.#.#.#.#.....',
  '#######################...',
  '###.###.###.###.###.###...',
  '##########################',
  '##########################',
  '#.###.###.###.###.###.###.',
  '###.###.###.###.###.###.#.',
  '#########################.',
  '###.###.###.###.###.###.#.',
  '#.###.###.###.###.###.###.',
  '##########################',
  '##########################',
  '###.###.###.###.###.###...',
  '#######################...',
  '#.#.#.#.#.#.#.#.#.#.#.....',
]);
