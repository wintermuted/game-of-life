import gameOfLife from "../game";

describe('patterns', () => {
  describe('still lifes', () => {
    describe('block', () => {
      const base = {
        "0,0": true,
        "0,1": true,
        "1,0": true,
        "1,1": true
      };
  
      const gen1 = gameOfLife(base);
      const gen2 = gameOfLife(gen1);
      const gen3 = gameOfLife(gen2);
  
      test('gen1', () => {
        expect(gen1).toStrictEqual({
          "0,0": true,
          "0,1": true,
          "1,0": true,
          "1,1": true,
        })
      })
  
      test('gen2', () => {  
        expect(gen2).toStrictEqual({
          "0,0": true,
          "0,1": true,
          "1,0": true,
          "1,1": true,
        })
      })
  
      test('gen3', () => {  
        expect(gen3).toStrictEqual({
          "0,0": true,
          "0,1": true,
          "1,0": true,
          "1,1": true,
        })
      })
    });
  })
})