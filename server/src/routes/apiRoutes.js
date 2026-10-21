import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import transcriptionRoutes from './transcriptionRoutes.js';

const router = Router();

router.get('/health', getHealth);
router.use('/transcriptions', transcriptionRoutes);

export default router;
