import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

const replacements = [
  { regex: /app\.post\('\/api\/customers'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'customer_updated' },
  { regex: /app\.post\('\/api\/workers'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'worker_updated' },
  { regex: /app\.post\('\/api\/bookings'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'booking_updated' },
  { regex: /app\.put\('\/api\/bookings\/:id\/status'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'booking_updated' },
  { regex: /app\.post\('\/api\/attendance\/leaves'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'leave_updated' },
  { regex: /app\.put\('\/api\/attendance\/leaves\/:id\/status'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'leave_updated' },
  { regex: /app\.post\('\/api\/attendance\/mark'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'attendance_updated' },
  { regex: /app\.post\('\/api\/crm-users'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'user_updated' },
  { regex: /app\.put\('\/api\/crm-users\/:id'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'user_updated' },
  { regex: /app\.delete\('\/api\/crm-users\/:id'.*?\{([\s\S]*?)res\.json\((.*?)\);/g, event: 'user_updated' }
];

replacements.forEach(({ regex, event }) => {
  content = content.replace(regex, (match, p1, p2) => {
    // Prevent double adding
    if (match.includes(`req.app.get('io')`)) return match;
    return match + `\n    if (req.app.get('io')) { req.app.get('io').emit('${event}'); }`;
  });
});

fs.writeFileSync('server.js', content);
console.log('Successfully updated server.js with Socket.io emits!');
