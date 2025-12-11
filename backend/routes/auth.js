import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

function signTokens(user) {
  const access = jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
  const refresh = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' }
  );
  return { access, refresh };
}

router.post('/signup', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (!/^[A-Za-z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Invalid username' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password too short' });
  const existing = await pool.query('SELECT id FROM accounts WHERE LOWER(username)=LOWER($1)', [username]);
  if (existing.rows.length) return res.status(409).json({ error: 'Username taken' });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO accounts (username, password_hash) VALUES ($1,$2) RETURNING id, username, is_admin',
    [username, hash]
  );
  const tokens = signTokens(rows[0]);
  res.json({ user: rows[0], tokens });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const { rows } = await pool.query('SELECT * FROM accounts WHERE username=$1', [username]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.is_blocked) return res.status(403).json({ error: 'Account is blocked' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const tokens = signTokens(user);
  res.json({ user: { id: user.id, username: user.username, is_admin: user.is_admin }, tokens });
});

router.post('/refresh', (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const decoded = jwt.verify(refresh, process.env.REFRESH_SECRET);
    res.json({ access: jwt.sign(
      { id: decoded.id, username: decoded.username, is_admin: decoded.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    )});
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;

