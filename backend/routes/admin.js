import express from 'express';
import { pool } from '../db.js';
import { adminOnly, authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/accounts', authRequired, adminOnly, async (_req, res) => {
  const { rows } = await pool.query('SELECT id, username, is_admin, is_blocked, created_at FROM accounts ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/accounts/:id/block', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { block } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const { rows } = await pool.query('SELECT username, is_admin FROM accounts WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  if (rows[0].username === 'admin') return res.status(400).json({ error: 'Cannot block main admin' });
  await pool.query('UPDATE accounts SET is_blocked=$1 WHERE id=$2', [!!block, id]);
  res.json({ ok: true });
});

router.post('/accounts/:id/admin', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { makeAdmin } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const { rows } = await pool.query('SELECT username FROM accounts WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  if (rows[0].username === 'admin') return res.status(400).json({ error: 'Cannot change super admin' });
  await pool.query('UPDATE accounts SET is_admin=$1 WHERE id=$2', [!!makeAdmin, id]);
  res.json({ ok: true });
});

router.delete('/accounts/:id', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const { rows } = await pool.query('SELECT username, is_admin FROM accounts WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  if (rows[0].username === 'admin') return res.status(400).json({ error: 'Cannot delete main admin' });
  await pool.query('DELETE FROM accounts WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;

