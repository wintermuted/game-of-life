import { glider, lwss } from "../../data/spaceships";
import gameOfLife from "../game";
import { LifeGrid } from "../../interfaces";

describe('spaceships', () => {
  describe('glider', () => {
    let current: LifeGrid = glider;
    
    // Glider returns to original pattern (but translated) after 4 generations
    for (let i = 0; i < 4; i++) {
      current = gameOfLife(current);
    }

    test('moves after 4 generations', () => {
      // The glider should have the same number of cells
      expect(Object.keys(current).length).toBe(Object.keys(glider).length);
      // But should be in a different position
      expect(current).not.toStrictEqual(glider);
    })

    test('is alive after multiple generations', () => {
      let pattern: LifeGrid = glider;
      for (let i = 0; i < 10; i++) {
        pattern = gameOfLife(pattern);
      }
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })
  });

  describe('lwss (Lightweight Spaceship)', () => {
    let current: LifeGrid = lwss;
    
    // LWSS returns to original pattern (but translated) after 4 generations
    for (let i = 0; i < 4; i++) {
      current = gameOfLife(current);
    }

    test('moves after 4 generations', () => {
      // The LWSS should have the same number of cells
      expect(Object.keys(current).length).toBe(Object.keys(lwss).length);
      // But should be in a different position
      expect(current).not.toStrictEqual(lwss);
    })

    test('is alive after multiple generations', () => {
      let pattern: LifeGrid = lwss;
      for (let i = 0; i < 10; i++) {
        pattern = gameOfLife(pattern);
      }
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })
  });
});
