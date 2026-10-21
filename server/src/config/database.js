import mysql from 'mysql2/promise';
import { env } from './env.js';

const pool = mysql.createPool({
  ...env.mysql,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

export default pool;
