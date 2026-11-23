import { createLifeGrid, DEFAULT_RULES } from '@game-of-life/core';
import { encodeGridToBase64 } from '@game-of-life/util';
import {
  clearActiveBrowserStorageData,
  ensureSeededSocialData,
  getBrowserStorageMode,
  getFavoriteBoards,
  getForkOrigin,
  getRecentBoards,
  getSavedBoards,
  getSavedTemplateNames,
  getStoredProfileUser,
  hashToGrid,
  isBoardFavorited,
  setBrowserStorageMode,
  setSavedTemplateNames,
  setStoredProfileUser,
  toggleFavoriteBoard,
  trackRecentBoard,
  upsertForkOrigin,
  upsertSavedBoard,
} from '@game-of-life/api';

describe('browser-backed API', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('reads existing saved-board records and legacy grid hashes without changing storage', () => {
    const hash = btoa(JSON.stringify({ '0,0': true, '1,0': '#ff0000' }));
    const records = [
      {
        hash,
        title: ' Legacy board ',
        tags: [' old ', 'old'],
        updatedAt: 123,
      },
    ];
    const serialized = JSON.stringify(records);
    window.localStorage.setItem('gol.storage.savedBoards', serialized);

    expect(getSavedBoards()).toStrictEqual([
      {
        ...records[0],
        title: 'Legacy board',
        boardId: hash,
        category: undefined,
        description: undefined,
        tags: ['old'],
        visibility: 'private',
        rules: undefined,
        rulesLocked: true,
      },
    ]);
    expect(hashToGrid(hash)).toStrictEqual(createLifeGrid({ '0,0': true, '1,0': '#ff0000' }));
    expect(window.localStorage.getItem('gol.storage.savedBoards')).toBe(serialized);
  });

  test('updates a board by its stable ID even when its encoded grid changes', () => {
    const originalHash = encodeGridToBase64(createLifeGrid({ '0,0': '#ff0000' }));
    const editedGrid = createLifeGrid({ '1,0': '#00ff00' });
    const editedHash = encodeGridToBase64(editedGrid);
    upsertSavedBoard(
      originalHash,
      'Original',
      'board-1',
      'Custom',
      'Description',
      'public',
      ['test'],
      DEFAULT_RULES,
      false,
    );
    upsertSavedBoard(editedHash, ' Edited ', 'board-1');

    const records = getSavedBoards();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      hash: editedHash,
      boardId: 'board-1',
      title: 'Edited',
      category: 'Custom',
      description: 'Description',
      visibility: 'public',
      tags: ['test'],
      rules: DEFAULT_RULES,
      rulesLocked: false,
    });
    expect(hashToGrid(records[0].hash)).toStrictEqual(editedGrid);
  });

  test('migrates all browser-backed data to session storage and clears only the active mode', () => {
    const hash = encodeGridToBase64(createLifeGrid({ '0,0': '#ff0000' }));
    setSavedTemplateNames({ [hash]: 'Board' });
    upsertSavedBoard(hash, 'Board');
    trackRecentBoard(hash, 'Board');
    setStoredProfileUser({ name: 'Test User' });
    toggleFavoriteBoard(hash, 'Board');
    upsertForkOrigin(hash, { parentHash: 'parent', parentTitle: 'Parent', parentSource: 'system' });
    ensureSeededSocialData([{ hash, title: 'Board', source: 'user' }]);

    const keys = [
      'savedTemplateNames',
      'savedBoards',
      'recentBoards',
      'favoriteBoards',
      'forkOrigins',
      'profileUser',
      'socialSeed.v1',
    ].map((suffix) => `gol.storage.${suffix}`);
    const originalRecords = keys.map((key) => window.localStorage.getItem(key));

    setBrowserStorageMode('session');
    expect(getBrowserStorageMode()).toBe('session');
    expect(keys.map((key) => window.sessionStorage.getItem(key))).toStrictEqual(originalRecords);
    expect(getSavedTemplateNames()).toStrictEqual({ [hash]: 'Board' });
    expect(getStoredProfileUser().name).toBe('Test User');
    expect(isBoardFavorited(hash)).toBe(true);
    expect(getForkOrigin(hash)?.parentHash).toBe('parent');
    expect(getRecentBoards()[0].hash).toBe(hash);

    window.sessionStorage.setItem('themeMode', 'dark');
    clearActiveBrowserStorageData();
    expect(keys.map((key) => window.sessionStorage.getItem(key))).toStrictEqual(
      keys.map(() => null),
    );
    expect(window.sessionStorage.getItem('themeMode')).toBe('dark');
    expect(getSavedBoards()).toStrictEqual([]);
    expect(keys.map((key) => window.localStorage.getItem(key))).toStrictEqual(originalRecords);
    setBrowserStorageMode('local');
    expect(getSavedBoards()[0].hash).toBe(hash);
  });

  test('retains the recent-board limit and actor-specific favorite toggles', () => {
    for (let index = 0; index < 13; index += 1) {
      trackRecentBoard(`hash-${index}`, `Board ${index}`, `board-${index}`);
    }
    trackRecentBoard('updated-hash', 'Edited', 'board-12');
    const recentBoards = getRecentBoards();
    expect(recentBoards).toHaveLength(12);
    expect(recentBoards[0]).toMatchObject({ hash: 'updated-hash', boardId: 'board-12' });
    expect(recentBoards.some((board) => board.boardId === 'board-0')).toBe(false);

    expect(toggleFavoriteBoard('hash', 'Board', 'One')).toBe(true);
    expect(toggleFavoriteBoard('hash', 'Board', 'Two')).toBe(true);
    expect(toggleFavoriteBoard('hash', 'Board', 'One')).toBe(false);
    expect(isBoardFavorited('hash', 'One')).toBe(false);
    expect(isBoardFavorited('hash', 'Two')).toBe(true);
    expect(getFavoriteBoards()).toHaveLength(1);
  });
});
