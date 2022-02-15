import { useEffect, useState } from 'react';
import Grid from "./components/Grid";
import GridControls from "./components/GridControls";
import { getGenerationSpeed } from './util';
import Game from '../class/Game';

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const blinker = { 
  "0,0": true,
  "1,0": true,
  "2,0": true,
};

const glider = { 
  "0,0": true,
  "1,0": true,
  "2,0": true,
  "2,1": true,
  "1,2": true,
};

const rPentomino = { 
  "1,0": true,
  "0,1": true,
  "1,1": true,
  "1,2": true,
  "2,2": true,
};

const baseGame = rPentomino;

function App() {
  const [boardNeedsInitiaization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(1);
  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    if (boardNeedsInitiaization) {
      console.info('Board needs Initialization')
      game = new Game(baseGame)
      setBoardInitialization(false);
      setGeneration(0);
    }
  });

  function runGameInterval() {
    intervalID = setInterval(() => {
      game.next();
      setGeneration(game.getGenerations())
    }, getGenerationSpeed(generationSpeed))
  }

  function runGame() {
    runGameInterval();
    setIsGameRunning(true);
  }

  function stopGame() {
    clearInterval(intervalID)
    setIsGameRunning(false);
  }

  function onMouseOver(e: React.MouseEvent) {
    console.log(e.target);
  }

  function nextGeneration(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.info('Next generation pushed')
    game.next();
    setGeneration(game.getGenerations())
  }

  function updateGenerationSpeed(value: number) {
    setGenerationSpeed(value)

    if (isGameRunning) {
      clearInterval(intervalID)
      runGameInterval();
    }
  }

  function resetBoard() {
    console.info("Reset board pushed.");
    setBoardInitialization(true);
  }

  return (
    <div className="App">
      <h1>Game of Life</h1>
      {generation}
      <Grid game={game} onMouseOver={onMouseOver} />
      <GridControls 
        nextGeneration={nextGeneration} 
        updateGenerationSpeed={updateGenerationSpeed}
        generationSpeed={generationSpeed} 
        resetBoard={resetBoard}
        runGame={runGame}
        stopGame={stopGame}
      />
    </div>
  );
}

export default App;