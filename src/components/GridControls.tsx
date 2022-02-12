import { useState } from "react";

interface Props {
  nextGeneration: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  updateGenerationSpeed: (value: number) => void;
  generationSpeed: number;
  resetBoard: () => void;
  runGame: () => void;
  stopGame: () => void;
}

function GridControls({ 
  nextGeneration, 
  updateGenerationSpeed, 
  generationSpeed,
  resetBoard,
  runGame,
  stopGame 
}: Props) {

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateGenerationSpeed(parseInt(e.target.value, 10))
  }

  return (
    <div className="GridControls">
      <form onSubmit={(e) => e.preventDefault()}>
      <button onClick={runGame}>Start</button>
      <button onClick={stopGame}>Stop</button>
      <button onClick={nextGeneration}>Next</button>
      <button onClick={resetBoard}>Reset</button>
      <button>Clear</button>
      <br />

      <label>Generation Speed: {generationSpeed}</label>
      <input 
        type="range"
        name="generationSpeed"
        min="500" 
        max="10000" 
        step="100" 
        value={generationSpeed}
        onChange={onChange} 
      />
      </form>
    </div>
  );
}

export default GridControls;