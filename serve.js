import { createServer } from 'vite';
import { startApiServer } from './server/index.js';

await startApiServer(3001);

const server = await createServer({
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: { '/api': 'http://localhost:3001' }
  }
});

await server.listen();
console.log('CivicPulse GIS Server listening at http://localhost:5173');
