import { forEach, range } from 'lodash';
import { ReactElement } from "react";
import Game from '../../class/Game';
import { LifeGrid } from '../../interfaces';
import { getCenterPointSquares, translateGrid } from '../util/coordinate';

function getCellFillColor(translatedGrid: LifeGrid, rowIndex: number, columnIndex: number) {
  const alive = translatedGrid[`${rowIndex},${columnIndex}`];
  const { nwQuad, swQuad, neQuad, seQuad } = getCenterPointSquares(columnIndex, rowIndex);
  const centerCells = nwQuad || swQuad || neQuad || seQuad;
  const defaultCells = centerCells ? "#888" : "#CCC";
  const isAlive = alive;
  const color = isAlive ? "green" : defaultCells;
  return color;
}
interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
}

function GridSquares({ onMouseOver, game }: Props) {
  const gridWidth = 30;
  const gridRange = range(gridWidth);
  const innerDom: ReactElement[] = [];
  const translatedGrid = translateGrid(game && game.getStatus && game.getStatus()); 

  forEach(gridRange, (columnVal, columnIndex) => {
    forEach(gridRange, (rowVal, rowIndex) => {
      const key = `panel_key_${rowIndex}_${columnIndex}`;
      const x = rowIndex + (15 * rowIndex)
      const y = columnIndex + (15 * columnIndex);

      const color = getCellFillColor(translatedGrid, rowIndex, columnIndex);

      const rect = (
        <rect
          key={key}
          className={key}
          x={x}
          y={y}
          width={15}
          height={15}
          fill={color}
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
