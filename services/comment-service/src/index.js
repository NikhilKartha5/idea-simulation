import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
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
let channel;
(async () => {
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange('ideas', 'topic', { durable: true });
    console.log('Comment-service connected to RabbitMQ');
  } catch (e){ console.error('RabbitMQ connect failed', e.message); }
})();

app.post('/comments', async (req, res) => {
  const { idea_id, content } = req.body;
  if (!idea_id || !content) return res.status(400).json({ error: 'idea_id and content required' });
  const { rows } = await pool.query('INSERT INTO comments (idea_id, content) VALUES ($1,$2) RETURNING id, idea_id, content, created_at', [idea_id, content]);
  const doc = rows[0];
  if (channel) channel.publish('ideas', 'comment.created', Buffer.from(JSON.stringify(doc)), { persistent: true });
  res.status(201).json(doc);
});

const port = process.env.SERVICE_PORT || 3003;
app.listen(port, () => console.log(`Comment service on ${port}`));
