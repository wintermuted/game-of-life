import { Grid } from '@game-of-life/ui-grid';
import { GridControls } from '@game-of-life/ui-controls';
import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardEditing } from './useBoardEditing';
import type { StampEditing } from './useStampEditing';
import type { BoardPresentation } from './useBoardPresentation';
import type { BoardTransitions } from './useBoardTransitions';

export function PlaygroundBoard(props: {
  board: Pick<PlaygroundBoardState, 'isEditMode' | 'rules' | 'game'>;
  metadata: Pick<PlaygroundMetadata, 'isSystemPattern'>;
  playback: Pick<
    SimulationPlayback,
    | 'generationSpeed'
    | 'isGameRunning'
    | 'boardStateOverlay'
    | 'continuePlayingFromBoardState'
    | 'toggleGame'
    | 'nextGeneration'
    | 'updateGenerationSpeed'
  >;
  editing: Pick<
    BoardEditing,
    | 'undoBoardSnapshot'
    | 'selectedCellsGrid'
    | 'selectionStartCoordinate'
    | 'selectionEndCoordinate'
    | 'activeEditTool'
    | 'hoveredCoordinate'
    | 'centerCoordinateRequest'
    | 'handleHoverCoordinateChange'
    | 'handleEditToolChange'
    | 'handleSelectionStart'
    | 'handleSelectionChange'
    | 'handleSelectionEnd'
    | 'handleBoardEditStart'
    | 'undoBoardChange'
    | 'handleCellPaint'
    | 'handleSelectionColorFill'
    | 'selectionCount'
  >;
  stamp: Pick<
    StampEditing,
    | 'stampPattern'
    | 'stampRotation'
    | 'rotateStampKeyPressToken'
    | 'rotatedStampPattern'
    | 'tintedStampPreviewPattern'
    | 'stampPatternName'
    | 'handleContextCoordinateRequest'
    | 'handleStampPatternSelect'
    | 'handleStampPatternAtCoordinate'
    | 'rotateStampPattern'
  >;
  presentation: Pick<
    BoardPresentation,
    | 'isBoardMaximized'
    | 'isBirthDeathPreviewEnabled'
    | 'selectedPaletteId'
    | 'selectedPalette'
    | 'activeDrawColor'
    | 'handlePaletteChange'
    | 'handleDrawColorChange'
    | 'handleCustomColorCommitted'
    | 'handleBoardMouseMove'
    | 'copyCurrentURL'
    | 'toggleBoardMaximized'
  >;
  transitions: Pick<
    BoardTransitions,
    'returnToEditModeFromBoardState' | 'enterPlayMode' | 'enterEditMode' | 'requestResetBoard'
  >;
}): React.JSX.Element {
  const { isEditMode, rules, game } = props.board;
  const { isSystemPattern } = props.metadata;
  const {
    generationSpeed,
    isGameRunning,
    boardStateOverlay,
    continuePlayingFromBoardState,
    toggleGame,
    nextGeneration,
    updateGenerationSpeed,
  } = props.playback;
  const {
    undoBoardSnapshot,
    selectedCellsGrid,
    selectionStartCoordinate,
    selectionEndCoordinate,
    activeEditTool,
    hoveredCoordinate,
    centerCoordinateRequest,
    handleHoverCoordinateChange,
    handleEditToolChange,
    handleSelectionStart,
    handleSelectionChange,
    handleSelectionEnd,
    handleBoardEditStart,
    undoBoardChange,
    handleCellPaint,
    handleSelectionColorFill,
    selectionCount,
  } = props.editing;
  const {
    stampPattern,
    stampRotation,
    rotateStampKeyPressToken,
    rotatedStampPattern,
    tintedStampPreviewPattern,
    stampPatternName,
    handleContextCoordinateRequest,
    handleStampPatternSelect,
    handleStampPatternAtCoordinate,
    rotateStampPattern,
  } = props.stamp;
  const {
    isBoardMaximized,
    isBirthDeathPreviewEnabled,
    selectedPaletteId,
    selectedPalette,
    activeDrawColor,
    handlePaletteChange,
    handleDrawColorChange,
    handleCustomColorCommitted,
    handleBoardMouseMove,
    copyCurrentURL,
    toggleBoardMaximized,
  } = props.presentation;
  const { returnToEditModeFromBoardState, enterPlayMode, enterEditMode, requestResetBoard } =
    props.transitions;
  const { t } = useTranslation();
  return (
    <div
      className={`left-column wm-sidebar-layout-main${isBoardMaximized ? ' board-maximized' : ''}`}
      onMouseMove={handleBoardMouseMove}
    >
      <Grid
        game={game}
        centerCoordinateRequest={centerCoordinateRequest}
        onHoverCoordinateChange={handleHoverCoordinateChange}
        hoveredCoordinate={hoveredCoordinate}
        onContextCoordinateRequest={handleContextCoordinateRequest}
        onPaintStart={handleBoardEditStart}
        selectionGrid={isEditMode && activeEditTool === 'selection' ? selectedCellsGrid : null}
        selectionStartCoordinate={
          isEditMode && activeEditTool === 'selection' ? selectionStartCoordinate : null
        }
        selectionEndCoordinate={
          isEditMode && activeEditTool === 'selection' ? selectionEndCoordinate : null
        }
        onSelectionStart={handleSelectionStart}
        onSelectionChange={handleSelectionChange}
        onSelectionEnd={handleSelectionEnd}
        selectionCount={selectionCount}
        palette={selectedPalette}
        isEditMode={isEditMode}
        rules={rules}
        onCellPaint={handleCellPaint}
        activeDrawColor={activeDrawColor}
        activeEditTool={activeEditTool}
        stampPattern={rotatedStampPattern}
        onStampPatternAtCoordinate={handleStampPatternAtCoordinate}
        showBirthDeathPreview={isBirthDeathPreviewEnabled}
        isBoardMaximized={isBoardMaximized}
        toggleBoardMaximized={toggleBoardMaximized}
        playOverlayContent={
          <GridControls
            variant="play"
            nextGeneration={nextGeneration}
            updateGenerationSpeed={updateGenerationSpeed}
            generationSpeed={generationSpeed}
            hoveredCoordinate={hoveredCoordinate}
            onResetRequested={requestResetBoard}
            toggleGame={toggleGame}
            isGameRunning={isGameRunning}
            copyCurrentURL={copyCurrentURL}
            selectedPaletteId={selectedPaletteId}
            selectedDrawColor={activeDrawColor}
            onPaletteChange={handlePaletteChange}
            onDrawColorChange={handleDrawColorChange}
            onCustomColorCommitted={handleCustomColorCommitted}
            isEditMode={isEditMode}
            onEnterEditMode={enterEditMode}
            onEnterPlayMode={enterPlayMode}
            onUndoBoardChange={undoBoardChange}
            canUndoBoardChange={undoBoardSnapshot !== null}
            isSystemPattern={isSystemPattern}
            activeEditTool={activeEditTool}
            onEditToolChange={handleEditToolChange}
            selectionCount={selectionCount}
            onFillSelectionColor={handleSelectionColorFill}
            stampPattern={stampPattern}
            stampPreviewPattern={tintedStampPreviewPattern}
            stampPatternName={stampPatternName}
            stampRotation={stampRotation}
            rotateStampKeyPressToken={rotateStampKeyPressToken}
            onRotateStamp={rotateStampPattern}
            onStampPatternSelect={handleStampPatternSelect}
          />
        }
      />
      {boardStateOverlay && (
        <div
          className="board-state-overlay board-state-overlay-top"
          role="dialog"
          aria-modal="false"
          aria-live="polite"
        >
          <div className="board-state-overlay-panel">
            <h4 className="board-state-overlay-title">
              {boardStateOverlay === 'stability'
                ? t('messages.stabilityDetectedTitle')
                : t('messages.gameOverTitle')}
            </h4>
            <p className="board-state-overlay-text">
              {boardStateOverlay === 'stability'
                ? t('messages.stabilityDetectedDescription')
                : t('messages.gameOverDescription')}
            </p>
            <div className="board-state-overlay-actions">
              <button
                className="btn btn-sm btn-secondary-neutral"
                type="button"
                onClick={returnToEditModeFromBoardState}
              >
                {t('messages.returnToEditMode')}
              </button>
              {boardStateOverlay === 'stability' && (
                <button
                  className="btn btn-sm btn-primary-neutral"
                  type="button"
                  onClick={continuePlayingFromBoardState}
                >
                  {t('messages.continuePlaying')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
