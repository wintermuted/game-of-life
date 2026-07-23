import { createLifeGrid } from '../core/cells';

export const rPentomino = createLifeGrid({ 
  "1,0": true,
  "0,1": true,
  "1,1": true,
  "1,2": true,
  "2,2": true,
});

export const diehard = createLifeGrid({
  "6,0": true,
  "0,1": true,
  "1,1": true,
  "1,2": true,
  "5,2": true,
  "6,2": true,
  "7,2": true
});

export const acorn = createLifeGrid({
  "1,0": true,
  "3,1": true,
  "0,2": true,
  "1,2": true,
  "4,2": true,
  "5,2": true,
  "6,2": true
});