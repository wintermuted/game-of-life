export type PatternSource = 'system' | 'user';

export type NameModalMode = 'rename' | 'fork';

export type DraftSaveModalMode = 'save' | 'edit';

export type EditTool = 'pencil' | 'eraser' | 'selection' | 'grab' | 'stamp';

export type RulesetSelectionId =
  | 'standard'
  | 'highlife'
  | 'day-and-night'
  | 'life-without-death'
  | 'custom';

export interface CenterCoordinateRequest {
  coordinate: string;
  requestKey: number;
}

export interface PlayPatternMetadata {
  hash: string;
  name: string;
  category: string;
  source: PatternSource;
  creatorName?: string;
  favoriteCount: number;
  forkCount: number;
  tags?: string[];
  description?: string;
  referenceUrl?: string;
}

export interface GenerationInteractionMetrics {
  overcrowdingDeathsByPressureColor: Record<string, number>;
  experimentalBirthsByColor: Record<string, number>;
  tieBreakBirthsByColor: Record<string, number>;
}
