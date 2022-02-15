import { forEach, range } from 'lodash';
import { ReactElement } from "react";
import { LifeGrid } from '../../interfaces';
import { getCellFillColor, translateGrid } from '../util/coordinate';

function getCoordinate(rowIndex: number) {
  return rowIndex + (15 * rowIndex);
}

interface Props {
  grid: LifeGrid;
  onMouseOver: (e: React.MouseEvent) => void;
}

function GridSquares({ onMouseOver, grid }: Props) {
  const gridWidth = 30;
  const gridRange = range(gridWidth);
  const innerDom: ReactElement[] = [];
  const translatedGrid = translateGrid(grid); 

  forEach(gridRange, (columnVal, columnIndex) => {
    forEach(gridRange, (rowVal, rowIndex) => {
      const key = `panel_key_${rowIndex}_${columnIndex}`;
      const x = getCoordinate(rowIndex)
      const y = getCoordinate(columnIndex);
      const alive = translatedGrid[`${rowIndex},${columnIndex}`];
      const color = getCellFillColor(alive, rowIndex, columnIndex);

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

