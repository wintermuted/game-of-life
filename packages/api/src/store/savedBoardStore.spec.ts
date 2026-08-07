import { describe, test, expect, beforeEach } from 'vitest';
import { SavedBoardStore } from '../store/savedBoardStore';

describe('SavedBoardStore', () => {
  let store: SavedBoardStore;

  beforeEach(() => {
    store = new SavedBoardStore();
  });

  test('returns empty list for unknown user', () => {
    expect(store.list('user1')).toStrictEqual([]);
  });

  test('upserts a new board', () => {
    const board = store.upsert('user1', 'board1', {
      hash: 'abc123',
      title: 'My Board',
      clientUpdatedAt: Date.now(),
    });
    expect(board.id).toBeTruthy();
    expect(board.userId).toBe('user1');
    expect(board.hash).toBe('abc123');
    expect(board.title).toBe('My Board');
    expect(board.visibility).toBe('private');
    expect(board.rulesLocked).toBe(true);
    expect(board.createdAt).toBe(board.updatedAt);
  });

  test('lists boards sorted by updatedAt descending', async () => {
    store.upsert('user1', 'b1', { hash: 'h1', title: 'First', clientUpdatedAt: 1000 });
    await new Promise((r) => setTimeout(r, 2));
    store.upsert('user1', 'b2', { hash: 'h2', title: 'Second', clientUpdatedAt: 2000 });
    const list = store.list('user1');
    expect(list[0].title).toBe('Second');
    expect(list[1].title).toBe('First');
  });

  test('last-write-wins: rejects stale client update', () => {
    const first = store.upsert('user1', 'b1', {
      hash: 'h1',
      title: 'Original',
      clientUpdatedAt: 2000,
    });
    const second = store.upsert('user1', 'b1', {
      hash: 'h1',
      title: 'Stale',
      clientUpdatedAt: 1000, // older than server record
    });
    expect(second.title).toBe('Original');
    expect(second.id).toBe(first.id);
  });

  test('last-write-wins: accepts newer client update', () => {
    store.upsert('user1', 'b1', {
      hash: 'h1',
      title: 'Original',
      clientUpdatedAt: 1000,
    });
    const updated = store.upsert('user1', 'b1', {
      hash: 'h1',
      title: 'Updated',
      clientUpdatedAt: Date.now() + 10000,
    });
    expect(updated.title).toBe('Updated');
  });

  test('get returns null for missing board', () => {
    expect(store.get('user1', 'missing')).toBeNull();
  });

  test('delete removes a board', () => {
    store.upsert('user1', 'b1', { hash: 'h1', title: 'Board', clientUpdatedAt: Date.now() });
    expect(store.delete('user1', 'b1')).toBe(true);
    expect(store.list('user1')).toHaveLength(0);
  });

  test('delete returns false for unknown board', () => {
    expect(store.delete('user1', 'missing')).toBe(false);
  });

  test('trims title whitespace', () => {
    const board = store.upsert('user1', 'b1', {
      hash: 'h1',
      title: '  Padded  ',
      clientUpdatedAt: Date.now(),
    });
    expect(board.title).toBe('Padded');
  });
});
