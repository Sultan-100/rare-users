import express from 'express';
import { pool } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT w.id, p.id as product_id, p.name, p.price, p.platform
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.account_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', authRequired, async (req, res) => {
  const { product_id } = req.body || {};
  if (!product_id) return res.status(400).json({ error: 'product_id required' });
  await pool.query(
    'INSERT INTO wishlist_items (account_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [req.user.id, product_id]
  );
  res.status(201).json({ ok: true });
});

router.delete('/:productId', authRequired, async (req, res) => {
  const pid = Number(req.params.productId);
  if (!pid) return res.status(400).json({ error: 'Invalid product id' });
  await pool.query('DELETE FROM wishlist_items WHERE account_id=$1 AND product_id=$2', [req.user.id, pid]);
  res.json({ ok: true });
});

export default router;

