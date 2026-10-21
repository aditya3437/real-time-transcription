import { createServer } from 'node:http';
import { env } from './config/env.js';
import { createApp } from './app.js';
import { attachLiveTranscription } from './services/liveTranscriptionService.js';

export function startServer() {
  const server = createServer(createApp());
  attachLiveTranscription(server);
  server.listen(env.port, () => {
    console.log(`Speech to Text API listening on http://localhost:${env.port}`);
  });
  return server;
}
