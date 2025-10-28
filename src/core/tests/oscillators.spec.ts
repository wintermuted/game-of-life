import { beacon, beaconA2, blinker2, toad, pulsar, pentadecathlon } from "../../data/oscillators";
import gameOfLife from "../game";
import { LifeGrid } from "../../interfaces";

describe('oscillators', () => {
  describe('blinker', () => {
    const gen1 = gameOfLife(blinker2);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);
    const gen4 = gameOfLife(gen3);


    test('gen1', () => {
      expect(gen1).toStrictEqual({
        "1,0": true,
        "1,1": true,
        "1,2": true,
      })
    })

    test('gen2', () => {  
      expect(gen2).toStrictEqual(blinker2)
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual({
        "1,0": true,
        "1,1": true,
        "1,2": true,
      })
    })

    test('gen4', () => {  
      expect(gen4).toStrictEqual(blinker2)
    })
  });

  describe('beacon', () => {
    const gen1 = gameOfLife(beacon);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);
    const gen4 = gameOfLife(gen3);


    test('gen1', () => {
      expect(gen1).toStrictEqual(beaconA2)
    })

    test('gen2', () => {  
      expect(gen2).toStrictEqual(beacon)
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual(beaconA2)
    })

    test('gen4', () => {  
      expect(gen4).toStrictEqual(beacon)
    })
  });

  describe('toad', () => {
    const gen1 = gameOfLife(toad);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);

    test('gen1', () => {
      expect(gen1).toStrictEqual({
        "0,0": true,
        "0,1": true,
        "1,2": true,
        "2,-1": true,
        "3,0": true,
        "3,1": true
      })
    })

    test('gen2', () => {  
      expect(gen2).toStrictEqual(toad)
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual({
        "0,0": true,
        "0,1": true,
        "1,2": true,
        "2,-1": true,
        "3,0": true,
        "3,1": true
      })
    })
  });

  describe('pulsar', () => {
    const gen1 = gameOfLife(pulsar);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);
    const gen4 = gameOfLife(gen3);

    test('oscillates with period 3 - gen3 returns to original', () => {
      expect(gen3).toStrictEqual(pulsar)
    })

    test('gen1 is different from original', () => {
      expect(gen1).not.toStrictEqual(pulsar)
    })

    test('gen2 is different from original', () => {
      expect(gen2).not.toStrictEqual(pulsar)
    })

    test('gen4 returns to gen1', () => {
      expect(gen4).toStrictEqual(gen1)
    })
  });

  describe('pentadecathlon', () => {
    const gen1 = gameOfLife(pentadecathlon);
    
    test('oscillates - gen1 is different from original', () => {
      expect(gen1).not.toStrictEqual(pentadecathlon)
    })

    test('remains alive after multiple generations', () => {
      let pattern: LifeGrid = pentadecathlon;
      for (let i = 0; i < 20; i++) {
        pattern = gameOfLife(pattern);
      }
      // Should still be alive
      expect(Object.keys(pattern).length).toBeGreaterThan(0);
    })
  });
})