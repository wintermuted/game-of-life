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

  const gridJSON = JSON.stringify(game.getStatus && game.getStatus());

  return (
    <div className="Grid">
      { gridJSON }
      <GridSquares game={game} onMouseOver={onMouseOver} />
    </div>
  );
}

export default Grid;