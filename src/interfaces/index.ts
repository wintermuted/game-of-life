// The Life Grid state is represented as a Hash
export interface LifeGrid {
  [coordinate: string]: boolean;
}

// Statistics for a generation transition
export interface GameStats {
  liveCells: number;
  births: number;
  deaths: number;
}