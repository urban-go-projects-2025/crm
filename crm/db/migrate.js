import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  console.log('🔄 Starting OMW CRM Database Migration...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'omw_db',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME || 'omw_db');

    const sqlFilePath = path.join(__dirname, 'migration.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    await connection.query(sqlScript);
    console.log('✅ All migration tables verified/created successfully!');

    // Check & Seed Default Super Admin User
    const [rows] = await connection.query('SELECT * FROM crm_users WHERE email = ?', ['admin@omwhub.com']);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const permissions = JSON.stringify([
        "dashboard", "customers", "workers", "bookings", "support", "payments", 
        "notifications", "reports", "attendance", "create-lead", "users"
      ]);

      await connection.query(`
        INSERT INTO crm_users (id, name, email, password_hash, role, status, is_admin, avatar, permissions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'USR-101', 
        'Admin User', 
        'admin@omwhub.com', 
        hashedPassword, 
        'Super Administrator', 
        'Active', 
        true, 
        'AD', 
        permissions
      ]);
      console.log('🔑 Super Admin User created (Email: admin@omwhub.com / Pass: admin123)');
    } else {
      console.log('ℹ️ Super Admin user already present in crm_users table.');
    }

    console.log('🎉 Migration finished successfully!');

  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
