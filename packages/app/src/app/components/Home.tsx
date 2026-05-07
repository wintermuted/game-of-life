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
import ThemeTabs from './ui/ThemeTabs';

let game: Game = {} as Game;
let intervalID: NodeJS.Timeout = {} as NodeJS.Timeout;

const baseGame = rPentomino;

function Home() {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'patterns' | 'rules' | 'diagnostics'>('patterns');
  const [boardNeedsInitialization, setBoardInitialization] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [generationSpeed, setGenerationSpeed] = useState(3);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [cellDataCopied, setCellDataCopied] = useState(false);
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

  function requestResetBoard() {
    setIsResetModalOpen(true);
  }

  function confirmResetBoard() {
    resetBoard();
    setIsResetModalOpen(false);
  }

  function cancelResetBoard() {
    setIsResetModalOpen(false);
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
            onResetRequested={requestResetBoard}
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
        <div className="sidebar-tabs-nav right-column-card-spaced">
          <ThemeTabs
            options={[
              { value: 'patterns', label: 'Patterns' },
              { value: 'rules', label: 'Rules' },
              { value: 'diagnostics', label: 'Stats' },
            ]}
            activeValue={activeSidebarTab}
            onChange={(value) => setActiveSidebarTab(value as 'patterns' | 'rules' | 'diagnostics')}
            ariaLabel="Simulation panels"
          />
        </div>

        {activeSidebarTab === 'patterns' && (
          <div className="right-column-card-fill">
            <PatternInput 
              onLoadPattern={loadCustomPattern}
              disabled={isGameRunning}
              selectedPaletteId={selectedPaletteId}
            />
          </div>
        )}

        {activeSidebarTab === 'rules' && (
          <RulesPanel 
            rules={rules}
            onRulesChange={handleRulesChange}
            disabled={isGameRunning}
          />
        )}

        {activeSidebarTab === 'diagnostics' && (
          <div className="diagnostics-panel">
            <h4 className="diagnostics-section-heading">{t('diagnostics.statistics')}</h4>
            <div className="diagnostics-stats-grid">
              <article className="diagnostics-stat-card">
                <p className="diagnostics-stat-label">{t('diagnostics.generations')}</p>
                <p className="diagnostics-stat-value">{generation}</p>
              </article>
              <article className="diagnostics-stat-card">
                <p className="diagnostics-stat-label">{t('diagnostics.liveCells')}</p>
                <p className="diagnostics-stat-value">{stats.liveCells}</p>
              </article>
              <article className="diagnostics-stat-card">
                <p className="diagnostics-stat-label">{t('diagnostics.totalBirths')}</p>
                <p className="diagnostics-stat-value diagnostics-stat-value--success">{stats.births}</p>
              </article>
              <article className="diagnostics-stat-card">
                <p className="diagnostics-stat-label">{t('diagnostics.totalDeaths')}</p>
                <p className="diagnostics-stat-value diagnostics-stat-value--danger">{stats.deaths}</p>
              </article>
            </div>
            <h4 className="diagnostics-section-heading">{t('diagnostics.cellData')}</h4>
            <div className="code-sample" data-lang="json">
              <button
                className="code-copy-btn"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(gridJSON).then(() => {
                    setCellDataCopied(true);
                    setTimeout(() => setCellDataCopied(false), 1500);
                  });
                }}
              >
                {cellDataCopied ? 'Copied!' : 'Copy'}
              </button>
              <pre className="code-block"><code className="language-json">{gridJSON}</code></pre>
            </div>
          </div>
        )}
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

      {isResetModalOpen && (
        <div className="wm-modal-overlay" onClick={cancelResetBoard}>
          <div
            className="wm-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wm-modal-header">
              <h3 id="reset-modal-title" className="wm-modal-title">{t('dialogs.confirmReset')}</h3>
            </div>
            <div className="wm-modal-body">
              <p>{t('dialogs.resetMessage')}</p>
            </div>
            <div className="wm-modal-footer">
              <button className="btn btn-secondary btn-outline" type="button" onClick={cancelResetBoard}>
                {t('dialogs.cancel')}
              </button>
              <button className="btn btn-danger" type="button" onClick={confirmResetBoard}>
                {t('dialogs.yesReset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
