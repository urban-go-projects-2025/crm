import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

// 1. Add activity_logs table to initializeDB
if (!content.includes('CREATE TABLE IF NOT EXISTS activity_logs')) {
  content = content.replace(
    /console\.log\('leave_requests and attendance_logs tables verified'\);/,
    `await pool.query(\`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        action_type VARCHAR(100) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    console.log('activity_logs table verified');
    console.log('leave_requests and attendance_logs tables verified');`
  );
}

// 2. Add logActivity helper function
if (!content.includes('const logActivity = async')) {
  content = content.replace(
    /const initializeDB = async \(\) => \{/,
    `const logActivity = async (userId, userName, actionType, description) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, user_name, action_type, description) VALUES (?, ?, ?, ?)',
      [userId, userName, actionType, description]
    );
  } catch (err) {
    console.error('Activity Logging Error:', err);
  }
};

const initializeDB = async () => {`
  );
}

// 3. Add GET endpoint for activity logs
if (!content.includes('/api/activity-logs/:userId')) {
  content = content.replace(
    /server\.listen/,
    `app.get('/api/activity-logs/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json({ logs: rows });
  } catch (err) {
    console.error('Fetch activity logs error:', err);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});\n\n$&`
  );
}

// 4. Inject logActivity into Login routes
content = content.replace(/app\.post\('\/api\/auth\/admin-login'.*?\{([\s\S]*?)res\.json\(\{ user, token \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ user, token \}\);/, `logActivity(user.id, user.name, 'Login', 'Admin logged into the CRM');\n    res.json({ user, token });`);
});

content = content.replace(/app\.post\('\/api\/auth\/user-login'.*?\{([\s\S]*?)res\.json\(\{ user, token \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ user, token \}\);/, `logActivity(user.id, user.name, 'Login', 'User logged into the CRM');\n    res.json({ user, token });`);
});

// 5. Inject into Logout route
content = content.replace(/app\.post\('\/api\/auth\/logout'.*?\{([\s\S]*?)res\.json\(\{ success: true, message: 'Logged out successfully' \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  // Make logout use authenticateToken if not already to get req.user
  return match.replace(/res\.json\(\{ success: true, message: 'Logged out successfully' \}\);/, `if (req.user) { logActivity(req.user.id, req.user.name, 'Logout', 'User logged out'); }\n    res.json({ success: true, message: 'Logged out successfully' });`);
});

// 6. Inject into other critical routes (assuming req.user is available via authenticateToken)
content = content.replace(/app\.post\('\/api\/customers'.*?\{([\s\S]*?)res\.json\(\{ success: true, customer: newCustomer \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ success: true, customer: newCustomer \}\);/, `if (req.user) { logActivity(req.user.id, req.user.name, 'Create Customer', 'Added new customer: ' + name); }\n    res.json({ success: true, customer: newCustomer });`);
});

content = content.replace(/app\.post\('\/api\/bookings'.*?\{([\s\S]*?)res\.json\(\{ success: true, booking: newBooking \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ success: true, booking: newBooking \}\);/, `if (req.user) { logActivity(req.user.id, req.user.name, 'Create Booking', 'Created new booking for ' + customerName); }\n    res.json({ success: true, booking: newBooking });`);
});

content = content.replace(/app\.put\('\/api\/bookings\/:id\/status'.*?\{([\s\S]*?)res\.json\(\{ success: true, message: 'Booking status updated' \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ success: true, message: 'Booking status updated' \}\);/, `if (req.user) { logActivity(req.user.id, req.user.name, 'Update Booking', 'Updated booking status to ' + status); }\n    res.json({ success: true, message: 'Booking status updated' });`);
});

content = content.replace(/app\.post\('\/api\/attendance\/mark'.*?\{([\s\S]*?)res\.json\(\{ success: true, id: result\.insertId \}\);/g, (match) => {
  if (match.includes('logActivity')) return match;
  return match.replace(/res\.json\(\{ success: true, id: result\.insertId \}\);/, `if (req.user) { logActivity(req.user.id, req.user.name, 'Mark Attendance', 'Action: ' + actionType); }\n    res.json({ success: true, id: result.insertId });`);
});

fs.writeFileSync('server.js', content);
console.log('Successfully injected Activity Logger into server.js!');
