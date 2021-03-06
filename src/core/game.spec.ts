import gameOfLife from "./game";

describe('any live cell with fewer than two live neighbors dies, as if by underpopulation', () => {
  test('zero neighbors', () => {
    const base = {
      "0,0": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({})
  });

  test('one neighbor', () => {
    const base = {
      "0,0": true,
      "0,1": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({})
  });
})

describe('Any live cell with two or three live neighbours lives on to the next generation.', () => {
  test('two neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };
  
    const next = gameOfLife(base);

    expect(next["0,0"]).toBeDefined();
  
    expect(next).toStrictEqual({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    })
  });

  test('three neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true
    })
  });
});

describe('Any live cell with more than three live neighbours dies, as if by overpopulation.', () => {
  test('four neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "-1,0": true,
      "-1,1": true,
      "0,-1": true,
      "1,0": true,
      "1,1": true,
    })
  });

  test('five neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "0,-1": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "-1,-1": true,
      "-1,0": true,
      "-1,1": true,
      "0,-1": true,
      "1,-1": true,
      "1,1": true,
    })
  });

  test('six neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "0,-1": true,
      "-1,-1": true
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "-1,-1": true,
      "1,1": true,
      "-1,1": true,
      "1,-1": true,
    })
  });

  test('seven neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "0,-1": true,
      "-1,-1": true,
      "-1,1": true,
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "-1,-1": true,
        "-1,1": true,
       "-2,0": true,
       "0,2": true,
       "1,-1": true,
        "1,1": true,
    })
  });

  test('eight neighbors', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
      "-1,0": true,
      "0,-1": true,
      "-1,-1": true,
      "-1,1": true,
      "1,-1": true,
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "-1,-1": true,
      "-1,1": true,
     "-2,0": true,
      "0,-2": true,
     "0,2": true,
      "1,-1": true,
      "1,1": true,
     "2,0": true,
    })
  });
})

describe('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.', () => {
  test('three neighbors', () => {
    const base = {
      "0,1": true,
      "1,0": true,
      "1,1": true,
    };
  
    const next = gameOfLife(base);
  
    expect(next).toStrictEqual({
      "0,0": true,
      "0,1": true,
      "1,0": true,
      "1,1": true,
    })

    expect(next["0,0"]).toBeDefined();
  });
})