/**
 * Minimal GameRules type mirrored from @game-of-life/core for use in the API
 * layer without a hard dependency on the frontend package.
 */
export interface GameRules {
  birth: number[];
  survival: number[];
}
