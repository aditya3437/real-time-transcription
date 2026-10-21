import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || env.clientOrigins.includes(origin));
    }
  }));
  app.use(express.json({ limit: '2mb' }));
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'speech-to-text-api' });
  });
  app.use('/api', apiRoutes);
  app.use(errorHandler);

  return app;
}
