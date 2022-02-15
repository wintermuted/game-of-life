import Game from "../../class/Game";
import './Grid.scss';
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
  const gridJSON = JSON.stringify(gameStatus);

  return (
    <div className="Grid">
      { gridJSON }
      <GridSquares grid={gameStatus} onMouseOver={onMouseOver} />
    </div>
  );
}

export default Grid;