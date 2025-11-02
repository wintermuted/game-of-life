import { forEach, range } from 'lodash';
import { ReactElement } from "react";
import { LifeGrid } from '@game-of-life/core';
import { getCellFillColor, translateGrid } from '../util/coordinate';

function getCoordinate(rowIndex: number, cellSize: number) {
  return rowIndex + (cellSize * rowIndex);
}

interface Props {
  grid: LifeGrid;
  gridSize: number; // should only be even numbers
  cellSize: number;
  onMouseOver: (e: React.MouseEvent) => void;
}

function GridSquares({ onMouseOver, grid, gridSize, cellSize }: Props) {
  const gridRange = range(gridSize);
  const innerDom: ReactElement[] = [];
  const translatedGrid = translateGrid(grid, gridSize); 

  forEach(gridRange, (_columnVal, columnIndex) => {
    forEach(gridRange, (_rowVal, rowIndex) => {
      const key = `panel_key_${rowIndex}_${columnIndex}`;
      const x = getCoordinate(rowIndex, cellSize)
      const y = getCoordinate(columnIndex, cellSize);
      const alive = translatedGrid[`${rowIndex},${columnIndex}`];
      const color = getCellFillColor(alive, rowIndex, columnIndex, gridSize);

      const rect = (
        <rect
          key={key}
          className={key}
          x={x}
          y={y}
          width={cellSize}
          height={cellSize}
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

