import { describe, test, expect, beforeEach } from 'vitest';
import { ProfileStore } from '../store/profileStore';

describe('ProfileStore', () => {
  let store: ProfileStore;

  beforeEach(() => {
    store = new ProfileStore();
  });

  test('returns null for unknown user', () => {
    expect(store.get('user1')).toBeNull();
  });

  test('getOrCreate initialises a default profile', () => {
    const profile = store.getOrCreate('user1');
    expect(profile.id).toBe('user1');
    expect(profile.timezone).toBe('UTC');
    expect(profile.favoritePalette).toBe('Classic Green');
  });

  test('update last-write-wins: rejects stale client update', () => {
    store.getOrCreate('user1');
    const updated = store.update('user1', {
      name: 'Alice',
      clientUpdatedAt: 0, // very old
    });
    expect(updated.name).toBe(''); // default; stale update rejected
  });

  test('update last-write-wins: accepts newer client update', () => {
    store.getOrCreate('user1');
    const updated = store.update('user1', {
      name: 'Alice',
      email: 'alice@example.com',
      clientUpdatedAt: Date.now() + 10000,
    });
    expect(updated.name).toBe('Alice');
    expect(updated.email).toBe('alice@example.com');
  });

  test('trims field whitespace', () => {
    store.getOrCreate('user1');
    const updated = store.update('user1', {
      name: '  Bob  ',
      clientUpdatedAt: Date.now() + 10000,
    });
    expect(updated.name).toBe('Bob');
  });
});
