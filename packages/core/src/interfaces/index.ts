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

export interface LifeLikeRuleProfile {
  birth: number[];
  survival: number[];
}

// Configuration for all game rules
export interface GameRules {
  survival2: GameRule;
  survival3: GameRule;
  birth3: GameRule;
  birth6: GameRule;
  experimentalSpeciesCompetitionBirth: GameRule;
  experimentalSpeciesCompetitionDominantBirth: GameRule;
  experimentalSpeciesCompetitionTieBreakBirth: GameRule;
  death: GameRule;
  lifeLikeProfile?: LifeLikeRuleProfile;
}

export type GameRuleKey = Exclude<keyof GameRules, 'lifeLikeProfile'>;

// Metadata + rule bundle for a named cellular automata ruleset
export interface GameRulesetDefinition {
  id: string;
  name: string;
  classification: string;
  implemented: boolean;
  notes?: string;
  rules: GameRules;
}