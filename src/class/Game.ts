import { calculateNextGeneration, calculateStats } from "../core/game";
import { LifeGrid, GameStats } from "../interfaces";

class Game {
  grid: LifeGrid;
  generations: number;
  totalLiveCells: number;
  totalBirths: number;
  totalDeaths: number;

  constructor(grid: LifeGrid) {
    this.grid = grid;
    this.generations = 0;
    this.totalLiveCells = Object.keys(grid).length;
    this.totalBirths = 0;
    this.totalDeaths = 0;
  }

  add(coordinate: string) {
    this.grid[coordinate] = true;
  }

  getGenerations() {
    return this.generations;
  }

  next() {
    const previousGrid = this.grid;
    this.grid = calculateNextGeneration(this.grid);
    
    const stats = calculateStats(previousGrid, this.grid);
    this.totalLiveCells = stats.liveCells;
    this.totalBirths += stats.births;
    this.totalDeaths += stats.deaths;
    
    this.generations = this.generations + 1;
    
    return this.grid;
  }

  getStats(): GameStats {
    return {
      liveCells: this.totalLiveCells,
      births: this.totalBirths,
      deaths: this.totalDeaths
    };
  }

  getStatus() {
    return this.grid;
  }
}

export default Game;