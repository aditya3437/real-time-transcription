import pool from '../config/database.js';

export async function checkDatabase() {
  await pool.query('SELECT 1');
}
