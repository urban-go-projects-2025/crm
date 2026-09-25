import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function fix() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log('Connected to DB');
    await connection.query('ALTER TABLE attendance_logs MODIFY COLUMN worker_id VARCHAR(50)');
    console.log('Successfully altered attendance_logs.worker_id to VARCHAR(50)');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) await connection.end();
  }
}

fix();
