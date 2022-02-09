import { calculateNextGeneration, LifeGrid } from "./game";

class Game {
  grid: LifeGrid;

  constructor(grid: LifeGrid) {
    this.grid = grid;
  }

  add(coordinate: string) {
    this.grid[coordinate] = true;
  }

  next() {
    this.grid = calculateNextGeneration(this.grid);
    
    return this.grid;
  }

  getStatus() {
    return this.grid;
  }
}

export default Game;