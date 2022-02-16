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

      <h1>Game Controls</h1>
      <button onClick={runGame}>Start</button>
      <button onClick={stopGame}>Stop</button>
      <button onClick={nextGeneration}>Next</button>
      <button onClick={resetBoard}>Reset</button>
      <button>Clear</button>
      <br />

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
    </div>
  );
}

export default GridControls;