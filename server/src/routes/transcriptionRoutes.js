import { Router } from 'express';
import {
  createTranscription,
  deleteTranscription,
  listTranscriptions,
  updateTranscription
} from '../controllers/transcriptionController.js';

const router = Router();

router.route('/')
  .get(listTranscriptions)
  .post(createTranscription);

router.route('/:id')
  .put(updateTranscription)
  .delete(deleteTranscription);

export default router;
