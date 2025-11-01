import Game from "./Game";

test('next', () => {
  const base = {
    "0,0": true,
    "0,1": true
  };

  const game = new Game(base);

  expect(game.getStatus()).toStrictEqual({
    "0,0": true,
    "0,1": true
  })

  game.next();

  expect(game.getStatus()).toStrictEqual({})

  game.next();

  expect(game.getStatus()).toStrictEqual({})
});

test('add', () => {
  const game = new Game({});

  expect(game.getStatus()).toStrictEqual({})

  game.add("0,0");
  expect(game.getStatus()).toStrictEqual({"0,0": true,});

  game.next();
  expect(game.getStatus()).toStrictEqual({})
});

describe('getStats', () => {
  test('initializes stats correctly', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };
    
    const game = new Game(base);
    const stats = game.getStats();
    
    expect(stats).toStrictEqual({
      liveCells: 3,
      births: 0,
      deaths: 0
    });
  });

  test('tracks cumulative births and deaths', () => {
    const base = {
      "0,0": true,
      "0,1": true,
      "1,0": true
    };
    
    const game = new Game(base);
    
    // After first generation
    game.next();
    let stats = game.getStats();
    
    expect(stats.liveCells).toBe(4);
    expect(stats.births).toBe(1);
    expect(stats.deaths).toBe(0);
    
    // After second generation
    game.next();
    stats = game.getStats();
    
    expect(stats.liveCells).toBe(4);
    expect(stats.births).toBe(1);
    expect(stats.deaths).toBe(0);
  });

  test('tracks deaths correctly', () => {
    const base = {
      "0,0": true,
      "0,1": true
    };
    
    const game = new Game(base);
    
    // All cells should die
    game.next();
    const stats = game.getStats();
    
    expect(stats).toStrictEqual({
      liveCells: 0,
      births: 0,
      deaths: 2
    });
  });

  test('tracks multiple generations correctly', () => {
    // Blinker pattern (oscillator)
    const base = {
      "0,0": true,
      "1,0": true,
      "2,0": true
    };
    
    const game = new Game(base);
    
    // First generation - vertical to horizontal
    game.next();
    let stats = game.getStats();
    
    expect(stats.liveCells).toBe(3);
    expect(stats.births).toBe(2);
    expect(stats.deaths).toBe(2);
    
    // Second generation - horizontal to vertical
    game.next();
    stats = game.getStats();
    
    expect(stats.liveCells).toBe(3);
    expect(stats.births).toBe(4); // 2 from first + 2 from second
    expect(stats.deaths).toBe(4); // 2 from first + 2 from second
  });
});