import { createLifeGrid, type LifeGrid } from '@game-of-life/core';

export interface SocialCatalogPattern {
  name: string;
  category: string;
  source: 'user';
  creatorName: string;
  favoriteCount: number;
  forkCount: number;
  grid: LifeGrid;
}

export const seededUserPatterns: SocialCatalogPattern[] = [
  {
    name: 'Signal Weave',
    category: 'User Creations',
    source: 'user',
    creatorName: 'James Nyeholt',
    favoriteCount: 21,
    forkCount: 8,
    grid: createLifeGrid({
      '-2,0': true,
      '-1,0': true,
      '0,0': true,
      '1,1': true,
      '2,2': true,
      '2,-2': true,
      '3,1': true,
      '3,-1': true,
      '4,0': true,
      '5,0': true,
    }),
  },
  {
    name: 'Twin Lantern',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Anika Shah',
    favoriteCount: 16,
    forkCount: 5,
    grid: createLifeGrid({
      '-3,-1': true,
      '-3,0': true,
      '-2,-2': true,
      '-2,1': true,
      '-1,-2': true,
      '-1,1': true,
      '1,-1': true,
      '1,0': true,
      '2,-2': true,
      '2,1': true,
      '3,-2': true,
      '3,1': true,
    }),
  },
  {
    name: 'Orbit Stack',
    category: 'User Creations',
    source: 'user',
    creatorName: 'Leo Martinez',
    favoriteCount: 14,
    forkCount: 4,
    grid: createLifeGrid({
      '-2,-2': true,
      '-2,-1': true,
      '-1,-2': true,
      '-1,-1': true,
      '0,1': true,
      '1,2': true,
      '2,0': true,
      '2,1': true,
      '3,1': true,
      '4,2': true,
      '4,3': true,
      '5,2': true,
    }),
  },
];
