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
    console.log('Vote-service connected to RabbitMQ');
  } catch (e){ console.error('RabbitMQ connect failed', e.message); }
})();

app.post('/votes', async (req, res) => {
  const { idea_id, direction } = req.body; // direction: 1 or -1
  if (!idea_id || ![1,-1].includes(direction)) return res.status(400).json({ error: 'idea_id and direction (1 or -1) required'});
  await pool.query('INSERT INTO votes (idea_id, direction) VALUES ($1,$2)', [idea_id, direction]);
  const { rows } = await pool.query('SELECT idea_id, COALESCE(SUM(direction),0) as score FROM votes WHERE idea_id=$1 GROUP BY idea_id', [idea_id]);
  const score = parseInt(rows[0].score,10);
  await redis.zadd('idea:scores', score, idea_id);
  if (channel) channel.publish('ideas', 'vote.cast', Buffer.from(JSON.stringify({ idea_id, score, direction })), { persistent: true });
  res.status(201).json({ idea_id, score });
});

const port = process.env.SERVICE_PORT || 3002;
app.listen(port, () => console.log(`Vote service on ${port}`));
