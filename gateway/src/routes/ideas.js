import { Router } from 'express';
import axios from 'axios';
import { requireAuth } from '../authMiddleware.js';

export const ideasRouter = Router();
const IDEA_BASE = 'http://idea-service:3001';

ideasRouter.get('/', async (_req, res) => {
  const { data } = await axios.get(`${IDEA_BASE}/ideas`);
  res.json(data);
});
ideasRouter.get('/top', async (_req, res) => {
  const { data } = await axios.get(`${IDEA_BASE}/ideas/top`);
  res.json(data);
});
ideasRouter.get('/search', async (req, res) => {
  const { q } = req.query;
  const { data } = await axios.get(`${IDEA_BASE}/ideas/search`, { params: { q } });
  res.json(data);
});
ideasRouter.post('/', requireAuth, async (req, res) => {
  const { data } = await axios.post(`${IDEA_BASE}/ideas`, req.body);
  res.status(201).json(data);
});
