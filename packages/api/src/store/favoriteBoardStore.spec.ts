import { describe, test, expect, beforeEach } from 'vitest';
import { FavoriteBoardStore } from '../store/favoriteBoardStore';

describe('FavoriteBoardStore', () => {
  let store: FavoriteBoardStore;

  beforeEach(() => {
    store = new FavoriteBoardStore();
  });

  test('returns empty list for unknown user', () => {
    expect(store.list('user1')).toStrictEqual([]);
  });

  test('adds a favorite', () => {
    const fav = store.add('user1', {
      boardId: 'b1',
      hash: 'h1',
      title: 'My Board',
      actorName: 'Alice',
    });
    expect(fav.boardId).toBe('b1');
    expect(fav.actorName).toBe('Alice');
    expect(fav.userId).toBe('user1');
  });

  test('set-union: adding same favorite twice returns the existing record', () => {
    const first = store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Alice' });
    const second = store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Alice' });
    expect(second.id).toBe(first.id);
    expect(store.list('user1')).toHaveLength(1);
  });

  test('different actors can favorite the same board independently', () => {
    store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Alice' });
    store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Bob' });
    expect(store.list('user1')).toHaveLength(2);
  });

  test('isFavorited returns true after adding', () => {
    store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Alice' });
    expect(store.isFavorited('user1', 'b1', 'Alice')).toBe(true);
  });

  test('isFavorited is case-insensitive for actorName', () => {
    store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'alice' });
    expect(store.isFavorited('user1', 'b1', 'ALICE')).toBe(true);
  });

  test('remove deletes a favorite', () => {
    store.add('user1', { boardId: 'b1', hash: 'h1', title: 'Board', actorName: 'Alice' });
    expect(store.remove('user1', 'b1', 'Alice')).toBe(true);
    expect(store.isFavorited('user1', 'b1', 'Alice')).toBe(false);
  });

  test('remove returns false for unknown favorite', () => {
    expect(store.remove('user1', 'missing', 'Alice')).toBe(false);
  });
});
