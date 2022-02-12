import { useEffect, useState } from 'react';
import Grid from "./components/Grid";
import GridControls from "./components/GridControls";
import Game from './game/Grid';

let game: Game = {} as Game;

function App() {
  const [boardNeedsInitiaization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(0);

  useEffect(() => {
    if (boardNeedsInitiaization) {
      console.info('Board needs Initialization')
      const baseGame = { 
        "0,0": true,
        "1,0": true,
        "2,0": true,
      };
      game = new Game(baseGame)
      setBoardInitialization(false);
      setGeneration(0);
    }
  });

  function nextGeneration(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.info('Next generation pushed')
    game.next();
    setGeneration(game.getGenerations())
  }

  function updateGenerationSpeed(value: number) {
    setGenerationSpeed(value)
  }

  function resetBoard() {
    console.info("Reset board pushed.");
    setBoardInitialization(true);
  }

  return (
    <div className="App">
      <h1>Game of Life</h1>
      {generation}
      <Grid game={game} />
      <GridControls 
        nextGeneration={nextGeneration} 
        updateGenerationSpeed={updateGenerationSpeed}
        generationSpeed={generationSpeed} 
        resetBoard={resetBoard}
      />
    </div>
  );
}

export default App;