import pool from './db/db.js';

async function describe() {
  try {
    const [users] = await pool.query('DESCRIBE users');
    console.log('Users columns:', users.map(c => c.Field));
    
    const [book] = await pool.query('DESCRIBE bookings');
    console.log('Bookings columns:', book.map(c => c.Field));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

describe();
