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
import jwt from 'jsonwebtoken';
import { requireAuth } from './authMiddleware.js';
// Auth removed for now – open endpoints

dotenv.config();

const app = express();
const log = pino({ transport: { target: 'pino-pretty' } });

app.use(helmet());
app.use(cors());
app.use(express.json());

// Attach user if bearer token present (non-blocking)
app.use((req,_res,next)=>{
  const header = req.headers.authorization || '';
  if(header.startsWith('Bearer ')){
    const token = header.slice(7);
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch(_e) {}
  }
  next();
});
app.use(morgan('dev'));
app.use(rateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Auth proxy routes -> auth-service (open)
const AUTH_BASE = 'http://auth-service:3004/auth';
app.post('/api/auth/register', async (req,res)=>{
  try {
    const { data } = await axios.post(`${AUTH_BASE}/register`, req.body);
    res.status(201).json(data);
  } catch(e){
    const status = e.response?.status || 500;
    res.status(status).json(e.response?.data || { error:'register failed' });
  }
});
app.post('/api/auth/login', async (req,res)=>{
  try {
    const { data } = await axios.post(`${AUTH_BASE}/login`, req.body);
    res.json(data);
  } catch(e){
    const status = e.response?.status || 500;
    res.status(status).json(e.response?.data || { error:'login failed' });
  }
});
// Public read routes; specific POST endpoints enforce auth inside their routers.
app.use('/api/ideas', ideasRouter);
app.use('/api/votes', votesRouter);
app.use('/api/comments', commentsRouter);

app.use((err, _req, res, _next) => {
  log.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => log.info(`Gateway listening on ${port}`));
