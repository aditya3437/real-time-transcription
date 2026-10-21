import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRoutes);
  app.use(errorHandler);

  return app;
}
