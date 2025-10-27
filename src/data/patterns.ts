import { LifeGrid } from '../interfaces';
import { blinker, beacon } from './oscillators';
import { block, beehive, tub } from './stillLifes';
import { glider } from './spaceships';
import { rPentomino } from './methuselahs';

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
  // Spaceships
  {
    name: 'Glider',
    category: 'Spaceship',
    grid: glider
  },
  // Methuselahs
  {
    name: 'R-Pentomino',
    category: 'Methuselah',
    grid: rPentomino
  }
];
