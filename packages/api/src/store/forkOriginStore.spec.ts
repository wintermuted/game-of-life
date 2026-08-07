import { describe, test, expect, beforeEach } from 'vitest';
import { ForkOriginStore } from '../store/forkOriginStore';

describe('ForkOriginStore', () => {
  let store: ForkOriginStore;

  beforeEach(() => {
    store = new ForkOriginStore();
  });

  test('returns empty list for unknown user', () => {
    expect(store.list('user1')).toStrictEqual([]);
  });

  test('adds a fork origin', () => {
    const fork = store.add('user1', {
      hash: 'child-hash',
      parentHash: 'parent-hash',
      parentTitle: 'Glider',
      parentSource: 'system',
      forkerName: 'Alice',
    });
    expect(fork.hash).toBe('child-hash');
    expect(fork.parentHash).toBe('parent-hash');
    expect(fork.forkerName).toBe('Alice');
    expect(fork.userId).toBe('user1');
  });

  test('immutable append: adding same hash again returns the existing record', () => {
    const first = store.add('user1', {
      hash: 'child-hash',
      parentHash: 'p1',
      parentTitle: 'Original',
      parentSource: 'system',
    });
    const second = store.add('user1', {
      hash: 'child-hash',
      parentHash: 'p2',
      parentTitle: 'Should not overwrite',
      parentSource: 'user',
    });
    expect(second.id).toBe(first.id);
    expect(second.parentTitle).toBe('Original');
    expect(store.list('user1')).toHaveLength(1);
  });

  test('get returns null for unknown hash', () => {
    expect(store.get('user1', 'missing')).toBeNull();
  });

  test('trims parentTitle whitespace', () => {
    const fork = store.add('user1', {
      hash: 'h',
      parentHash: 'p',
      parentTitle: '  Spaceship  ',
      parentSource: 'system',
    });
    expect(fork.parentTitle).toBe('Spaceship');
  });
});
