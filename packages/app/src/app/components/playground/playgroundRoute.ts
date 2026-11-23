import { rPentomino, LifeGrid, GameRules, DEFAULT_RULES, patterns } from '@game-of-life/core';
import { getGridFromURL } from '@game-of-life/util';
import { getSavedBoards } from '@game-of-life/api';
import { cloneGameRules, getImplementedRulesetById } from './playgroundRules';
export function getGridSignature(grid: LifeGrid): string {
  const keys = Object.keys(grid).sort();
  return keys.map((key) => `${key}:${grid[key]}`).join('|');
}

export function getPatternHashFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('pattern');
}

export function getBoardIdFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('board');
}

export function getCatalogPatternNameFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('catalog');
}

export function updateCatalogPatternInURL(patternName: string | null): void {
  const url = new URL(window.location.href);
  if (patternName) {
    url.searchParams.set('catalog', patternName);
  } else {
    url.searchParams.delete('catalog');
  }
  window.history.replaceState({}, '', url.toString());
}

export function getInitialRulesLocked(): boolean {
  const boardId = getBoardIdFromURL();
  const patternHash = getPatternHashFromURL();
  const routeKey = boardId ?? patternHash;
  const savedBoard = routeKey
    ? getSavedBoards().find((entry) => (entry.boardId ?? entry.hash) === routeKey)
    : undefined;

  if (savedBoard) {
    return savedBoard.rulesLocked ?? true;
  }

  const routeGrid = getGridFromURL();
  return routeGrid
    ? patterns.some((pattern) => getGridSignature(pattern.grid) === getGridSignature(routeGrid))
    : false;
}

export function getEditModeFromURL(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'edit';
}

export function getRulesetFromURL(): GameRules {
  const params = new URLSearchParams(window.location.search);
  const rulesetId = params.get('ruleset');
  const ruleset = rulesetId ? getImplementedRulesetById(rulesetId) : undefined;
  return cloneGameRules(ruleset?.rules ?? DEFAULT_RULES);
}

export function toCreatorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export const baseGame = rPentomino;
