import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: '65.1.221.39',
  port: 3306,
  user: 'omw_user',
  password: 'YOUR_PASSWORD',
  database: 'omw_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(
  'DATABASE CONFIG:',
  pool.pool.config.connectionConfig.host,
  pool.pool.config.connectionConfig.port
);

export default pool;
