import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './db/db.js';
import { getStore, updateStore } from './db/dataStore.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import cookieParser from 'cookie-parser';

const JWT_SECRET = process.env.JWT_SECRET || 'omw_crm_super_secret_key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;

// Ensure omw-poster.png exists in public/ folder
try {
  const srcImage = path.join(__dirname, '..', 'omw-email', 'image.png');
  const destPublicImage = path.join(__dirname, 'public', 'omw-poster.png');
  const destRootImage = path.join(__dirname, 'omw-poster.png');
  if (fs.existsSync(srcImage)) {
    if (!fs.existsSync(destPublicImage)) fs.copyFileSync(srcImage, destPublicImage);
    if (!fs.existsSync(destRootImage)) fs.copyFileSync(srcImage, destRootImage);
  }
} catch (e) {
  console.log('Poster image copy check:', e.message);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Expose io to all routes if needed, or we can just use io directly since they are in the same file
app.set('io', io);

// Initialize Database Tables
const logActivity = async (userId, userName, actionType, description) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, user_name, action_type, description) VALUES (?, ?, ?, ?)',
      [userId || 'SYSTEM', userName || 'Staff / Admin', actionType, description]
    );
  } catch (err) {
    console.error('Activity Logging Error:', err);
  }
};

const initializeDB = async () => {
  try {
    await pool.query(`
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
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        worker_id VARCHAR(50),
        worker_name VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        check_in VARCHAR(50),
        check_out VARCHAR(50),
        total_hours VARCHAR(50),
        work_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await pool.query('ALTER TABLE attendance_logs ADD COLUMN work_description TEXT');
    } catch (e) {
      // Column might already exist
    }
    try {
      await pool.query('ALTER TABLE leads MODIFY COLUMN status VARCHAR(50) DEFAULT "captured"');
    } catch (e) {
      // Table or column alter safely handled
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('activity_logs table verified');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(50) PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        contact VARCHAR(100),
        title TEXT NOT NULL,
        category VARCHAR(100),
        assignedExecutive VARCHAR(100),
        escalationLevel VARCHAR(50),
        resolutionNotes TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        priority VARCHAR(50) DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('support_tickets table verified');
    
    try {
      await pool.query('ALTER TABLE crm_users ADD COLUMN phone VARCHAR(100)');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE crm_users ADD COLUMN category VARCHAR(255)');
    } catch (e) {}
    
    // Create Performance Indexes for Fast Queries
    const indexQueries = [
      "CREATE INDEX idx_crm_users_email ON crm_users (email)",
      "CREATE INDEX idx_crm_users_status ON crm_users (status)",
      "CREATE INDEX idx_attendance_logs_date ON attendance_logs (date)",
      "CREATE INDEX idx_attendance_logs_worker_id ON attendance_logs (worker_id)",
      "CREATE INDEX idx_attendance_logs_status ON attendance_logs (status)",
      "CREATE INDEX idx_attendance_logs_worker_date ON attendance_logs (worker_name, date)",
      "CREATE INDEX idx_leave_requests_status ON leave_requests (status)",
      "CREATE INDEX idx_leave_requests_worker ON leave_requests (worker_name)",
      "CREATE INDEX idx_activity_logs_user_id ON activity_logs (user_id)",
      "CREATE INDEX idx_activity_logs_timestamp ON activity_logs (timestamp)",
      "CREATE INDEX idx_support_tickets_status ON support_tickets (status)",
      "CREATE INDEX idx_support_tickets_category ON support_tickets (category)"
    ];

    for (const query of indexQueries) {
      try {
        await pool.query(query);
      } catch (e) {
        // Ignore if index already exists
      }
    }

    console.log('⚡ All CRM Database Performance Indexes Verified & Active!');
    console.log('leave_requests and attendance_logs tables verified');
  } catch (err) {
    console.error('DB Init Error:', err);
  }
};
initializeDB();

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS connected');

    res.json({
      success: true,
      database: rows
    });
  } catch (error) {
    console.error('DB TEST ERROR:', error);

    res.status(500).json({
      success: false,
      code: error.code,
      message: error.message,
      address: error.address,
      port: error.port
    });
  }
});



// API Request Logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Lightweight Cookie Parser Middleware
app.use((req, res, next) => {
  if (req.headers.cookie) {
    req.cookies = req.headers.cookie.split(';').reduce((res, c) => {
      const [key, val] = c.trim().split('=').map(decodeURIComponent);
      return Object.assign(res, { [key]: val });
    }, {});
  } else {
    req.cookies = {};
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'OMW CRM Backend', timestamp: new Date() });
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM crm_users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid Email or Password' });

    const user = rows[0];
    if (!user.is_admin) return res.status(403).json({ error: 'Not an administrator' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid Email or Password' });

    if (user.status !== 'Active') return res.status(403).json({ error: 'Account suspended' });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: true }, JWT_SECRET, { expiresIn: '8h' });
    logActivity(user.id, user.name, 'Login', 'Admin logged into the CRM');

    res.cookie('omw_crm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    }).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: true,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User (Staff) Login
app.post('/api/auth/user-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM crm_users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid Email or Password' });

    const user = rows[0];
    if (user.is_admin) return res.status(403).json({ error: 'Please use the Admin Portal' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid Email or Password' });

    if (user.status !== 'Active') return res.status(403).json({ error: 'Account suspended' });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: false }, JWT_SECRET, { expiresIn: '8h' });
    logActivity(user.id, user.name, 'Login', 'User logged into the CRM');

    res.cookie('omw_crm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    }).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: false,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('User Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const path = req.originalUrl || req.url || '';
  if (
    path.includes('/api/health') ||
    path.includes('/api/db-test') ||
    path.includes('/api/auth/admin-login') ||
    path.includes('/api/auth/user-login') ||
    path.includes('/api/auth/logout') ||
    path.includes('/leads')
  ) {
    return next();
  }

  // Check cookies first, fallback to Auth header
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  const token = req.cookies.omw_crm_token || headerToken;

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Admin Impersonation / User Switch Endpoint
app.post('/api/auth/impersonate', authenticateToken, async (req, res) => {
  try {
    const isOriginalAdmin = req.user.isAdmin || req.user.originalAdminId;
    if (!isOriginalAdmin) {
      return res.status(403).json({ error: 'Only administrators can switch to another user account' });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const [rows] = await pool.query('SELECT * FROM crm_users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Target user not found' });

    const targetUser = rows[0];
    if (targetUser.status !== 'Active') return res.status(403).json({ error: 'Account is inactive or suspended' });

    const originalAdminId = req.user.originalAdminId || req.user.id;
    const isTargetAdmin = !!targetUser.is_admin;

    const token = jwt.sign({
      id: targetUser.id,
      email: targetUser.email,
      isAdmin: isTargetAdmin,
      originalAdminId: originalAdminId
    }, JWT_SECRET, { expiresIn: '8h' });

    logActivity(originalAdminId, req.user.email, 'Switch User', `Admin switched account view to user ${targetUser.name} (${targetUser.id})`);

    res.cookie('omw_crm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    }).json({
      message: `Successfully switched view to ${targetUser.name}`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isAdmin: isTargetAdmin,
        permissions: targetUser.permissions,
        avatar: targetUser.avatar,
        originalAdminId: originalAdminId,
        isImpersonating: originalAdminId !== targetUser.id,
        canSwitchUser: true
      }
    });
  } catch (err) {
    console.error('Impersonate error:', err);
    res.status(500).json({ error: 'Failed to switch user view' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies.omw_crm_token;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        logActivity(user.id, user.email, 'Logout', 'User logged out');
      }
    });
  }
  res.cookie('omw_crm_token', '', { expires: new Date(0) }).json({ message: 'Logged out successfully' });
});

app.use(authenticateToken);

// Get Current User (from cookie)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, is_admin as isAdmin, status, avatar, permissions FROM crm_users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = rows[0];
    if (user.status !== 'Active') return res.status(403).json({ error: 'Account suspended' });

    if (req.user.originalAdminId) {
      user.originalAdminId = req.user.originalAdminId;
      user.isImpersonating = req.user.originalAdminId !== user.id;
      user.canSwitchUser = true;
    } else if (user.isAdmin) {
      user.canSwitchUser = true;
    } else {
      user.canSwitchUser = false;
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET Leave Requests
app.get('/api/attendance/leaves', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leave_requests ORDER BY id DESC');
    res.json({ requests: rows });
  } catch (err) {
    console.error('Get leaves error:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST Leave Request
app.post('/api/attendance/leaves', authenticateToken, async (req, res) => {
  try {
    const { workerName, leaveType, startDate, endDate, reason } = req.body;
    const [result] = await pool.query(
      'INSERT INTO leave_requests (worker_name, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      [workerName, leaveType, startDate, endDate, reason]
    );
    res.json({ success: true, id: result.insertId });
    if (req.app.get('io')) { req.app.get('io').emit('leave_updated'); }
  } catch (err) {
    console.error('Post leave error:', err);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// PUT Leave Status (Accept/Reject)
app.put('/api/attendance/leaves/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
    if (req.app.get('io')) { req.app.get('io').emit('leave_updated'); }
  } catch (err) {
    console.error('Update leave status error:', err);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

// Helper to calculate total hours between Check In and Check Out times
function calculateTotalHours(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr || checkInStr === '--' || checkOutStr === '--') {
    return '--';
  }

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const cleanStr = timeStr.trim().toUpperCase();
    const isPM = cleanStr.includes('PM');
    const isAM = cleanStr.includes('AM');
    
    const timeOnly = cleanStr.replace(/(AM|PM)/g, '').trim();
    const parts = timeOnly.split(':');
    if (parts.length < 2) return null;
    
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMins = parseTimeToMinutes(checkInStr);
  const endMins = parseTimeToMinutes(checkOutStr);

  if (startMins === null || endMins === null) {
    return '--';
  }

  let diffMins = endMins - startMins;
  if (diffMins < 0) {
    diffMins += 24 * 60;
  }

  if (diffMins === 0) return '0.0 hrs';
  
  const hrs = (diffMins / 60).toFixed(1);
  if (hrs === '0.0' && diffMins > 0) {
    return `${diffMins} mins`;
  }
  return `${hrs} hrs`;
}

// GET Attendance Logs
app.get('/api/attendance/logs', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance_logs ORDER BY id DESC');
    const logs = rows.map(log => {
      let totalHours = log.total_hours;
      if (!totalHours || totalHours === 'Calculated' || (log.check_in && log.check_out && log.check_out !== '--' && totalHours === '--')) {
        totalHours = calculateTotalHours(log.check_in, log.check_out);
        pool.query('UPDATE attendance_logs SET total_hours = ? WHERE id = ?', [totalHours, log.id]).catch(() => {});
      }
      return {
        ...log,
        total_hours: totalHours
      };
    });
    res.json({ logs });
  } catch (err) {
    console.error('Get attendance logs error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

// POST Mark Attendance
app.post('/api/attendance/mark', authenticateToken, async (req, res) => {
  try {
    const { workerId, workerName, date, actionType, time } = req.body;
    
    if (actionType === 'Check In') {
      const [result] = await pool.query(
        'INSERT INTO attendance_logs (worker_id, worker_name, date, status, check_in, check_out, total_hours) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [workerId || null, workerName, date, 'Present', time, '--', '--']
      );
      if (req.user) { logActivity(req.user.id, req.user.name, 'Mark Attendance', 'Action: ' + actionType); }
      res.json({ success: true, id: result.insertId });
      if (req.app.get('io')) { req.app.get('io').emit('attendance_updated'); }
    } else if (actionType === 'Check Out') {
      const [rows] = await pool.query(
        "SELECT * FROM attendance_logs WHERE worker_name = ? AND date = ? AND check_out = '--' ORDER BY id DESC LIMIT 1",
        [workerName, date]
      );
      
      if (rows.length === 0) {
        return res.status(400).json({ error: 'No active Check In found for today' });
      }
      
      const logId = rows[0].id;
      const checkInTime = rows[0].check_in;
      const totalHours = calculateTotalHours(checkInTime, time);
      
      await pool.query(
        'UPDATE attendance_logs SET check_out = ?, total_hours = ? WHERE id = ?',
        [time, totalHours, logId]
      );
      
      if (req.user) { logActivity(req.user.id, req.user.name, 'Mark Attendance', 'Action: Check Out'); }
      res.json({ success: true, updatedId: logId });
      if (req.app.get('io')) { req.app.get('io').emit('attendance_updated'); }
    } else {
      res.status(400).json({ error: 'Invalid action type' });
    }
  } catch (err) {
    console.error('Mark attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// PUT Update Work Description Log
app.put('/api/attendance/logs/:id/work-description', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { workDescription } = req.body;

    await pool.query(
      'UPDATE attendance_logs SET work_description = ? WHERE id = ?',
      [workDescription, id]
    );

    if (req.user) {
      logActivity(req.user.id, req.user.name, 'Update Work Log', `Updated daily work log for Attendance ID ${id}`);
    }

    res.json({ success: true, message: 'Daily work description updated successfully' });
    if (req.app.get('io')) {
      req.app.get('io').emit('attendance_updated');
    }
  } catch (err) {
    console.error('Update work description error:', err);
    res.status(500).json({ error: 'Failed to update work description' });
  }
});

// Database Sync Trigger
app.post('/api/sync/trigger', async (req, res) => {
  try {
    const [customerRes] = await pool.query('SELECT COUNT(*) as c FROM customers');
    const [workerRes] = await pool.query('SELECT COUNT(*) as c FROM providers');
    const [bookingRes] = await pool.query('SELECT COUNT(*) as c FROM bookings');
    const [financialRes] = await pool.query('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid"');

    res.json({
      success: true,
      stats: {
        customers: customerRes[0].c,
        workers: workerRes[0].c,
        bookings: bookingRes[0].c,
        financials: parseFloat(financialRes[0].total || 0)
      }
    });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: 'Database sync failed' });
  }
});

function getIndianGazetteHolidays(year) {
  const dataset = {
    2026: [
      { date: '2026-01-26', name: 'Republic Day', localName: 'Republic Day 🇮🇳' },
      { date: '2026-03-04', name: 'Holi', localName: 'Holi 🎨' },
      { date: '2026-05-01', name: 'Labour Day', localName: 'Labour Day 🛠️' },
      { date: '2026-08-15', name: 'Independence Day', localName: 'Independence Day 🇮🇳' },
      { date: '2026-08-28', name: 'Raksha Bandhan', localName: 'Raksha Bandhan 🪔' },
      { date: '2026-09-04', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami 🪈' },
      { date: '2026-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti 👓' },
      { date: '2026-10-20', name: 'Dussehra', localName: 'Vijayadashami / Dussehra 🏹' },
      { date: '2026-11-08', name: 'Diwali', localName: 'Deepavali / Diwali 🪔' },
      { date: '2026-12-25', name: 'Christmas', localName: 'Christmas 🎄' }
    ],
    2027: [
      { date: '2027-01-26', name: 'Republic Day', localName: 'Republic Day 🇮🇳' },
      { date: '2027-03-22', name: 'Holi', localName: 'Holi 🎨' },
      { date: '2027-05-01', name: 'Labour Day', localName: 'Labour Day 🛠️' },
      { date: '2027-08-15', name: 'Independence Day', localName: 'Independence Day 🇮🇳' },
      { date: '2027-08-17', name: 'Raksha Bandhan', localName: 'Raksha Bandhan 🪔' },
      { date: '2027-08-25', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami 🪈' },
      { date: '2027-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti 👓' },
      { date: '2027-10-09', name: 'Dussehra', localName: 'Vijayadashami / Dussehra 🏹' },
      { date: '2027-10-29', name: 'Diwali', localName: 'Deepavali / Diwali 🪔' },
      { date: '2027-12-25', name: 'Christmas', localName: 'Christmas 🎄' }
    ],
    2028: [
      { date: '2028-01-26', name: 'Republic Day', localName: 'Republic Day 🇮🇳' },
      { date: '2028-03-11', name: 'Holi', localName: 'Holi 🎨' },
      { date: '2028-05-01', name: 'Labour Day', localName: 'Labour Day 🛠️' },
      { date: '2028-08-15', name: 'Independence Day', localName: 'Independence Day 🇮🇳' },
      { date: '2028-08-05', name: 'Raksha Bandhan', localName: 'Raksha Bandhan 🪔' },
      { date: '2028-08-13', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami 🪈' },
      { date: '2028-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti 👓' },
      { date: '2028-09-28', name: 'Dussehra', localName: 'Vijayadashami / Dussehra 🏹' },
      { date: '2028-10-17', name: 'Diwali', localName: 'Deepavali / Diwali 🪔' },
      { date: '2028-12-25', name: 'Christmas', localName: 'Christmas 🎄' }
    ]
  };

  return dataset[year] || [
    { date: `${year}-01-26`, name: 'Republic Day', localName: 'Republic Day 🇮🇳' },
    { date: `${year}-05-01`, name: 'Labour Day', localName: 'Labour Day 🛠️' },
    { date: `${year}-08-15`, name: 'Independence Day', localName: 'Independence Day 🇮🇳' },
    { date: `${year}-10-02`, name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti 👓' },
    { date: `${year}-12-25`, name: 'Christmas', localName: 'Christmas 🎄' }
  ];
}

// GET Indian Public Holidays Endpoint
app.get('/api/holidays/IN/:year?', async (req, res) => {
  try {
    const year = parseInt(req.params.year || new Date().getFullYear());
    const holidays = getIndianGazetteHolidays(year);

    res.json({
      success: true,
      country: 'IN',
      year,
      count: holidays.length,
      holidays
    });
  } catch (err) {
    console.error('Fetch holidays API error:', err.message);
    const year = parseInt(req.params.year || new Date().getFullYear());
    res.json({
      success: true,
      year,
      holidays: getIndianGazetteHolidays(year)
    });
  }
});

// Dashboard Statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [customerCount] = await pool.query('SELECT COUNT(*) as count FROM customers');
    const [workerCount] = await pool.query('SELECT COUNT(*) as count FROM providers');
    const [activeBookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE service_status IN ("pending", "assigned", "started", "in_progress", "arrived")');
    const [completedBookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE service_status = "completed"');
    const [cancelledBookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE service_status IN ("cancelled", "no_driver_found")');
    const [pendingBookings] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE service_status = "pending"');
    const [pendingPayments] = await pool.query('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status IN ("pending", "unpaid")');
    const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid"');
    const [dailyRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid" AND DATE(updated_at) = CURDATE()');

    const [revenueDataRows] = await pool.query(`
      SELECT DATE_FORMAT(updated_at, '%a') as day, SUM(total_amount) as revenue
      FROM bookings
      WHERE payment_status = 'paid' AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(updated_at, '%a'), DATE(updated_at)
      ORDER BY DATE(updated_at) ASC
    `);

    const [recentBookingsRows] = await pool.query(`
      SELECT 
        b.id, 
        COALESCE(cu.name, 'Unknown') as customerName, 
        COALESCE(pu.name, 'Unassigned') as workerName, 
        b.booking_type as service, 
        DATE_FORMAT(b.created_at, "%d %b %Y") as date, 
        b.total_amount as amount, 
        b.service_status as status 
      FROM bookings b
      LEFT JOIN users cu ON b.user_id = cu.id
      LEFT JOIN providers p ON b.provider_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      ORDER BY b.id DESC LIMIT 5
    `);

    res.json({
      stats: {
        totalCustomers: customerCount[0].count,
        totalWorkers: workerCount[0].count,
        activeBookings: activeBookings[0].count,
        completedBookings: completedBookings[0].count,
        cancelledBookings: cancelledBookings[0].count,
        pendingBookings: pendingBookings[0].count,
        pendingPayments: parseFloat(pendingPayments[0].total || 0),
        totalRevenue: parseFloat(totalRevenue[0].total || 0),
        dailyRevenue: parseFloat(dailyRevenue[0].total || 0),
        openSupportTickets: 0,
        activeAccountsCount: customerCount[0].count,
        kycVerifiedWorkers: workerCount[0].count,
        onDutyWorkers: workerCount[0].count,
        omwDbStatus: "CONNECTED_LIVE_DB"
      },
      revenueData: revenueDataRows,
      recentBookings: recentBookingsRows,
      openTickets: []
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Customers CRUD
app.get('/api/customers', async (req, res) => {
  try {
    const { search, status, sort } = req.query;

    let whereClause = "1=1";
    const queryParams = [];

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.phone_number LIKE ? OR c.city LIKE ? OR u.email LIKE ?)";
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    let orderByClause = "c.id DESC";
    if (sort === 'spent') {
      orderByClause = "totalSpent DESC";
    } else if (sort === 'rating') {
      orderByClause = "rating DESC";
    }

    const [rows] = await pool.query(`
      SELECT 
        c.id, 
        u.name, 
        u.email, 
        u.phone_number as phone, 
        "Active" as status, 
        c.city as address, 
        COUNT(b.id) as bookingsCount, 
        5.0 as rating, 
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END), 0) as totalSpent, 
        DATE_FORMAT(u.created_at, "%d %b %Y") as joinedDate, 
        SUBSTRING(u.name, 1, 2) as avatar 
      FROM customers c
      JOIN users u ON c.id = u.id 
      LEFT JOIN bookings b ON b.user_id = u.id
      WHERE ${whereClause}
      GROUP BY c.id, u.name, u.email, u.phone_number, c.city, u.created_at
      ORDER BY ${orderByClause} LIMIT 100
    `, queryParams);

    const [totalRes] = await pool.query('SELECT COUNT(*) as c FROM customers');
    const realTotalCustomers = totalRes[0].c;

    let vipCustomers = 0;
    rows.forEach(r => {
      r.totalSpent = parseFloat(r.totalSpent);
      if (r.bookingsCount >= 3 || r.totalSpent >= 1000) {
        vipCustomers++;
      }
    });

    const stats = {
      totalCustomers: realTotalCustomers,
      vipCustomers: vipCustomers,
      activeAccounts: realTotalCustomers,
      avgRating: "4.8"
    };

    res.json({ customers: rows, stats });
  } catch (err) {
    console.error("Customers Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Workers CRUD
app.get('/api/workers', async (req, res) => {
  try {
    const { search, category, kycStatus } = req.query;

    let whereClause = "1=1";
    const queryParams = [];

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.phone_number LIKE ?)";
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard);
    }

    if (kycStatus && kycStatus !== 'All KYC Statuses') {
      if (kycStatus === 'Verified') {
        whereClause += " AND p.verified = 1";
      } else if (kycStatus === 'Pending KYC') {
        whereClause += " AND p.verified = 0";
      }
    }

    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        u.name, 
        u.phone_number as phone, 
        "General" as category, 
        IF(p.verified, "Verified", "Pending KYC") as kycStatus, 
        IF(p.active, "On Duty", "Offline") as availability, 
        SUM(CASE WHEN b.service_status IN ('pending', 'assigned', 'started', 'arrived', 'in_progress') THEN 1 ELSE 0 END) as activeJobsCount, 
        COUNT(b.id) as totalJobsCount, 
        p.rating, 
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END), 0) as totalEarnings, 
        15 as commissionRate, 
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount * 0.85 ELSE 0 END), 0) as netEarnings, 
        SUBSTRING(u.name, 1, 2) as avatar 
      FROM providers p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN bookings b ON b.provider_id = p.id
      WHERE ${whereClause}
      GROUP BY p.id, u.name, u.phone_number, p.verified, p.active, p.rating
      ORDER BY p.id DESC LIMIT 100
    `, queryParams);

    const [totalRes] = await pool.query('SELECT COUNT(*) as c FROM providers');
    const realTotalWorkers = totalRes[0].c;

    const [verifiedRes] = await pool.query('SELECT COUNT(*) as c FROM providers WHERE verified = 1');
    const verifiedWorkers = verifiedRes[0].c;

    const [onDutyRes] = await pool.query('SELECT COUNT(*) as c FROM providers WHERE active = 1');
    const onDutyWorkers = onDutyRes[0].c;

    const stats = {
      totalWorkers: realTotalWorkers,
      kycVerified: verifiedWorkers,
      onDuty: onDutyWorkers,
      avgRating: "4.86"
    };

    res.json({ workers: rows, stats });
  } catch (err) {
    console.error("Workers Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Bookings CRUD
app.get('/api/bookings', async (req, res) => {
  try {
    const { search, status } = req.query;

    let whereClause = "1=1";
    const queryParams = [];

    if (search) {
      whereClause += " AND (b.id LIKE ? OR cu.name LIKE ? OR pu.name LIKE ? OR b.booking_type LIKE ?)";
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    if (status && status !== 'All Booking Statuses') {
      if (status === 'Active') {
        whereClause += " AND b.service_status IN ('pending', 'assigned', 'started', 'in_progress', 'arrived')";
      } else if (status === 'Scheduled') {
        whereClause += " AND b.service_status IN ('pending', 'assigned')";
      } else if (status === 'Completed') {
        whereClause += " AND b.service_status = 'completed'";
      } else if (status === 'Cancelled') {
        whereClause += " AND b.service_status IN ('cancelled', 'no_driver_found')";
      }
    }

    const [rows] = await pool.query(`
      SELECT 
        b.id, 
        cu.name as customerName, 
        pu.name as workerName, 
        b.booking_type as service, 
        DATE_FORMAT(b.created_at, "%d %b %Y") as date, 
        b.total_amount as amount, 
        IF(b.service_status IN ('started', 'in_progress', 'completed'), 1, 0) as otpVerified, 
        IF(b.service_status = 'completed', 1, 0) as photoUploaded, 
        b.service_status as status, 
        b.payment_status as paymentStatus 
      FROM bookings b
      LEFT JOIN users cu ON b.user_id = cu.id
      LEFT JOIN providers p ON b.provider_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      WHERE ${whereClause}
      ORDER BY b.id DESC LIMIT 100
    `, queryParams);

    const [totalRes] = await pool.query('SELECT COUNT(*) as c FROM bookings');
    const realTotalBookings = totalRes[0].c;

    const [activeRes] = await pool.query('SELECT COUNT(*) as c FROM bookings WHERE service_status IN ("pending", "assigned", "started", "in_progress", "arrived")');
    const activeBookings = activeRes[0].c;

    const [otpRes] = await pool.query('SELECT COUNT(*) as c FROM bookings WHERE service_status IN ("started", "in_progress", "completed")');
    const otpVerified = otpRes[0].c;

    const [photoRes] = await pool.query('SELECT COUNT(*) as c FROM bookings WHERE service_status = "completed"');
    const photosUploaded = photoRes[0].c;

    const stats = {
      totalBookings: realTotalBookings,
      activeBookings: activeBookings,
      otpVerified: otpVerified,
      photosUploaded: photosUploaded
    };

    res.json({ bookings: rows, stats });
  } catch (err) {
    console.error("Bookings Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Support Tickets
app.get('/api/support-tickets', (req, res) => {
  res.json({ tickets: [] });
});

// Payments / Transactions
app.get('/api/payments', async (req, res) => {
  try {
    const { search, status } = req.query;

    let whereClause = "b.total_amount > 0";
    const queryParams = [];

    if (search) {
      whereClause += " AND (b.id LIKE ? OR cu.name LIKE ? OR pu.name LIKE ? OR b.booking_type LIKE ?)";
      const searchWildcard = `%${search}%`;
      queryParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
    }

    if (status && status !== 'All Statuses') {
      if (status === 'Completed') {
        whereClause += " AND b.payment_status = 'paid'";
      } else if (status === 'Pending') {
        whereClause += " AND b.payment_status IN ('pending', 'unpaid')";
      } else if (status === 'Refunded') {
        whereClause += " AND b.payment_status = 'refunded'";
      }
    }

    const [rows] = await pool.query(`
      SELECT 
        b.id, 
        COALESCE(cu.name, 'Unknown Customer') as customer, 
        "UPI" as customerMethod, 
        COALESCE(pu.name, 'Unassigned') as worker, 
        b.booking_type as service, 
        b.total_amount as grossFee, 
        CONCAT('15% (₹', ROUND(b.total_amount * 0.15), ')') as commissionSplit, 
        ROUND(b.total_amount * 0.85) as netWorkerPayout, 
        IF(b.payment_status = 'refunded', 'Refund Processed ↪️', 'No Refund') as refundStatus, 
        IF(b.payment_status = 'paid', 'Completed', IF(b.payment_status = 'refunded', 'Refunded', 'Pending')) as status, 
        DATE_FORMAT(b.created_at, "%d %b %Y, %h:%i %p") as date 
      FROM bookings b
      LEFT JOIN users cu ON b.user_id = cu.id
      LEFT JOIN providers p ON b.provider_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      WHERE ${whereClause}
      ORDER BY b.id DESC LIMIT 100
    `, queryParams);

    const [grossRes] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE payment_status = 'paid'");
    const grossRevenue = parseFloat(grossRes[0].total || 0);

    const commission = grossRevenue * 0.15;
    const netPayout = grossRevenue - commission;

    const [refundsRes] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE payment_status = 'refunded'");
    const processedRefunds = parseFloat(refundsRes[0].total || 0);

    const stats = {
      grossRevenue,
      platformCommission: commission,
      dispatchedPayouts: netPayout,
      processedRefunds
    };

    res.json({ payments: rows, stats });
  } catch (err) {
    console.error("Payments Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const [grossRes] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as bookings FROM bookings WHERE payment_status = 'paid'");
    const grossRevenue = parseFloat(grossRes[0].total || 0);
    const totalBookings = grossRes[0].bookings || 0;
    const platformCommission = grossRevenue * 0.16;

    const [weeklyRows] = await pool.query(`
      SELECT 
        CONCAT('Week ', FLOOR((DAY(created_at) - 1) / 7) + 1) AS week,
        SUM(total_amount) AS revenue
      FROM bookings
      WHERE payment_status = 'paid'
      GROUP BY week
      ORDER BY week ASC
    `);

    const weeksMap = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };
    weeklyRows.forEach(row => {
      if (weeksMap[row.week] !== undefined) {
        weeksMap[row.week] = parseFloat(row.revenue);
      }
    });
    const weeklyData = Object.keys(weeksMap).map(w => ({ week: w, revenue: weeksMap[w] }));

    const [serviceRows] = await pool.query(`
      SELECT 
        booking_type as name, 
        COUNT(*) as jobs, 
        SUM(total_amount) as revenue
      FROM bookings 
      WHERE payment_status = 'paid' 
      GROUP BY booking_type
      ORDER BY revenue DESC
    `);

    const colors = ["#1E293B", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
    const maxRevenue = serviceRows.length > 0 ? parseFloat(serviceRows[0].revenue) : 1;

    const formatCategory = (str) => {
      if (!str) return 'Unknown Service';
      return str.split(/[_ ]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const servicePerformance = serviceRows.map((s, idx) => {
      const rev = parseFloat(s.revenue || 0);
      return {
        name: formatCategory(s.name),
        jobs: s.jobs,
        revenue: rev,
        comm: rev * 0.16,
        width: `${Math.round((rev / Math.max(maxRevenue, 1)) * 100)}%`,
        color: colors[idx % colors.length]
      };
    });

    const [workerRows] = await pool.query(`
      SELECT 
        pu.name as name,
        MAX(b.booking_type) as category,
        COUNT(b.id) as jobs,
        COALESCE(AVG(5.0), 5.0) as rating,
        SUM(b.total_amount) as revenue
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      JOIN users pu ON p.user_id = pu.id
      WHERE b.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY revenue DESC
    `);

    const workerBreakdown = workerRows.map(w => {
      const rev = parseFloat(w.revenue || 0);
      return {
        name: w.name,
        category: formatCategory(w.category),
        jobs: `${w.jobs} jobs`,
        rating: parseFloat(w.rating).toFixed(1),
        revenue: `₹${rev.toLocaleString()}`,
        comm: `₹${Math.round(rev * 0.16).toLocaleString()}`
      };
    });

    res.json({
      stats: {
        totalBookings,
        grossRevenue,
        platformCommission,
        complaintResolutionRate: "98.1%"
      },
      weeklyData,
      servicePerformance,
      workerBreakdown
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// CRM Staff Users & Access Control Endpoints
app.get('/api/crm-users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, category, role, status, is_admin as isAdmin, avatar, permissions, created_at as createdAt FROM crm_users ORDER BY created_at DESC');
    res.json({ users: rows });
  } catch (err) {
    console.error("CRM Users Fetch Error:", err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/crm-users', async (req, res) => {
  try {
    // Only Admin should create users
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only administrators can create users' });
    }

    const { name, email, phone, category, password, role, permissions, status } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, phone number, and password are required' });
    }

    // Check if email exists
    const [existing] = await pool.query('SELECT email FROM crm_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const userRole = role || 'Staff Member';
    const userPhone = phone || '';
    const userCategory = category || 'Staff';
    const userStatus = status || 'Active';
    const userPermissions = JSON.stringify(permissions || ['dashboard']);
    const isSuperAdmin = userRole === 'Super Administrator';

    await pool.query(`
      INSERT INTO crm_users (id, name, email, phone, category, password_hash, role, status, is_admin, avatar, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, userPhone, userCategory, hashedPassword, userRole, userStatus, isSuperAdmin, avatar, userPermissions]);

    const newUser = {
      id: userId, name, email, phone: userPhone, category: userCategory, role: userRole, status: userStatus, isAdmin: isSuperAdmin, avatar, permissions: permissions || ['dashboard']
    };

    res.status(201).json({ user: newUser, message: 'User created successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('user_updated'); }
  } catch (err) {
    console.error("Create CRM User Error:", err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/crm-users/:id', async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only administrators can update users' });
    }

    const { id } = req.params;
    const { name, email, phone, category, password, role, permissions, status } = req.body;
    const isSuperAdmin = role === 'Super Administrator';

    let updateQuery = 'UPDATE crm_users SET name = ?, email = ?, phone = ?, category = ?, role = ?, status = ?, permissions = ?, is_admin = ?';
    const queryParams = [name, email, phone || '', category || 'Staff', role, status, JSON.stringify(permissions), isSuperAdmin];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password_hash = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await pool.query(updateQuery, queryParams);

    const [rows] = await pool.query('SELECT id, name, email, phone, category, role, status, is_admin as isAdmin, avatar, permissions FROM crm_users WHERE id = ?', [id]);
    res.json({ user: rows[0], message: 'User updated successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('user_updated'); }
  } catch (err) {
    console.error("Update CRM User Error:", err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/crm-users/:id', async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Only administrators can delete users' });
    }

    const { id } = req.params;
    await pool.query('DELETE FROM crm_users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('user_updated'); }
  } catch (err) {
    console.error("Delete CRM User Error:", err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Leads Management Endpoints (Existing `leads` table in MySQL DB)
app.get('/api/leads', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY id DESC');
    res.json({ leads: rows });
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, status, first_name, last_name } = req.body;
    const fname = firstName || first_name || '';
    const lname = lastName || last_name || '';
    const leadEmail = email || '';
    const leadPhone = phone || '';
    const leadStatus = (status && status !== '-None-') ? String(status).toLowerCase().trim() : 'captured';

    const [result] = await pool.query(
      'INSERT INTO leads (first_name, last_name, email, phone, status) VALUES (?, ?, ?, ?, ?)',
      [fname, lname, leadEmail, leadPhone, leadStatus]
    );

    const newLead = {
      id: result.insertId,
      first_name: fname,
      last_name: lname,
      email: leadEmail,
      phone: leadPhone,
      status: leadStatus,
      created_at: new Date()
    };

    if (req.user) {
      logActivity(req.user.id, req.user.name, 'Create Lead', `Created new lead for ${fname} ${lname}`);
    }

    res.status(201).json({ lead: newLead, message: 'Lead created successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('lead_updated'); }
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, status, firstName, lastName } = req.body;
    const fname = firstName || first_name || '';
    const lname = lastName || last_name || '';

    await pool.query(
      'UPDATE leads SET first_name = ?, last_name = ?, email = ?, phone = ?, status = ? WHERE id = ?',
      [fname, lname, email, phone, status || 'captured', id]
    );

    res.json({ success: true, message: 'Lead updated successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('lead_updated'); }
  } catch (err) {
    console.error('Update lead error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM leads WHERE id = ?', [id]);
    res.json({ success: true, message: 'Lead deleted successfully' });
    if (req.app.get('io')) { req.app.get('io').emit('lead_updated'); }
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Bulk Email Sender API (Hostinger SMTP from omw-email)
app.post('/api/leads/send-email', async (req, res) => {
  try {
    const { recipients, subject, customHtml } = req.body;
    
    let emailList = [];
    if (Array.isArray(recipients)) {
      emailList = recipients;
    } else if (typeof recipients === 'string') {
      emailList = recipients.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = Array.from(new Set(emailList.filter(e => emailRegex.test(e))));
    
    if (validEmails.length === 0) {
      return res.status(400).json({ error: 'No valid recipient email addresses provided' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'marketing@omwhub.com',
        pass: process.env.SMTP_PASS || 'Varun$2026'
      }
    });

    const defaultPosterHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#ffffff;">
    <div style="text-align:center;">
        <a href="https://omwhub.com/" target="_blank" style="display:block; text-decoration:none;">
            <img
                src="cid:omwposter"
                alt="OMW - A new way to get things done"
                style="
                    width:100%;
                    max-width:1024px;
                    height:auto;
                    display:block;
                    margin:0 auto;
                    border:0;
                "
            >
        </a>
    </div>
</body>
</html>
`;

    let posterPath = path.join(__dirname, 'public', 'omw-poster.png');
    if (!fs.existsSync(posterPath)) {
      posterPath = path.join(__dirname, 'omw-poster.png');
    }
    if (!fs.existsSync(posterPath)) {
      const omwEmailPath = path.join(__dirname, '..', 'omw-email', 'image.png');
      if (fs.existsSync(omwEmailPath)) {
        posterPath = omwEmailPath;
      }
    }

    const attachments = [];
    if (fs.existsSync(posterPath)) {
      attachments.push({
        filename: 'omw-poster.png',
        path: posterPath,
        cid: 'omwposter'
      });
    }

    const mailOptions = {
      from: `"OMW!" <${process.env.SMTP_USER || 'marketing@omwhub.com'}>`,
      to: validEmails.join(', '),
      subject: subject || 'A new way to get things done — OMW!',
      html: customHtml || defaultPosterHtml,
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Bulk email sent successfully:', info.messageId);

    if (req.user) {
      logActivity(req.user.id, req.user.name, 'Send Bulk Email', `Sent email to ${validEmails.length} recipients`);
    }

    res.json({
      success: true,
      count: validEmails.length,
      messageId: info.messageId,
      message: `Successfully sent email to ${validEmails.length} recipients!`
    });
  } catch (err) {
    console.error('Send bulk email error:', err);
    res.status(500).json({ error: err.message || 'Failed to send bulk email via Hostinger SMTP' });
  }
});

app.get('/api/activity-logs/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ logs: rows });
  } catch (err) {
    console.error('Fetch activity logs error:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Support Tickets APIs
app.get('/api/support-tickets', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM support_tickets ORDER BY created_at DESC');
    res.json({ tickets: rows });
  } catch (err) {
    console.error('Fetch support tickets error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/support-tickets', authenticateToken, async (req, res) => {
  try {
    const { id, customer, contact, title, category, assignedExecutive, escalationLevel, priority } = req.body;
    await pool.query(
      'INSERT INTO support_tickets (id, customer, contact, title, category, assignedExecutive, escalationLevel, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, customer, contact, title, category, assignedExecutive, escalationLevel, priority, 'Open']
    );
    if (req.app.get('io')) req.app.get('io').emit('support_ticket_created');
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Create support ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.put('/api/support-tickets/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    await pool.query(
      'UPDATE support_tickets SET status = ?, resolutionNotes = ? WHERE id = ?',
      ['Resolved', resolutionNotes, id]
    );
    if (req.app.get('io')) req.app.get('io').emit('support_ticket_updated');
    res.json({ success: true });
  } catch (err) {
    console.error('Resolve support ticket error:', err);
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
});

// Tawk.to Webhook endpoint
app.post('/api/webhooks/tawkto', async (req, res) => {
  try {
    const event = req.body;
    if (event && (event.event === 'chat:end' || event.event === 'ticket:create')) {
      const visitor = event.visitor || {};
      const customerName = visitor.name || 'WhatsApp / Web Visitor';
      const contact = visitor.email || visitor.phone || 'N/A';
      const title = 'Tawk.to Issue from ' + customerName;
      const ticketId = 'TWK-' + Math.floor(1000 + Math.random() * 9000);
      
      await pool.query(
        'INSERT INTO support_tickets (id, customer, contact, title, category, assignedExecutive, escalationLevel, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [ticketId, customerName, contact, title, 'Live Chat / WhatsApp', 'Unassigned', 'Normal', 'Medium', 'Open']
      );
      if (req.app.get('io')) req.app.get('io').emit('support_ticket_created');
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('Tawk.to Webhook Error:', err);
    res.status(500).send('Error');
  }
});

// Serve frontend production build if available
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}



if (!process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OMW CRM Server listening on http://localhost:${PORT}`);
  });
}

export default app;
