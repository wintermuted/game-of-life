import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Snackbar, Alert } from '@mui/material';
import Grid from "./Grid";
import GridControls from "./GridControls";
import PatternInput from "./PatternInput";
import RulesPanel from "./RulesPanel";
import ColorPaletteSelector from "./ColorPaletteSelector";
import { getGenerationSpeed } from '../util';
import Game from '../../class/Game';
import { rPentomino } from '../../data/methuselahs';
import { LifeGrid, GameStats, GameRules } from '../../interfaces';
import { getGridFromURL, updateURLWithGrid } from '../util/urlState';
import { DEFAULT_RULES } from '../../core/game';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';

// Game of Life with MUI

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function Home() {
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
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [selectedPaletteId, setSelectedPaletteId] = useState(DEFAULT_PALETTE_ID);
  const selectedPalette = getPaletteById(selectedPaletteId);

  useEffect(() => {
    if (boardNeedsInitialization) {
      console.info('Board needs Initialization')
      game = new Game(currentPattern, rules)
      setBoardInitialization(false);
      setGeneration(0);
      setStats(game.getStats());
    }
  }, [boardNeedsInitialization, currentPattern, rules]);

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

  function handleRulesChange(newRules: GameRules) {
    console.info("Rules updated", newRules);
    setRules(newRules);
    if (game.setRules) {
      game.setRules(newRules);
    }
  }

  function handlePaletteChange(paletteId: string) {
    console.info("Palette changed", paletteId);
    setSelectedPaletteId(paletteId);
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

  const gameStatus = game.getStatus ? game.getStatus() : {};
  const gridJSON = JSON.stringify(gameStatus, null, 2);

  return (
    <Container maxWidth="xl" className="App">
      <Box display="flex" gap={3} sx={{ py: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box className="left-column" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Grid game={game} onMouseOver={onMouseOver} palette={selectedPalette} />
        </Box>
        <Box className="right-column" sx={{ width: { xs: '100%', md: '350px' } }}>
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
            <ColorPaletteSelector
              selectedPaletteId={selectedPaletteId}
              onPaletteChange={handlePaletteChange}
              disabled={isGameRunning}
            />
          </Paper>
          <RulesPanel 
            rules={rules}
            onRulesChange={handleRulesChange}
            disabled={isGameRunning}
          />
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
    </Container>
  );
}

export default Home;
