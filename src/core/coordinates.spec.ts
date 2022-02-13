import { getDeadNeighborCoordinates, getLiveNeighborCount, getNeighborCoordinates } from "./coordinates";
describe('getNeighborCoordinates', () => {
  test('calculate neighbors from 0,0', () => {
    const next = getNeighborCoordinates('0,0');
  
    expect(next).toStrictEqual({
      "1,1": true,
      "-1,-1": true,
      "-1,0": true,
      "0,1": true,
      "0,-1": true,
      "-1,1": true,
      "1,-1": true,
      "1,0": true
    })
  });
  
  test('calculate neighbors from 1,1', () => {
    const next = getNeighborCoordinates('1,1');
  
    expect(next).toStrictEqual({
      "0,0": true,
      "0,1": true,
      "0,2": true,
      "1,0": true,
      "1,2": true,
      "2,0": true,
      "2,1": true,
      "2,2": true,
    })
  });
  
  test('calculate neighbors from 356,-200', () => {
    const next = getNeighborCoordinates('356,-200');
  
    expect(next).toStrictEqual({
      "355,-199": true,
      "355,-200": true,
      "355,-201": true,
      "356,-199": true,
      "356,-201": true,
      "357,-199": true,
      "357,-200": true,
      "357,-201": true,
    })
  });
});

describe('getLiveNeighborCount', () => {

  test('calculate live neighbors from 0,0', () => {
    const grid = {
      "1,1": true,
      "-1,-1": true,
      "-1,0": true,
      "0,1": true,
      "0,-1": true,
      "-1,1": true,
      "1,-1": true,
      "1,0": true
    }
    const next = getLiveNeighborCount('0,0', grid);
  
    expect(next).toStrictEqual(8)
  });
  
  test('calculate live neighbors from 0,0', () => {
    const grid = {
      "0,1": true
    }
    const next = getLiveNeighborCount('0,0', grid);
  
    expect(next).toStrictEqual(1)
  });
  
  test('calculate live neighbors from 2,2', () => {
    const grid = {
      "0,1": true
    }
    const next = getLiveNeighborCount('2,2', grid);
  
    expect(next).toStrictEqual(0)
  });
})

describe('getDeadNeighborCoordinates', () => {
  test('calculate dead neighbors from 0,0 with no neighbors', () => {
    const grid = {
      "0,0": true
    }

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,1',   '0,-1',
      '1,0',   '-1,0',
      '-1,-1', '-1,1',
      '1,-1',  '1,1'
    ])
  })

  test('calculate dead neighbors from 0,0 with two neighbors', () => {
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    }

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
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    }

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
    const grid = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true
    }

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([
      '0,-1',
      '-1,-1', 
      '-1,1',
      '1,-1',
    ])
  })

  test('calculate dead neighbors from 0,0 with eight neighbors', () => {
    const grid = {
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "-1,-1": true,
      "0,-1": true,
      "-1,1": true,
      "1,-1": true
    }

    const next = getDeadNeighborCoordinates('0,0', grid);
  
    expect(next).toStrictEqual([])
  })
})