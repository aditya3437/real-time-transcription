import pool from '../config/database.js';

const fields = `
  id,
  title,
  content,
  language,
  duration_seconds AS durationSeconds,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

export async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${fields} FROM transcriptions ORDER BY created_at DESC`
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${fields} FROM transcriptions WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function create({ title, content, language, durationSeconds }) {
  const [result] = await pool.execute(
    `INSERT INTO transcriptions (title, content, language, duration_seconds)
     VALUES (?, ?, ?, ?)`,
    [title, content, language, durationSeconds]
  );
  return findById(result.insertId);
}

export async function update(id, { title, content }) {
  await pool.execute(
    'UPDATE transcriptions SET title = ?, content = ? WHERE id = ?',
    [title, content, id]
  );
  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM transcriptions WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
