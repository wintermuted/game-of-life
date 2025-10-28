import { calculateNextGeneration, calculateStats, DEFAULT_RULES } from "../core/game";
import { LifeGrid, GameStats, GameRules } from "../interfaces";

class Game {
  grid: LifeGrid;
  generations: number;
  totalLiveCells: number;
  totalBirths: number;
  totalDeaths: number;
  rules: GameRules;

  constructor(grid: LifeGrid, rules: GameRules = DEFAULT_RULES) {
    this.grid = grid;
    this.generations = 0;
    this.totalLiveCells = Object.keys(grid).length;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.rules = rules;
  }

  add(coordinate: string) {
    this.grid[coordinate] = true;
  }

  getGenerations() {
    return this.generations;
  }

  getRules(): GameRules {
    return this.rules;
  }

  setRules(rules: GameRules): void {
    this.rules = rules;
  }

  next() {
    const previousGrid = this.grid;
    this.grid = calculateNextGeneration(this.grid, this.rules);
    
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