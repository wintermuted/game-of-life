import Game from "../../class/Grid";

interface Props {
  game: Game;
}

function Grid({ game }: Props) {
  if (!game) {
    return null;
  }

  const gameJSON = game.getStatus && game.getStatus();
  const gridJSON = JSON.stringify(gameJSON);

  return (
    <div className="Grid">
      { gridJSON }
    </div>
  );
}

export default Grid;