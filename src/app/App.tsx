import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Grid from "./components/Grid";
import GridControls from "./components/GridControls";
import { getGenerationSpeed } from './util';
import Game from '../class/Game';
import { rPentomino } from '../data/methuselahs';
import './styles/App.scss'

// Game of Life with MUI

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function App() {
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization')
      game = new Game(baseGame)
      setBoardInitialization(false);
      setGeneration(0);
    }
  }, [boardNeedsInitialization]);

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
    <Container maxWidth="xl" className="App">
      <Box display="flex" gap={3} sx={{ py: 3 }}>
        <Box className="left-column">
          <Typography variant="h3" component="h1" gutterBottom>
            Game of Life
          </Typography>
          <Grid game={game} onMouseOver={onMouseOver} />
        </Box>
        <Box className="right-column">
          <Paper elevation={3}>
            <GridControls 
              nextGeneration={nextGeneration} 
              updateGenerationSpeed={updateGenerationSpeed}
              generationSpeed={generationSpeed} 
              resetBoard={resetBoard}
              toggleGame={toggleGame}
              isGameRunning={isGameRunning}
            />
          </Paper>
          <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
            <Typography variant="h5" gutterBottom>Diagnostics</Typography>
            <Typography variant="h6" gutterBottom>Cell Data</Typography>
            <Typography variant="body1">
              <strong>Generations:</strong> {generation}
            </Typography>
            <Box component="pre" sx={{ overflow: 'auto', maxHeight: 400 }}>
              { gridJSON }
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
