import { createGameOfLifeServer } from './http';
import { InMemoryGameOfLifeRepository } from './inMemoryRepository';

const repository = new InMemoryGameOfLifeRepository();
const server = createGameOfLifeServer(repository);
const port = Number(process.env.PORT ?? '3333');

server.listen(port, () => {
  console.log(`Game of Life API listening on http://localhost:${port}`);
});