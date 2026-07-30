import { LifeGrid } from '../interfaces';
import { blinker, beacon, toad, pulsar, pentadecathlon } from './oscillators';
import { block, beehive, tub, boat, loaf, pond } from './stillLifes';
import { glider, lwss } from './spaceships';
import { rPentomino, diehard, acorn } from './methuselahs';
import { gosperGliderGun, simkinGliderGun } from './guns';
import { highLifeReplicator } from './replicators';
import { dayAndNightSeed, lifeWithoutDeathSeed } from './alternativeRules';

export interface Pattern {
  name: string;
  category: string;
  grid: LifeGrid;
  rulesetId?: string;
  tags?: string[];
  description?: string;
  referenceUrl?: string;
}

export const patterns: Pattern[] = [
  // Still Lifes
  {
    name: 'Block',
    category: 'Still Life',
    grid: block
  },
  {
    name: 'Beehive',
    category: 'Still Life',
    grid: beehive
  },
  {
    name: 'Tub',
    category: 'Still Life',
    grid: tub
  },
  {
    name: 'Boat',
    category: 'Still Life',
    grid: boat
  },
  {
    name: 'Loaf',
    category: 'Still Life',
    grid: loaf
  },
  {
    name: 'Pond',
    category: 'Still Life',
    grid: pond
  },
  // Oscillators
  {
    name: 'Blinker',
    category: 'Oscillator',
    grid: blinker
  },
  {
    name: 'Beacon',
    category: 'Oscillator',
    grid: beacon
  },
  {
    name: 'Toad',
    category: 'Oscillator',
    grid: toad
  },
  {
    name: 'Pulsar',
    category: 'Oscillator',
    grid: pulsar
  },
  {
    name: 'Pentadecathlon',
    category: 'Oscillator',
    grid: pentadecathlon
  },
  // Spaceships
  {
    name: 'Glider',
    category: 'Spaceship',
    grid: glider
  },
  {
    name: 'LWSS',
    category: 'Spaceship',
    grid: lwss
  },
  // Guns
  {
    name: 'Gosper Glider Gun',
    category: 'Gun',
    grid: gosperGliderGun
  },
  {
    name: 'Simkin Glider Gun',
    category: 'Gun',
    grid: simkinGliderGun
  },
  // Methuselahs
  {
    name: 'R-Pentomino',
    category: 'Methuselah',
    grid: rPentomino
  },
  {
    name: 'Diehard',
    category: 'Methuselah',
    grid: diehard
  },
  {
    name: 'Acorn',
    category: 'Methuselah',
    grid: acorn
  },
  // Replicators
  {
    name: 'HighLife Replicator',
    category: 'Replicator',
    grid: highLifeReplicator,
    rulesetId: 'highlife',
    tags: ['period-12', 'diagonal']
  },
  {
    name: 'Day & Night Seed',
    category: 'Alternative Rules',
    grid: dayAndNightSeed,
    rulesetId: 'day-and-night',
    tags: ['self-complementary'],
    description: 'A compact seed for Day & Night, a self-complementary Life-like cellular automaton using B3678/S34678.',
    referenceUrl: 'https://en.wikipedia.org/wiki/Day_and_Night_(cellular_automaton)'
  },
  {
    name: 'Life without Death Ladder',
    category: 'Alternative Rules',
    grid: lifeWithoutDeathSeed,
    rulesetId: 'life-without-death',
    tags: ['growth'],
    description: 'A published 4c/9 ladder that grows continuously under Life without Death (B3/S012345678).',
    referenceUrl: 'https://en.wikipedia.org/wiki/Life_without_Death'
  }
];
