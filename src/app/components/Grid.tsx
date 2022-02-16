import Game from "../../class/Game";
import '../styles/Grid.scss';
import GridSquares from './GridSquares';

interface Props {
  game: Game;
  onMouseOver: (e: React.MouseEvent) => void;
}

function Grid({ game, onMouseOver }: Props) {
  if (!game) {
    return null;
  }

  const gameStatus = game.getStatus ? game.getStatus(): {};

  return (
    <div className="Grid">
      <GridSquares 
        grid={gameStatus} 
        onMouseOver={onMouseOver} 
        gridSize={100} 
        cellSize={7} 
      />
    </div>
  );
}

export default Grid;