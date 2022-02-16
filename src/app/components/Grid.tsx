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
  const gridJSON = JSON.stringify(gameStatus, null, 2);

  return (
    <div className="Grid">
      <GridSquares grid={gameStatus} onMouseOver={onMouseOver} gridSize={30} cellSize={15} />
    </div>
  );
}

export default Grid;