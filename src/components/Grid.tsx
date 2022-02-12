import Game from "../game/Grid";

interface Props {
  game: Game;
}

function Grid({ game }: Props) {
  const gameJSON = game.getStatus && game.getStatus();
  const gridJSON = JSON.stringify(gameJSON);

  return (
    <div className="Grid">
      { gridJSON }
    </div>
  );
}

export default Grid;