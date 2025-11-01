import { LifeGrid } from '../interfaces';
import { blinker, beacon, toad, pulsar, pentadecathlon } from './oscillators';
import { block, beehive, tub, boat, loaf, pond } from './stillLifes';
import { glider, lwss } from './spaceships';
import { rPentomino, diehard, acorn } from './methuselahs';

export interface Pattern {
  name: string;
  category: string;
  grid: LifeGrid;
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
  }
];
