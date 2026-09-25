import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  User, 
  Calendar, 
  MessageSquare, 
  IndianRupee, 
  Bell, 
  BarChart3, 
  Timer,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'customers', label: 'Customer Management', icon: Users },
  { id: 'workers', label: 'Worker Management', icon: User },
  { id: 'bookings', label: 'Booking Management', icon: Calendar },
  { id: 'support', label: 'Customer Support', icon: MessageSquare },
  { id: 'payments', label: 'Payment & Payout', icon: IndianRupee },
  { id: 'notifications', label: 'Notification', icon: Bell, iconColor: '#F59E0B' },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'attendance', label: 'Attendance & Time', icon: Timer },
  { id: 'users', label: 'User & Staff Access', icon: ShieldCheck, iconColor: '#EF4444' }
];

export default function Sidebar({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current tab from URL (e.g. /dashboard/users -> users)
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts.length > 2 && pathParts[2] !== '' ? pathParts[2] : 'dashboard';
  // Filter menu items by user permissions
  const userPermissions = currentUser?.permissions || menuItems.map(i => i.id);
  const visibleItems = menuItems.filter(item => 
    currentUser?.isAdmin || userPermissions.includes(item.id)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-text">omw!</span>
      </div>

      <nav>
        <ul className="nav-menu">
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.id === 'dashboard' ? '/dashboard' : `/dashboard/${item.id}`)}
                >
                  <IconComponent 
                    className="nav-icon" 
                    style={{ color: isActive ? 'rgb(56, 74, 102)' : item.iconColor || 'inherit' }}
                  />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

