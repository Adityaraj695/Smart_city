import { createServer } from 'vite';

const server = await createServer({
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});

await server.listen();
console.log('CivicPulse GIS Server listening at http://localhost:5173');
