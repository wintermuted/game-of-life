import { calculateNextGeneration } from "../core/game";
import { LifeGrid } from "../interfaces";

class Game {
  grid: LifeGrid;
  generations: number;

  constructor(grid: LifeGrid) {
    this.grid = grid;
    this.generations = 0;
  }

  add(coordinate: string) {
    this.grid[coordinate] = true;
  }

  getGenerations() {
    return this.generations;
  }

  next() {
    this.grid = calculateNextGeneration(this.grid);
    this.generations = this.generations + 1;
    
    return this.grid;
  }

  getStatus() {
    return this.grid;
  }
}

export default Game;