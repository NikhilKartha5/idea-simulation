import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import pino from 'pino';
import { rateLimiter } from './rateLimit.js';
import { ideasRouter } from './routes/ideas.js';
import { votesRouter } from './routes/votes.js';
import { commentsRouter } from './routes/comments.js';
import axios from 'axios';
import { requireAuth } from './authMiddleware.js';

dotenv.config();

const app = express();
const log = pino({ transport: { target: 'pino-pretty' } });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/register', async (req, res) => {
  const { data } = await axios.post('http://auth-service:3004/auth/register', req.body);
  res.status(201).json(data);
});
app.post('/api/auth/login', async (req, res) => {
  const { data } = await axios.post('http://auth-service:3004/auth/login', req.body);
  res.json(data);
});
app.use('/api/ideas', requireAuth, ideasRouter);
app.use('/api/votes', requireAuth, votesRouter);
app.use('/api/comments', requireAuth, commentsRouter);

app.use((err, _req, res, _next) => {
  log.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => log.info(`Gateway listening on ${port}`));
