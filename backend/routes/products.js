import express from 'express';
import { pool } from '../db.js';
import { adminOnly, authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const { name, price, platform } = req.body || {};
  if (!name || Number.isNaN(Number(price))) return res.status(400).json({ error: 'Name and price required' });
  const p = platform || 'instagram';
  const { rows } = await pool.query(
    'INSERT INTO products (name, price, platform) VALUES ($1,$2,$3) RETURNING *',
    [name, Number(price), p]
  );
  res.status(201).json(rows[0]);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  await pool.query('DELETE FROM products WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;

