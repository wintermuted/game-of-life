export type LifeCell = string;

// The Life Grid state is represented as a Hash
export interface LifeGrid {
  [coordinate: string]: LifeCell;
}

// Statistics for a generation transition
export interface GameStats {
  liveCells: number;
  births: number;
  deaths: number;
}

// Game rule definition
export interface GameRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Configuration for all game rules
export interface GameRules {
  survival2: GameRule;
  survival3: GameRule;
  birth3: GameRule;
  experimentalSpeciesCompetitionBirth: GameRule;
  experimentalSpeciesCompetitionTieBreakBirth: GameRule;
  death: GameRule;
}