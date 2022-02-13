export function getGenerationSpeed(speed: number): number {
  switch (speed) {
    case 1:
      return 1000;
    case 2:
      return 500;
    case 3:
      return 250;
    case 4:
      return 100;
    case 5:
      return 25;
    case 6:
      return 20;
    case 7: 
      return 15;
    case 8:
      return 10;
    case 9: 
      return 5;
    case 10:
      return 0;
    default:
      return 500;
  }
}