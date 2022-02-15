import { beacon, beaconA2, blinker2 } from "../../data/oscillators";
import gameOfLife from "../game";

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
})