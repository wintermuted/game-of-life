import Game from "../../class/Game";
import '../styles/Grid.scss';
import CanvasGrid from './CanvasGrid';

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
      <CanvasGrid 
        grid={gameStatus} 
        onMouseOver={onMouseOver} 
        gridSize={100} 
        cellSize={7} 
      />
    </div>
  );
}

export default Grid;