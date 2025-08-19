import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email, created_at', [email, hash]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'email exists' });
    console.error(e); res.status(500).json({ error: 'internal' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '1h' });
  res.json({ token });
});

const port = process.env.SERVICE_PORT || 3004;
app.listen(port, () => console.log(`Auth service on ${port}`));
