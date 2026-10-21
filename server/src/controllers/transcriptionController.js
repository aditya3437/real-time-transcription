import * as Transcription from '../models/transcriptionModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const cleanText = (value, max = 100_000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const parseId = value => /^\d+$/.test(String(value)) ? Number(value) : 0;

export const listTranscriptions = asyncHandler(async (_req, res) => {
  res.json(await Transcription.findAll());
});

export const createTranscription = asyncHandler(async (req, res) => {
  const content = cleanText(req.body?.content);
  if (!content) return res.status(400).json({ error: 'Transcript text is required.' });

  const title = cleanText(req.body?.title, 160) || content.slice(0, 56) || 'Untitled transcription';
  const language = cleanText(req.body?.language, 80) || 'Auto detect';
  const durationSeconds = Math.max(0, Math.min(86_400, Math.floor(Number(req.body?.durationSeconds) || 0)));
  const transcription = await Transcription.create({ title, content, language, durationSeconds });

  res.status(201).json(transcription);
});

export const updateTranscription = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid transcription id.' });

  const title = cleanText(req.body?.title, 160);
  const content = cleanText(req.body?.content);
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and transcript text are required.' });
  }

  const transcription = await Transcription.update(id, { title, content });
  if (!transcription) return res.status(404).json({ error: 'Transcription not found.' });

  res.json(transcription);
});

export const deleteTranscription = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid transcription id.' });

  const deleted = await Transcription.remove(id);
  if (!deleted) return res.status(404).json({ error: 'Transcription not found.' });

  res.status(204).end();
});
