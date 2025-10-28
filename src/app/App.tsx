import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, AppBar, Toolbar, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
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
import { LifeGrid, GameStats } from '../interfaces';
import { getGridFromURL, updateURLWithGrid } from './util/urlState';

// Game of Life with MUI

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function App() {
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<LifeGrid>(() => {
    // Check URL for pattern on initial load
    const urlPattern = getGridFromURL();
    return urlPattern || baseGame;
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [stats, setStats] = useState<GameStats>({ liveCells: 0, births: 0, deaths: 0 });
  const { mode, toggleTheme } = useThemeMode();

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization')
      game = new Game(currentPattern)
      setBoardInitialization(false);
      setGeneration(0);
      setStats(game.getStats());
    }
  }, [boardNeedsInitialization, currentPattern]);

  function runGameInterval() {
    intervalID = setInterval(() => {
      game.next();
      setGeneration(game.getGenerations())
      setStats(game.getStats());
    }, getGenerationSpeed(generationSpeed))
  }

  function toggleGame() {
    if (isGameRunning) {
      console.info("Pausing game.");
      clearInterval(intervalID);
      setIsGameRunning(false);
      
      // Update URL when game is paused
      const currentGrid = game.getStatus();
      updateURLWithGrid(currentGrid);
      setSnackbarMessage('URL updated with current pattern');
      setSnackbarOpen(true);
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
    setStats(game.getStats());
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
    
    // Update URL when pattern is selected
    updateURLWithGrid(grid);
  }

  function handleSnackbarClose() {
    setSnackbarOpen(false);
  }

  function copyCurrentURL() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage('URL copied to clipboard');
      setSnackbarOpen(true);
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setSnackbarMessage('Failed to copy URL');
      setSnackbarOpen(true);
    });
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
                copyCurrentURL={copyCurrentURL}
              />
              <PatternInput 
                onLoadPattern={loadCustomPattern}
                disabled={isGameRunning}
              />
            </Paper>
            <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
              <Typography variant="h5" gutterBottom>Diagnostics</Typography>
              <Typography variant="h6" gutterBottom>Statistics</Typography>
              <Typography variant="body1">
                <strong>Generations:</strong> {generation}
              </Typography>
              <Typography variant="body1">
                <strong>Live Cells:</strong> {stats.liveCells}
              </Typography>
              <Typography variant="body1">
                <strong>Total Births:</strong> {stats.births}
              </Typography>
              <Typography variant="body1">
                <strong>Total Deaths:</strong> {stats.deaths}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Cell Data</Typography>
              <Box component="pre" sx={{ overflow: 'auto', maxHeight: 400 }}>
                { gridJSON }
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
