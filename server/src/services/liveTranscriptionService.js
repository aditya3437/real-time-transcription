import { WebSocket, WebSocketServer } from 'ws';
import { env } from '../config/env.js';

export function attachLiveTranscription(server) {
  const liveSockets = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname !== '/api/live') return socket.destroy();
    if (req.headers.origin && !env.clientOrigins.includes(req.headers.origin)) return socket.destroy();

    liveSockets.handleUpgrade(req, socket, head, client => {
      liveSockets.emit('connection', client);
    });
  });

  liveSockets.on('connection', client => {
    const upstream = new WebSocket(env.whisperWsUrl, { maxPayload: 1024 * 1024 });
    let closed = false;
    const pendingFrames = [];

    const closeBoth = (code = 1000, reason = '') => {
      if (closed) return;
      closed = true;
      if (client.readyState === WebSocket.OPEN) client.close(code, reason);
      if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(upstream.readyState)) {
        upstream.close(code, reason);
      }
    };

    upstream.on('open', () => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'ready' }));
      }
      while (pendingFrames.length && upstream.readyState === WebSocket.OPEN) {
        upstream.send(pendingFrames.shift(), { binary: true });
      }
    });

    client.on('message', (data, isBinary) => {
      if (!isBinary) return;
      if (upstream.readyState === WebSocket.OPEN) {
        upstream.send(data, { binary: true });
      } else if (upstream.readyState === WebSocket.CONNECTING && pendingFrames.length < 128) {
        pendingFrames.push(Buffer.from(data));
      }
    });

    upstream.on('message', (data, isBinary) => {
      if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
    });

    upstream.on('error', () => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'error', message: 'Could not connect to the local Whisper service.' }));
      }
      closeBoth(1011, 'Speech service unavailable');
    });

    client.on('close', () => closeBoth());
    upstream.on('close', () => { if (!closed) closeBoth(); });
  });
}
