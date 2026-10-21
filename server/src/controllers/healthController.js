import { checkDatabase } from '../models/healthModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  try {
    await checkDatabase();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', {
      message: error instanceof Error ? error.message : String(error),
      code: error?.code
    });
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
