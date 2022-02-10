import gameOfLife from "../../game";

describe('oscillators', () => {
  describe('blinker', () => {
    const base = {
      "0,1": true,
      "1,1": true,
      "2,1": true,
    };

    const gen1 = gameOfLife(base);
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
      expect(gen2).toStrictEqual({
        "0,1": true,
        "1,1": true,
        "2,1": true,
      })
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual({
        "1,0": true,
        "1,1": true,
        "1,2": true,
      })
    })

    test('gen4', () => {  
      expect(gen4).toStrictEqual({
        "0,1": true,
        "1,1": true,
        "2,1": true,
      })
    })
  });

  describe('beacon', () => {
    const base = {
      "0,2": true,
      "0,3": true,
      "1,2": true,
      "1,3": true,

      "2,0": true,
      "3,0": true,
      "2,1": true,
      "3,1": true
    };

    const gen1 = gameOfLife(base);
    const gen2 = gameOfLife(gen1);
    const gen3 = gameOfLife(gen2);
    const gen4 = gameOfLife(gen3);


    test('gen1', () => {
      expect(gen1).toStrictEqual({
        "0,2": true,
        "0,3": true,
        "1,3": true,
        "2,0": true,
        "3,0": true,
        "3,1": true
      })
    })

    test('gen2', () => {  
      expect(gen2).toStrictEqual({
        "0,2": true,
        "0,3": true,
        "1,2": true,
        "1,3": true,
  
        "2,0": true,
        "3,0": true,
        "2,1": true,
        "3,1": true
      })
    })

    test('gen3', () => {  
      expect(gen3).toStrictEqual({
        "0,2": true,
        "0,3": true,
        "1,3": true,
        "2,0": true,
        "3,0": true,
        "3,1": true
      })
    })

    test('gen4', () => {  
      expect(gen4).toStrictEqual({
        "0,2": true,
        "0,3": true,
        "1,2": true,
        "1,3": true,
  
        "2,0": true,
        "3,0": true,
        "2,1": true,
        "3,1": true
      })
    })
  });
})