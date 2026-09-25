import fs from 'fs';
import path from 'path';

const pagesDir = path.join('src', 'pages');

const pagesToUpdate = [
  { file: 'Dashboard.jsx', events: ['customer_updated', 'worker_updated', 'booking_updated', 'leave_updated', 'attendance_updated', 'user_updated'], dataFunc: 'loadDashboardData' },
  { file: 'CustomerManagement.jsx', events: ['customer_updated'], dataFunc: 'loadCustomers' },
  { file: 'WorkerManagement.jsx', events: ['worker_updated'], dataFunc: 'loadWorkers' },
  { file: 'BookingManagement.jsx', events: ['booking_updated'], dataFunc: 'loadBookings' },
  { file: 'AttendanceTime.jsx', events: ['attendance_updated', 'leave_updated'], dataFunc: 'loadData' },
  { file: 'UserManagement.jsx', events: ['user_updated'], dataFunc: 'loadUsers' }
];

pagesToUpdate.forEach(({ file, events, dataFunc }) => {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has useSocket
  if (content.includes('useSocket')) return;

  // 1. Add import for useSocket
  content = content.replace(/import React(.*?);/, (match) => {
    return `${match}\nimport { useSocket } from '../context/SocketContext';`;
  });

  // 2. Insert useSocket initialization inside the component
  const componentNameMatch = content.match(/export default function ([A-Za-z0-9_]+)/);
  if (componentNameMatch) {
    const componentName = componentNameMatch[1];
    const funcRegex = new RegExp(`export default function ${componentName}\\(.*?\\) \\{`);
    
    // Inject the socket listener after the component declaration
    content = content.replace(funcRegex, (match) => {
      const listeners = events.map(ev => `      socket.on('${ev}', ${dataFunc});`).join('\n');
      const cleanups = events.map(ev => `      socket.off('${ev}', ${dataFunc});`).join('\n');
      
      return `${match}\n  const socket = useSocket();\n\n  useEffect(() => {\n    if (!socket) return;\n${listeners}\n    return () => {\n${cleanups}\n    };\n  }, [socket]);\n`;
    });
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file} with socket listeners.`);
});

console.log('Successfully injected socket listeners into all pages!');
