import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Grid from "./components/Grid";
import GridControls from "./components/GridControls";
import PatternInput from "./components/PatternInput";
import { getGenerationSpeed } from './util';
import Game from '../class/Game';
import { rPentomino } from '../data/methuselahs';
import { useThemeMode } from './ThemeContext';
import { LifeGrid } from '../interfaces';

// Game of Life with MUI

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function App() {
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<LifeGrid>(baseGame);
  const { mode, toggleTheme } = useThemeMode();

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization')
      game = new Game(currentPattern)
      setBoardInitialization(false);
      setGeneration(0);
    }
  }, [boardNeedsInitialization, currentPattern]);

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

  function loadCustomPattern(grid: LifeGrid) {
    console.info("Loading custom pattern", grid);
    setCurrentPattern(grid);
    setBoardInitialization(true);
  }

  const gameStatus = game.getStatus ? game.getStatus(): {};
  const gridJSON = JSON.stringify(gameStatus, null, 2);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Conway's Game of Life
          </Typography>
          <Tooltip title="Toggle dark mode">
            <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle dark mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="View source on GitHub">
            <IconButton
              color="inherit"
              aria-label="github"
              component="a"
              href="https://github.com/wintermuted/game-of-life"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className="App">
        <Box display="flex" gap={3} sx={{ py: 3 }}>
          <Box className="left-column">
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
              <PatternInput 
                onLoadPattern={loadCustomPattern}
                disabled={isGameRunning}
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
    </Box>
  );
}

export default App;
