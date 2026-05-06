import { useEffect, useRef, useState } from 'react';
import Grid from "./Grid";
import GridControls from "./GridControls";
import PatternInput from "./PatternInput";
import RulesPanel from "./RulesPanel";
import { getGenerationSpeed } from '../util';
import { Game, rPentomino, LifeGrid, GameStats, GameRules, DEFAULT_RULES } from '@game-of-life/core';
import { getGridFromURL, updateURLWithGrid } from '../util/urlState';
import { DEFAULT_PALETTE_ID, getPaletteById } from '../constants/colors';
import { useTranslation } from 'react-i18next';

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function Home() {
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<LifeGrid>(() => {
    // Check URL for pattern on initial load
    const urlPattern = getGridFromURL();
    return urlPattern || baseGame;
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const toastHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [stats, setStats] = useState<GameStats>({ liveCells: 0, births: 0, deaths: 0 });
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [selectedPaletteId, setSelectedPaletteId] = useState(DEFAULT_PALETTE_ID);
  const selectedPalette = getPaletteById(selectedPaletteId);
  const { t } = useTranslation();

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
      setSnackbarMessage(t('messages.urlUpdated'));
      setSnackbarOpen(true);
    } else {
      console.info("Starting game.");
      setIsEditMode(false); // Disable edit mode when game starts
      runGameInterval();
      setIsGameRunning(true);
    }
  }

  function onMouseOver(e: React.MouseEvent) {
    console.log(e.target);
  }

  function nextGeneration(_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
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
    if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
  }

  useEffect(() => {
    if (snackbarOpen) {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
      toastHideTimer.current = setTimeout(() => setSnackbarOpen(false), 3000);
    }
    return () => {
      if (toastHideTimer.current) clearTimeout(toastHideTimer.current);
    };
  }, [snackbarOpen]);

  function copyCurrentURL() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage(t('messages.urlCopied'));
      setSnackbarOpen(true);
    }).catch((err) => {
      console.error('Failed to copy URL:', err);
      setSnackbarMessage(t('messages.urlCopyFailed'));
      setSnackbarOpen(true);
    });
  }

  function toggleEditMode() {
    setIsEditMode(!isEditMode);
  }

  function handleCellClick(coordinate: string) {
    if (!isEditMode || isGameRunning) return;
    
    const currentGrid = game.getStatus();
    const newGrid = { ...currentGrid };
    
    // Toggle the cell
    if (newGrid[coordinate]) {
      delete newGrid[coordinate];
    } else {
      newGrid[coordinate] = true;
    }
    
    // Update the game with the new grid
    setCurrentPattern(newGrid);
    setBoardInitialization(true);
    
    // Update URL to allow sharing custom patterns
    updateURLWithGrid(newGrid);
  }

  const gameStatus = game.getStatus ? game.getStatus() : {};
  const gridJSON = JSON.stringify(gameStatus, null, 2);

  return (
    <div className="App wm-sidebar-layout wm-sidebar-layout-stretch">
      <div className="left-column wm-sidebar-layout-main">
        <Grid 
          game={game} 
          onMouseOver={onMouseOver} 
          palette={selectedPalette}
          isEditMode={isEditMode}
          onCellClick={handleCellClick}
        />
        <div className="card card-body game-controls-bar wm-sticky-bottom game-controls-bar-margin-top">
          <GridControls 
            nextGeneration={nextGeneration} 
            updateGenerationSpeed={updateGenerationSpeed}
            generationSpeed={generationSpeed} 
            resetBoard={resetBoard}
            toggleGame={toggleGame}
            isGameRunning={isGameRunning}
            copyCurrentURL={copyCurrentURL}
            selectedPaletteId={selectedPaletteId}
            onPaletteChange={handlePaletteChange}
            isEditMode={isEditMode}
            toggleEditMode={toggleEditMode}
          />
        </div>
      </div>
      <div className="right-column wm-sidebar-layout-aside wm-sidebar-layout-aside-no-divider">
        <div className="card card-body right-column-card-spaced">
          <PatternInput 
            onLoadPattern={loadCustomPattern}
            disabled={isGameRunning}
            selectedPaletteId={selectedPaletteId}
          />
        </div>
        <RulesPanel 
          rules={rules}
          onRulesChange={handleRulesChange}
          disabled={isGameRunning}
        />
        <div className="card diagnostics-card">
          <div className="card-header">
            <h4>{t('diagnostics.title')}</h4>
          </div>
          <div className="card-body">
            <p className="diagnostics-intro">{t('diagnostics.statistics')}</p>
            <p><strong>{t('diagnostics.generations')}:</strong> {generation}</p>
            <p><strong>{t('diagnostics.liveCells')}:</strong> {stats.liveCells}</p>
            <p><strong>{t('diagnostics.totalBirths')}:</strong> {stats.births}</p>
            <p><strong>{t('diagnostics.totalDeaths')}:</strong> {stats.deaths}</p>
            <p className="diagnostics-subheading">{t('diagnostics.cellData')}</p>
            <pre className="diagnostics-json">
              {gridJSON}
            </pre>
          </div>
        </div>
      </div>

      <div
        className={`wm-toast wm-toast-success${snackbarOpen ? ' wm-toast-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {snackbarMessage}
        <button
          className="wm-toast-dismiss"
          type="button"
          aria-label="Dismiss"
          onClick={handleSnackbarClose}
        >&#x2715;</button>
      </div>
    </div>
  );
}

export default Home;
