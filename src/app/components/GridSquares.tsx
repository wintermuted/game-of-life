import { add, forEach, range, subtract, toNumber } from 'lodash';
import { ReactElement } from "react";
import Game from '../../class/Game';
import { LifeGrid } from '../../interfaces';

function handleXCoord(x: string) {
  const xNumber = toNumber(x);

  if (xNumber >= 0) {
    return xNumber + 15;
  } else if (xNumber < 0) {
    return 15 + xNumber;
  } else {
    return xNumber;
  }
}

function handleYCoord(y: string) {
  const yNumber = toNumber(y);

  return 14 - yNumber;
}

function translateGrid (grid: LifeGrid): LifeGrid {
  const translatedGrid: LifeGrid = {} as LifeGrid;

  forEach(grid, (entry, key) => {
      const [x, y] = key.split(",")
      const xOffset = handleXCoord(x);
      const yOffset = handleYCoord(y);
      const newKey = `${xOffset},${yOffset}`;
      translatedGrid[newKey] = true;
  });

  return translatedGrid;
}

const gridWidth = 30;
const gridRange = range(gridWidth);
// const grid: LifeGrid = {
//   "-1,0": true,
//   "-1,-1": true,
//   "-2,-2": true,
//   "-3,-3": true,
//   "-4,-4": true,
//   "-10,0": true,
//   "0,0": true,
//   "0,1": true,
//   "0,2": true,
//   "1,1": true,
//   "2,2": true,
//   "3,3": true,
//   "5,5": true,
//   "7,7": true,
//   "8,8": true,
//   "10,5": true,
//   "10,2": true,
//   "10,1": true,
//   "10,0": true
// };

// console.log('translatedGrid', translatedGrid)

interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
}

function GridSquares({ onMouseOver, game }: Props) {
  const innerDom: ReactElement[] = [];

  const translatedGrid = translateGrid(game && game.getStatus && game.getStatus()); 

  forEach(gridRange, (columnVal, columnIndex) => {
    forEach(gridRange, (rowVal, rowIndex) => {
      const key = 'panel_key_' + rowIndex + '_' + columnIndex;
      const x = rowIndex + (15 * rowIndex);
      const y = columnIndex + (15 * columnIndex);

      const style = {
        "border": "1px solid #000"
      };

      const alive = translatedGrid[`${rowIndex},${columnIndex}`];
      const nwQuad = columnIndex === 14 && rowIndex === 14;
      const swQuad = columnIndex === 15 && rowIndex === 14;
      const neQuad = columnIndex === 14 && rowIndex === 15;
      const seQuad = columnIndex === 15 && rowIndex === 15;
      const centerCells = nwQuad || swQuad || neQuad || seQuad;
      const defaultCells = centerCells ? "#888" : "#CCC";
      const isAlive = alive;
      const color = isAlive ? "green" :defaultCells;

      const rect = (
        <rect
          key={key}
          className={key}
          x={x}
          y={y}
          width={15}
          height={15}
          fill={color}
          style={style}
          stroke="#777"
          strokeWidth="1"
          onMouseOver={onMouseOver}
        />
      );
  
      innerDom.push(rect);
    });
  });

  return (
    <div className="GridSquares">
      <svg>
        {innerDom}
      </svg>
    </div>
  );
}

export default GridSquares;