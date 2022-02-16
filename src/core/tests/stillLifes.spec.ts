import { beehive, block, tub } from "../../data/stillLifes";
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
  })
})