import { beehive, block, tub, boat, loaf, pond } from "../../data/stillLifes";
import gameOfLife from "../game";

describe('still lifes', () => {
  describe('block', () => {
    const gen1 = gameOfLife(block);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(block)
    })

    test('gen2', () => {  
      expect(gen2).toStrictEqual(block)
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual(block)
    })
  });

  describe('beehive', () => {
    const gen1 = gameOfLife(beehive);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(beehive)
    })

    test('gen2', () => {
      expect(gen2).toStrictEqual(beehive)
    })

    test('gen3', () => {
      expect(gen3).toStrictEqual(beehive)
    })
  });

  describe('tub', () => {
    const gen1 = gameOfLife(tub);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(tub)
    })

    test('gen2', () => {
      expect(gen2).toStrictEqual(tub)
    })

    test('gen3', () => {
      expect(gen3).toStrictEqual(tub)
    })
  });

  describe('boat', () => {
    const gen1 = gameOfLife(boat);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(boat)
    })

    test('gen2', () => {
      expect(gen2).toStrictEqual(boat)
    })

    test('gen3', () => {
      expect(gen3).toStrictEqual(boat)
    })
  });

  describe('loaf', () => {
    const gen1 = gameOfLife(loaf);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(loaf)
    })

    test('gen2', () => {
      expect(gen2).toStrictEqual(loaf)
    })

    test('gen3', () => {
      expect(gen3).toStrictEqual(loaf)
    })
  });

  describe('pond', () => {
    const gen1 = gameOfLife(pond);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual(pond)
    })

    test('gen2', () => {
      expect(gen2).toStrictEqual(pond)
    })

    test('gen3', () => {
      expect(gen3).toStrictEqual(pond)
    })
  });
})