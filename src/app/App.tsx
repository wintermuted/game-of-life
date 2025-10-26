import { useEffect, useState } from 'react';
import Grid from "./components/Grid";
import GridControls from "./components/GridControls";
import { getGenerationSpeed } from './util';
import Game from '../class/Game';
import { rPentomino } from '../data/methuselahs';
import './styles/App.scss'

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function App() {
  const [boardNeedsInitiaization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    if (boardNeedsInitiaization) {
      console.info('Board needs Initialization')
      game = new Game(baseGame)
      setBoardInitialization(false);
      setGeneration(0);
    }
  }, [boardNeedsInitiaization]);

  function runGameInterval() {
    intervalID = setInterval(() => {
      game.next();
      setGeneration(game.getGenerations())
    }, getGenerationSpeed(generationSpeed))
  }

  function toggleGame() {
    if (isGameRunning) {
      console.info("Pausing game.");
      clearInterval(intervalID);
      setIsGameRunning(false);
    } else {
      console.info("Starting game.");
      runGameInterval();
      setIsGameRunning(true);
    }
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
    console.info('Generation Speed updated', value)

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

  const gameStatus = game.getStatus ? game.getStatus(): {};
  const gridJSON = JSON.stringify(gameStatus, null, 2);

  return (
    <div className="App">
      <h1>Game of Life</h1>
      <Grid game={game} onMouseOver={onMouseOver} />
      <GridControls 
        nextGeneration={nextGeneration} 
        updateGenerationSpeed={updateGenerationSpeed}
        generationSpeed={generationSpeed} 
        resetBoard={resetBoard}
        toggleGame={toggleGame}
        isGameRunning={isGameRunning}
      />
      <h1>Diagnostics</h1>
      <h2>Cell Data</h2>
      <p>
      <span><strong>Generations:</strong> {generation}</span>
      </p>
      <pre>
        { gridJSON }
      </pre>
    </div>
  );
}

export default App;