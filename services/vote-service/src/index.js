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
  const { idea_id, direction, user_id } = req.body; // direction: 1 or -1
  if (!idea_id || ![1,-1].includes(direction) || !user_id) return res.status(400).json({ error: 'idea_id, user_id and direction (1 or -1) required'});
  try {
    // Ensure user exists (anonymous mode may generate synthetic UUID not in users table)
    await pool.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [user_id, user_id+"@anon.local", '']);
    // Insert or update existing vote; if same direction, treat as no-op.
    const existing = await pool.query('SELECT id, direction FROM votes WHERE idea_id=$1 AND user_id=$2', [idea_id, user_id]);
    if (!existing.rows.length){
      await pool.query('INSERT INTO votes (idea_id, user_id, direction) VALUES ($1,$2,$3)', [idea_id, user_id, direction]);
    } else if (existing.rows[0].direction !== direction){
      await pool.query('UPDATE votes SET direction=$2 WHERE id=$1', [existing.rows[0].id, direction]);
    } // else same direction -> ignore
  } catch (e){
    if (e.code === '23505') { /* unique violation race */ }
    else {
      console.error('Vote store error', e.message, e.code);
      return res.status(500).json({ error: 'vote store failed' });
    }
  }
  const { rows } = await pool.query('SELECT idea_id, COALESCE(SUM(direction),0) as score FROM votes WHERE idea_id=$1 GROUP BY idea_id', [idea_id]);
  const score = parseInt(rows[0]?.score||0,10);
  await redis.zadd('idea:scores', score, idea_id);
  if (channel) channel.publish('ideas', 'vote.cast', Buffer.from(JSON.stringify({ idea_id, score, direction, user_id })), { persistent: true });
  res.status(201).json({ idea_id, score });
});

const port = process.env.SERVICE_PORT || 3002;
app.listen(port, () => console.log(`Vote service on ${port}`));
