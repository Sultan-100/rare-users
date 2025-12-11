import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_PATH || '.env' });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      is_blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(12,2) NOT NULL DEFAULT 0,
      platform TEXT NOT NULL DEFAULT 'instagram',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(account_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      unread BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Ensure a default admin
  const { rows } = await pool.query('SELECT 1 FROM accounts WHERE is_admin = TRUE LIMIT 1');
  if (rows.length === 0) {
    await pool.query(
      `INSERT INTO accounts (username, password_hash, is_admin, is_blocked)
       VALUES ($1, $2, TRUE, FALSE)`,
      [
        'admin',
        '$2a$10$6OImTWXrqSZxDSdFn5uHsO5F2EeG7lOMgKgJo0vvV.Wr8qnojO5T.', // "admin123" pre-hashed
      ]
    );
  }
}

