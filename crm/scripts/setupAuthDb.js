import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to MySQL.');

    // Create crm_users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crm_users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        is_admin BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(10),
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('crm_users table created or already exists.');

    // Check if the admin user exists
    const [rows] = await connection.query('SELECT * FROM crm_users WHERE email = ?', ['admin@omwhub.com']);
    
    if (rows.length === 0) {
      // Hash the default password
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
      console.log('Super Admin user created: admin@omwhub.com / admin123');
    } else {
      console.log('Super Admin already exists. Skipping insertion.');
    }

    // Create leave_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_name VARCHAR(255) NOT NULL,
        leave_type VARCHAR(100) NOT NULL,
        start_date VARCHAR(50) NOT NULL,
        end_date VARCHAR(50) NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('leave_requests table created or already exists.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
