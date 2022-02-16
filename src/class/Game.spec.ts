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