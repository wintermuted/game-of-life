Conway's Game of Life
-----

This project is an implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) written in [Typescript](https://www.typescriptlang.org/).

## Goals
- Provide a succinct example of my programming skill in TypeScript vis-a-vis a known programming problem.
- Demonstrate my understanding of [Big O notation](https://en.wikipedia.org/wiki/Big_O_notation).
- Provide myself an opportunity to learn HTML5 Canvas.

## Current State
- The rules of the Game of Life have been implemented.  
  - A Dictionary is used as the primary datastructure.
  - A class [`Grid`](https://github.com/wintermuted/game-of-life/blob/master/src/game/Grid.ts) can be used to start a game and step through it.
- The game rules are backed with unit tests.
- The game has been tested with common Still Life & Oscillator patterns.
- There is currently no UI to use the game.

## Technology

- The game is implemented using Typescript.
- Unit tests are written with Jest.
- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
