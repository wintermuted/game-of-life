import { useState } from 'react';
import '../styles/GridControls.scss';

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  toggleGame: () => void;
  isGameRunning: boolean;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  resetBoard,
  toggleGame,
  isGameRunning 
}: Props) {
  const [showResetModal, setShowResetModal] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateGenerationSpeed(parseInt(e.target.value, 10))
  }

  function confirmReset() {
    resetBoard();
    setShowResetModal(false);
  }

  function cancelReset() {
    setShowResetModal(false);
  }

  return (
    <div className="GridControls">
      <form onSubmit={(e) => e.preventDefault()}>

      <h1>Game Controls</h1>
      <div className="button-group">
        <button className="btn-primary" onClick={toggleGame}>{isGameRunning ? 'Pause' : 'Start'}</button>
        <button className="btn-secondary" onClick={nextGeneration}>Next</button>
        <button className="btn-danger" onClick={() => setShowResetModal(true)} disabled={isGameRunning}>Reset</button>
      </div>

      <h1>Game Variables</h1>

      <label>Generation Speed: {generationSpeed}</label>
      <input 
        type="range"
        name="generationSpeed"
        min="1" 
        max="10" 
        step="1" 
        value={generationSpeed}
        onChange={onChange} 
      />
      </form>
      
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Reset</h2>
            <p>Are you sure you want to reset the game? This will clear the current state and start over.</p>
            <div className="modal-buttons">
              <button onClick={confirmReset}>Yes, Reset</button>
              <button onClick={cancelReset}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GridControls;