import express from 'express';
import { pool } from '../db.js';
import { adminOnly, authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, adminOnly, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT f.id, f.message, f.unread, f.created_at, a.username AS by
     FROM feedback f
     LEFT JOIN accounts a ON a.id = f.account_id
     ORDER BY f.created_at DESC`
  );
  res.json(rows);
});

router.post('/', authRequired, async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });
  const { rows } = await pool.query(
    'INSERT INTO feedback (account_id, message) VALUES ($1,$2) RETURNING *',
    [req.user.id, message]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id/mark', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { unread } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  await pool.query('UPDATE feedback SET unread=$1 WHERE id=$2', [!!unread, id]);
  res.json({ ok: true });
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  await pool.query('DELETE FROM feedback WHERE id=$1', [id]);
  res.json({ ok: true });
});

export default router;

