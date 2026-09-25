import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastNotification from './components/ToastNotification';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import WorkerManagement from './pages/WorkerManagement';
import BookingManagement from './pages/BookingManagement';
import CustomerSupport from './pages/CustomerSupport';
import PaymentPayout from './pages/PaymentPayout';
import NotificationPage from './pages/NotificationPage';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AttendanceTime from './pages/AttendanceTime';
import CreateLead from './pages/CreateLead';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import { fetchDashboardStats, fetchCrmUsers } from './services/api';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const headerTitles = {
  dashboard: { title: 'Dashboard', subtitle: "Here's an overview of your business today." },
  customers: { title: 'Customer Management', subtitle: 'Manage customer profiles, saved addresses, booking history, ratings, and account status.' },
  workers: { title: 'Worker Management', subtitle: 'Manage service specialists, KYC verification, availability, commission splits, and earnings.' },
  bookings: { title: 'Booking Management', subtitle: 'Track booking status, OTP verification, service completion photos, and payment status.' },
  support: { title: 'Customer Support', subtitle: 'Manage support tickets, complaints, and worker assignment queries.' },
  payments: { title: 'Payment & Payout', subtitle: 'View customer transaction history, razorpay splits, and worker weekly payouts.' },
  notifications: { title: 'Notification', subtitle: 'System notifications, broadcast messages, and operational alerts.' },
  reports: { title: 'Reports & Analytics', subtitle: 'Detailed revenue reports, customer retention, and fulfillment analytics.' },
  attendance: { title: 'Attendance & Time', subtitle: 'Track specialist duty shifts, clock-in times, and active session hours.' },
  'create-lead': { title: 'Lead Management & Quick Call', subtitle: 'Create new customer leads and place direct VoIP calls.' },
  users: { title: 'User & Staff Access Control', subtitle: 'Manage CRM staff accounts, assign custom module access permissions, and manage roles.' }
};

import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';

const DEFAULT_ADMIN = {
  id: "USR-101",
  name: "Admin User",
  email: "admin@omwhub.com",
  role: "Super Administrator",
  status: "Active",
  isAdmin: true,
  avatar: "AD",
  permissions: [
    "dashboard",
    "customers",
    "workers",
    "bookings",
    "support",
    "payments",
    "notifications",
    "reports",
    "attendance",
    "create-lead",
    "users"
  ]
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthLoading, logout, switchUser } = useAuth();
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 && pathParts[2] !== '' ? pathParts[2] : 'dashboard';

  const [dashboardData, setDashboardData] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const [allUsers, setAllUsers] = useState([DEFAULT_ADMIN]);

  const loadData = async () => {
    try {
      const data = await fetchDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsersList = async () => {
    try {
      const res = await fetchCrmUsers();
      const users = res.users || [];
      setAllUsers(users.length ? users : [DEFAULT_ADMIN]);
    } catch (err) {
      console.error(err);
    }
  };

  const socket = useSocket();

  useEffect(() => {
    if (currentUser) {
      loadData();
      loadUsersList();
      
      // Update Tawk.to visitor attributes with logged-in user details
      if (window.Tawk_API) {
        if (typeof window.Tawk_API.setAttributes === 'function') {
          window.Tawk_API.setAttributes({
            name: currentUser.name,
            email: currentUser.email,
            id: currentUser.id
          }, function (error) {});
        } else {
          // If Tawk is still loading, set the visitor object directly
          window.Tawk_API.visitor = {
            name: currentUser.name,
            email: currentUser.email
          };
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    const updateDashboard = () => loadData();
    const updateUsers = () => loadUsersList();

    socket.on('customer_updated', updateDashboard);
    socket.on('worker_updated', updateDashboard);
    socket.on('booking_updated', updateDashboard);
    socket.on('leave_updated', updateDashboard);
    socket.on('attendance_updated', updateDashboard);
    
    socket.on('user_updated', updateUsers);

    return () => {
      socket.off('customer_updated', updateDashboard);
      socket.off('worker_updated', updateDashboard);
      socket.off('booking_updated', updateDashboard);
      socket.off('leave_updated', updateDashboard);
      socket.off('attendance_updated', updateDashboard);
      
      socket.off('user_updated', updateUsers);
    };
  }, [socket]);

  const handleLoginSuccess = (user) => {
    const userPerms = user.permissions || [];
    if (!user.isAdmin && !userPerms.includes('dashboard')) {
      navigate(`/dashboard/${userPerms[0] || 'dashboard'}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // When user switches view (Admin only backend switch)
  const handleSwitchUser = async (user) => {
    try {
      const targetId = typeof user === 'string' ? user : user.id;
      const switchedUser = await switchUser(targetId);
      const userPerms = switchedUser.permissions || [];
      if (!switchedUser.isAdmin && !userPerms.includes(activeTab)) {
        navigate(`/dashboard/${userPerms[0] || 'dashboard'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to switch user account: ' + err.message);
    }
  };

  const currentHeader = headerTitles[activeTab] || headerTitles.dashboard;

  // Route Guard Check
  const hasAccess = currentUser?.isAdmin || (currentUser?.permissions || []).includes(activeTab);

  const dashboardUI = (
    <div className="app-container">
      <Sidebar 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <Header 
          title={currentHeader.title} 
          subtitle={currentHeader.subtitle} 
          onSyncComplete={loadData}
          onOpenCreateLead={() => navigate('/dashboard/create-lead')}
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
        />

        <main>
          {!hasAccess ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              padding: 40
            }}>
              <div style={{
                background: '#FEE2E2',
                padding: 24,
                borderRadius: '50%',
                marginBottom: 20
              }}>
                <ShieldAlert size={56} color="#DC2626" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                Access Restricted / Unauthorized View
              </h2>
              <p style={{ color: '#64748B', maxWidth: 460, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                You are currently logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role}). 
                Admin has not granted you access permission to the <strong>{currentHeader.title}</strong> module.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => navigate(`/dashboard/${currentUser?.permissions?.[0] || 'dashboard'}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}
                >
                  <ArrowLeft size={16} /> Go to Authorized Module
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const admin = allUsers.find(u => u.isAdmin);
                    if (admin) handleSwitchUser(admin);
                  }}
                  style={{ background: 'rgb(56, 74, 102)', padding: '10px 18px', fontSize: 13, cursor: 'pointer' }}
                >
                  Switch Back to Super Admin
                </button>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard data={dashboardData} onNavigate={(tab) => navigate(`/dashboard/${tab}`)} />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="workers" element={<WorkerManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="support" element={<CustomerSupport />} />
              <Route path="payments" element={<PaymentPayout />} />
              <Route path="notifications" element={<NotificationPage />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="attendance" element={<AttendanceTime />} />
              <Route path="users" element={(
                <UserManagement 
                  currentUser={currentUser} 
                  onUsersUpdated={(updatedList) => {
                    setAllUsers(updatedList);
                  }} 
                />
              )} />
              <Route path="create-lead" element={(
                <CreateLead 
                  onCancel={() => navigate('/dashboard')}
                  onSave={() => {
                    alert('Lead saved successfully!');
                    navigate('/dashboard/customers');
                  }}
                />
              )} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          )}
        </main>
      </div>

      <ToastNotification 
        ticket={activeToast} 
        onClose={() => setActiveToast(null)} 
      />
    </div>
  );

  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0F172A', color: '#FFF' }}>Loading Secure Session...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={!currentUser ? <Login type="select" /> : <Navigate to="/dashboard" />} />
      <Route path="/admin" element={!currentUser ? <Login type="admin" onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
      <Route path="/user" element={!currentUser ? <Login type="user" onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard/*" element={currentUser ? dashboardUI : <Navigate to="/" />} />
    </Routes>
  );
}

