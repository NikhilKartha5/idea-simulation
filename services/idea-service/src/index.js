import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import Redis from 'ioredis';
import amqplib from 'amqplib';
const { Pool } = pkg;

dotenv.config();
const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT
});

const redis = new Redis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
let channel;
(async () => {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('ideas', 'topic', { durable: true });
    console.log('Idea-service connected to RabbitMQ');
  } catch (e){ console.error('RabbitMQ connect failed', e.message); }
})();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/ideas', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, title, description, created_at FROM ideas ORDER BY created_at DESC LIMIT 50');
  res.json(rows);
});

app.get('/ideas/top', async (_req, res) => {
  // try cache first (sorted set idea:scores)
  const top = await redis.zrevrange('idea:scores', 0, 19, 'WITHSCORES');
  if (top.length) {
    // convert to [{id, score}]
    const items = [];
    for (let i=0; i<top.length; i+=2) items.push({ id: top[i], score: parseInt(top[i+1],10) });
    return res.json(items);
  }
  const { rows } = await pool.query("SELECT i.id, coalesce(sum(v.direction),0) as score FROM ideas i LEFT JOIN votes v ON v.idea_id=i.id GROUP BY i.id ORDER BY score DESC NULLS LAST LIMIT 20");
  res.json(rows);
});

app.get('/ideas/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  const { rows } = await pool.query('SELECT id, title, description FROM ideas WHERE search_vector @@ plainto_tsquery($1) ORDER BY ts_rank(search_vector, plainto_tsquery($1)) DESC LIMIT 20', [q]);
  res.json(rows);
});

app.post('/ideas', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'title and description required' });
  const { rows } = await pool.query('INSERT INTO ideas (title, description) VALUES ($1,$2) RETURNING id, title, description, created_at', [title, description]);
  const doc = rows[0];
  if (channel) channel.publish('ideas', 'idea.created', Buffer.from(JSON.stringify(doc)), { persistent: true });
  res.status(201).json(doc);
});

const port = process.env.SERVICE_PORT || 3001;
app.listen(port, () => console.log(`Idea service on ${port}`));
