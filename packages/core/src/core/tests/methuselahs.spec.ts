import { rPentomino, diehard, acorn } from "../../data/methuselahs";
import gameOfLife from "../game";
import { LifeGrid } from "../../interfaces";

describe('methuselahs', () => {
  describe('r-pentomino', () => {
    test('evolves and remains active for many generations', () => {
      let pattern: LifeGrid = rPentomino;
      
      // R-pentomino stabilizes after 1103 generations
      // Let's just verify it's active for first 100
      for (let i = 0; i < 100; i++) {
        pattern = gameOfLife(pattern);
      }
      
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })

    test('changes after first generation', () => {
      const gen1 = gameOfLife(rPentomino);
      expect(gen1).not.toStrictEqual(rPentomino);
    })
  });

  describe('diehard', () => {
    test('eventually dies out', () => {
      let pattern: LifeGrid = diehard;
      
      // Diehard dies out after 130 generations
      for (let i = 0; i < 130; i++) {
        pattern = gameOfLife(pattern);
      }
      
      // After 130 generations, it should be dead
      expect(Object.keys(pattern).length).toBe(0);
    })

    test('is alive before dying', () => {
      let pattern: LifeGrid = diehard;
      
      for (let i = 0; i < 50; i++) {
        pattern = gameOfLife(pattern);
      }
      
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })

    test('changes after first generation', () => {
      const gen1 = gameOfLife(diehard);
      expect(gen1).not.toStrictEqual(diehard);
    })
  });

  describe('acorn', () => {
    test('evolves and remains active for many generations', () => {
      let pattern: LifeGrid = acorn;
      
      // Acorn stabilizes after 5206 generations
      // Let's just verify it's active for first 100
      for (let i = 0; i < 100; i++) {
        pattern = gameOfLife(pattern);
      }
      
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })

    test('changes after first generation', () => {
      const gen1 = gameOfLife(acorn);
      expect(gen1).not.toStrictEqual(acorn);
    })

    test('grows significantly', () => {
      let pattern: LifeGrid = acorn;
      
      // After some generations, acorn should have grown
      for (let i = 0; i < 50; i++) {
        pattern = gameOfLife(pattern);
      }
      
      expect(Object.keys(pattern).length).toBeGreaterThan(Object.keys(acorn).length);
    })
  });
});
