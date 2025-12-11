import express from 'express';
import { pool } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authRequired, async (req, res) => {
  const { rows } = await pool.query('SELECT id, username, is_admin, is_blocked, created_at FROM accounts WHERE id=$1', [req.user.id]);
  res.json(rows[0]);
});

export default router;

