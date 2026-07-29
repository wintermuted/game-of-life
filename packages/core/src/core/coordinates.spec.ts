import { getDeadNeighborCoordinates, getLiveNeighborCount, getNeighborCoordinates } from "./coordinates";
import { createLifeGrid } from './cells';
describe('getNeighborCoordinates', () => {
  test('calculate neighbors from 0,0', () => {
    const next = getNeighborCoordinates('0,0');
  
    expect(next).toStrictEqual([
      '0,1',
      '0,-1',
      '1,0',
      '-1,0',
      '-1,-1',
      '-1,1',
      '1,-1',
      '1,1'
    ])
  });
  
  test('calculate neighbors from 1,1', () => {
    const next = getNeighborCoordinates('1,1');
  
    expect(next).toStrictEqual([
      '1,2',
      '1,0',
      '2,1',
      '0,1',
      '0,0',
      '0,2',
      '2,0',
      '2,2',
    ])
  });
  
  test('calculate neighbors from 356,-200', () => {
    const next = getNeighborCoordinates('356,-200');
  
    expect(next).toStrictEqual([
      '356,-199',
      '356,-201',
      '357,-200',
      '355,-200',
      '355,-201',
      '355,-199',
      '357,-201',
      '357,-199',
    ])
  });
});

describe('getLiveNeighborCount', () => {

  test('calculate live neighbors from 0,0', () => {
    const grid = createLifeGrid({
      "1,1": true,
      "-1,-1": true,
      "-1,0": true,
      "0,1": true,
      "0,-1": true,
      "-1,1": true,
      "1,-1": true,
      "1,0": true
    });
    const next = getLiveNeighborCount('0,0', grid);
  
    expect(next).toStrictEqual(8)
  });
  
  test('calculate live neighbors from 0,0', () => {
    const grid = createLifeGrid({
      "0,1": true
    });
    const next = getLiveNeighborCount('0,0', grid);
  
    expect(next).toStrictEqual(1)
  });
  
  test('calculate live neighbors from 2,2', () => {
    const grid = createLifeGrid({
      "0,1": true
    });
    const next = getLiveNeighborCount('2,2', grid);
  
    expect(next).toStrictEqual(0)
  });
})

describe('getDeadNeighborCoordinates', () => {
  test('calculate dead neighbors from 0,0 with no neighbors', () => {
    const grid = createLifeGrid({
      "0,0": true
    });

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,1',   '0,-1',
      '1,0',   '-1,0',
      '-1,-1', '-1,1',
      '1,-1',  '1,1'
    ])
  })

  test('calculate dead neighbors from 0,0 with two neighbors', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true
    });

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,-1',
      '-1,0',
      '-1,-1', 
      '-1,1',
      '1,-1',  
      '1,1'
    ])
  })

  test('calculate dead neighbors from 0,0 with three neighbors', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    });

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,-1',
      '-1,0',
      '-1,-1', 
      '-1,1',
      '1,-1',
    ])
  })

  test('calculate dead neighbors from 0,0 with five neighbors', () => {
    const grid = createLifeGrid({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true
    });

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,-1',
      '-1,-1', 
      '-1,1',
      '1,-1',
    ])
  })

  test('calculate dead neighbors from 0,0 with eight neighbors', () => {
    const grid = createLifeGrid({
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "-1,-1": true,
      "0,-1": true,
      "-1,1": true,
      "1,-1": true
    });

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([])
  })
})