import { createLifeGrid } from '../core/cells';

export const block = createLifeGrid({
  "0,0": true,
  "0,1": true,
  "1,0": true,
  "1,1": true
});

export const beehive = createLifeGrid({
  "0,1": true,
  "1,0": true,
  "1,2": true,
  "2,0": true,
  "2,2": true,
  "3,1": true
});

export const tub = createLifeGrid({
  "0,1": true,
  "1,0": true,
  "1,2": true,
  "2,1": true
});

export const boat = createLifeGrid({
  "0,0": true,
  "0,1": true,
  "1,0": true,
  "1,2": true,
  "2,1": true
});

export const loaf = createLifeGrid({
  "1,0": true,
  "2,0": true,
  "0,1": true,
  "3,1": true,
  "1,2": true,
  "3,2": true,
  "2,3": true
});

export const pond = createLifeGrid({
  "1,0": true,
  "2,0": true,
  "0,1": true,
  "3,1": true,
  "0,2": true,
  "3,2": true,
  "1,3": true,
  "2,3": true
});