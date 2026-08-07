import { createApp, createDefaultStores } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const app = createApp(createDefaultStores());

app.listen(PORT, () => {
  console.log(`[api] Game of Life API server listening on port ${PORT}`);
});
