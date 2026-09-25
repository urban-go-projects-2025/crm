import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  KeyRound, 
  Users, 
  Lock, 
  CheckSquare,
  Square,
  Activity
} from 'lucide-react';
import { fetchCrmUsers, createCrmUser, updateCrmUser, deleteCrmUser, fetchActivityLogs } from '../services/api';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard', color: '#3B82F6' },
  { id: 'customers', label: 'Customer Management', color: '#10B981' },
  { id: 'workers', label: 'Worker Management', color: '#F59E0B' },
  { id: 'bookings', label: 'Booking Management', color: '#8B5CF6' },
  { id: 'support', label: 'Customer Support', color: '#EC4899' },
  { id: 'payments', label: 'Payment & Payout', color: '#06B6D4' },
  { id: 'notifications', label: 'Notification', color: '#EAB308' },
  { id: 'reports', label: 'Reports & Analytics', color: '#6366F1' },
  { id: 'attendance', label: 'Attendance & Time', color: '#14B8A6' },
  { id: 'create-lead', label: 'Lead Management', color: '#F97316' },
  { id: 'users', label: 'User & Staff Access', color: '#EF4444' }
];

const PRESETS = {
  admin: {
    name: 'Super Admin (Full Access)',
    permissions: ALL_MODULES.map(m => m.id)
  },
  support: {
    name: 'Support Executive',
    permissions: ['dashboard', 'customers', 'support', 'notifications']
  },
  operations: {
    name: 'Operations Lead',
    permissions: ['dashboard', 'workers', 'bookings', 'attendance', 'create-lead']
  },
  finance: {
    name: 'Finance Manager',
    permissions: ['dashboard', 'payments', 'reports']
  }
};

export default function UserManagement({ currentUser, onUsersUpdated }) {
  const socket = useSocket();
  const { switchUser } = useAuth();

  useEffect(() => {
    if (!socket) return;
      socket.on('user_updated', loadUsers);
    return () => {
      socket.off('user_updated', loadUsers);
    };
  }, [socket]);

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityUser, setActivityUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const openActivityModal = async (user) => {
    setActivityUser(user);
    setShowActivityModal(true);
    setLoadingActivity(true);
    try {
      const data = await fetchActivityLogs(user.id);
      setActivityLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPermissions, setFormPermissions] = useState(['dashboard']);
  const [formStatus, setFormStatus] = useState('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchCrmUsers();
      setUsersList(data.users || []);
      if (onUsersUpdated) onUsersUpdated(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('');
    setFormPermissions(['dashboard']);
    setFormStatus('Active');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setFormRole(user.role || '');
    setFormPermissions(user.permissions || []);
    setFormStatus(user.status || 'Active');
    setShowModal(true);
  };

  const togglePermission = (modId) => {
    if (formPermissions.includes(modId)) {
      setFormPermissions(formPermissions.filter(p => p !== modId));
    } else {
      setFormPermissions([...formPermissions, modId]);
    }
  };

  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey];
    if (p) {
      setFormPermissions([...p.permissions]);
      if (presetKey === 'support') setFormRole('Support Executive');
      if (presetKey === 'operations') setFormRole('Operations Lead');
      if (presetKey === 'finance') setFormRole('Finance Manager');
      if (presetKey === 'admin') setFormRole('Super Administrator');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert('Please fill in required fields (Name & Email)');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        permissions: formPermissions,
        status: formStatus
      };

      if (editingUser) {
        await updateCrmUser(editingUser.id, payload);
      } else {
        await createCrmUser(payload);
      }

      setShowModal(false);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to save user permissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.isAdmin) {
      alert('Super Admin user account cannot be deleted!');
      return;
    }
    if (confirm(`Are you sure you want to remove ${user.name}?`)) {
      try {
        await deleteCrmUser(user.id);
        await loadUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalStaff = usersList.length;
  const adminCount = usersList.filter(u => u.isAdmin || u.permissions?.length === ALL_MODULES.length).length;
  const customCount = totalStaff - adminCount;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      
      {/* Top Banner & Action - PREMIUM REDESIGN */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 24,
        padding: '36px 40px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative ambient lighting */}
        <div style={{ position: 'absolute', right: '10%', top: '-50%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', left: '20%', bottom: '-50%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
            padding: 18,
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <ShieldCheck size={36} color="#38BDF8" style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              User & Staff Access Control
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 15, color: '#94A3B8', fontWeight: 500, maxWidth: 500, lineHeight: 1.5 }}>
              Master dashboard to create accounts and securely assign custom module-level permissions across your organization.
            </p>
          </div>
        </div>

        <button 
          className="btn-primary"
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 15,
            padding: '16px 28px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.4)'; }}
        >
          <UserPlus size={20} />
          <span>Create New Staff User</span>
        </button>
      </div>

      {/* Overview Stats Cards - PREMIUM REDESIGN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div style={{ 
          background: '#FFFFFF', padding: '28px 32px', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', 
          display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', padding: 18, borderRadius: 20, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
            <Users size={32} color="#2563EB" />
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Staff</span>
            <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>{totalStaff} <span style={{fontSize:16, color:'#94A3B8', fontWeight: 600}}>Accounts</span></h3>
          </div>
        </div>

        <div style={{ 
          background: '#FFFFFF', padding: '28px 32px', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', 
          display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', padding: 18, borderRadius: 20, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
            <ShieldCheck size={32} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Super Admins</span>
            <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>{adminCount} <span style={{fontSize:16, color:'#94A3B8', fontWeight: 600}}>Full Access</span></h3>
          </div>
        </div>

        <div style={{ 
          background: '#FFFFFF', padding: '28px 32px', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', 
          display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)'; }}
        >
          <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: 18, borderRadius: 20, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
            <KeyRound size={32} color="#D97706" />
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Staff</span>
            <h3 style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: '-1px' }}>{customCount} <span style={{fontSize:16, color:'#94A3B8', fontWeight: 600}}>Restricted</span></h3>
          </div>
        </div>
      </div>

      {/* Users List Section - PREMIUM REDESIGN */}
      <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
        
        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text" 
              placeholder="Search staff user by name, email, or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: 14,
                border: '1px solid #CBD5E1',
                fontSize: 14,
                outline: 'none',
                background: '#F8FAFC',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
              onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600, background: '#F1F5F9', padding: '8px 16px', borderRadius: 20 }}>
            Showing <span style={{ color: '#0F172A', fontWeight: 800 }}>{filteredUsers.length}</span> staff accounts
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '16px 20px', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px' }}>User & Email</th>
                <th style={{ padding: '16px 20px', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px' }}>Role / Designation</th>
                <th style={{ padding: '16px 20px', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px' }}>Assigned Modules</th>
                <th style={{ padding: '16px 20px', fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>
                    Loading staff user permissions...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>
                    No users found. Click "Create New Staff User" to add one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userPerms = u.permissions || [];
                  const isFullAdmin = u.isAdmin || userPerms.length === ALL_MODULES.length;

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: isFullAdmin ? 'rgb(56, 74, 102)' : '#0284C7',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13
                          }}>
                            {u.avatar || 'US'}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                              {u.name} {u.isAdmin && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>SUPER ADMIN</span>}
                            </span>
                            <span style={{ fontSize: 12, color: '#64748B' }}>{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{u.role}</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          background: u.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                          color: u.status === 'Active' ? '#15803D' : '#B91C1C'
                        }}>
                          {u.status}
                        </span>
                      </td>

                      {/* Permissions Pills */}
                      <td style={{ padding: '16px 20px', maxWidth: 460 }}>
                        {isFullAdmin ? (
                          <span style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0369A1', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(186, 230, 253, 0.5)' }}>
                            <ShieldCheck size={16} /> Full Access (All 11 Modules)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {userPerms.map((pId) => {
                              const mod = ALL_MODULES.find(m => m.id === pId);
                              return (
                                <span 
                                  key={pId}
                                  style={{
                                    background: '#F1F5F9',
                                    color: '#334155',
                                    border: `1px solid ${mod?.color || '#CBD5E1'}`,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600
                                  }}
                                >
                                  {mod?.label || pId}
                                </span>
                              );
                            })}
                            {userPerms.length === 0 && (
                              <span style={{ color: '#EF4444', fontSize: 11, fontWeight: 600 }}>No Modules Granted</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                          {(currentUser?.isAdmin || currentUser?.isImpersonating || currentUser?.canSwitchUser) && u.id !== currentUser?.id && (
                            <button 
                              onClick={async () => {
                                try {
                                  await switchUser(u.id);
                                } catch (err) {
                                  alert('Failed to switch user: ' + err.message);
                                }
                              }}
                              title={`Log into / view account as ${u.name}`}
                              style={{ 
                                background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '8px 14px', borderRadius: 8, 
                                fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                            >
                              <KeyRound size={16} />
                              <span>Login as User</span>
                            </button>
                          )}

                          <button 
                            onClick={() => openActivityModal(u)}
                            title="View Activity Logs"
                            style={{ 
                              background: '#F0FDF4', color: '#166534', border: 'none', padding: '8px 14px', borderRadius: 8, 
                              fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#DCFCE7'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#F0FDF4'; }}
                          >
                            <Activity size={16} />
                            <span>Activity Log</span>
                          </button>

                          <button 
                            onClick={() => openEditModal(u)}
                            title="Edit User Access Permissions"
                            style={{ 
                              background: '#F1F5F9', color: '#334155', border: 'none', padding: '8px 14px', borderRadius: 8, 
                              fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                          >
                            <Edit3 size={16} />
                            <span>Edit Access</span>
                          </button>

                          {!u.isAdmin && (
                            <button 
                              onClick={() => handleDelete(u)}
                              title="Remove Staff User"
                              style={{
                                background: '#FEF2F2',
                                color: '#EF4444',
                                border: 'none',
                                padding: '8px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE / EDIT USER MODAL */}
      {/* CREATE / EDIT USER MODAL - PREMIUM REDESIGN */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24
        }}>
          <div style={{ 
            width: '100%',
            maxWidth: 680, 
            maxHeight: '90vh', 
            background: '#FFFFFF',
            borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            
            {/* Modal Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 12 }}>
                  <KeyRound size={24} color="#38BDF8" />
                </div>
                <div>
                  <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: 20, fontWeight: 800 }}>
                    {editingUser ? 'Edit Access Permissions' : 'Create Staff Account'}
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                    {editingUser ? `Updating access for ${editingUser.name}` : 'Provision a new secure account'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#FFFFFF', 
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                
                {/* Inputs Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Rahul Verma"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, background: '#F8FAFC', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                        onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="rahul@omwhub.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, background: '#F8FAFC', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                        onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: editingUser ? '1fr 1fr 1fr' : '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Role Title
                      </label>
                      <input 
                        type="text" 
                        placeholder="Staff Member"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, background: '#F8FAFC', outline: 'none', transition: 'all 0.2s', fontWeight: 500 }}
                        onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                        Login Password *
                      </label>
                      <input 
                        type="password" 
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep unchanged" : "Enter secure password"}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, background: '#F8FAFC', outline: 'none', transition: 'all 0.2s', fontWeight: 500, fontFamily: 'monospace' }}
                        onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>

                    {editingUser && (
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                          Account Status
                        </label>
                        <select 
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value)}
                          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #CBD5E1', fontSize: 14, background: '#F8FAFC', outline: 'none', transition: 'all 0.2s', fontWeight: 600, color: formStatus === 'Active' ? '#10B981' : '#EF4444', cursor: 'pointer' }}
                          onFocus={(e) => { e.target.style.borderColor = '#38BDF8'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 4px rgba(56, 189, 248, 0.1)'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                        >
                          <option value="Active">🟢 Active</option>
                          <option value="Suspended">🔴 Suspended</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: 1, background: '#E2E8F0', width: '100%' }}></div>

                {/* Module Access Checkboxes List */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', display: 'block' }}>
                        Module Access Permissions
                      </label>
                      <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                        Select the areas of the CRM this user can view and edit. ({formPermissions.length} / {ALL_MODULES.length} Granted)
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (formPermissions.length === ALL_MODULES.length) {
                          setFormPermissions([]);
                        } else {
                          setFormPermissions(ALL_MODULES.map(m => m.id));
                        }
                      }}
                      style={{ 
                        background: '#EFF6FF', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 700, 
                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                    >
                      {formPermissions.length === ALL_MODULES.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 12,
                  }}>
                    {ALL_MODULES.map((mod) => {
                      const isChecked = formPermissions.includes(mod.id);
                      return (
                        <div 
                          key={mod.id}
                          onClick={() => togglePermission(mod.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 16px',
                            borderRadius: 14,
                            background: isChecked ? `${mod.color}15` : '#FFFFFF',
                            border: `2px solid ${isChecked ? mod.color : '#E2E8F0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: isChecked ? `0 4px 12px ${mod.color}20` : 'none',
                            transform: isChecked ? 'translateY(-2px)' : 'translateY(0)'
                          }}
                        >
                          {isChecked ? (
                            <CheckSquare size={20} color={mod.color} style={{ flexShrink: 0 }} />
                          ) : (
                            <Square size={20} color="#CBD5E1" style={{ flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: 14,
                            fontWeight: isChecked ? 700 : 600,
                            color: isChecked ? '#0F172A' : '#64748B',
                            lineHeight: 1.2
                          }}>
                            {mod.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 16,
                flexShrink: 0
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    background: 'transparent', color: '#64748B', border: 'none', transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0F172A'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 15,
                    padding: '14px 28px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)',
                    transition: 'all 0.2s',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Check size={18} />
                  <span>{isSubmitting ? 'Saving...' : editingUser ? 'Update Permissions' : 'Create Staff Account'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Activity Timeline Modal */}
      {showActivityModal && activityUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', width: 600, maxWidth: '90%', borderRadius: 24, padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Activity size={24} color="#0EA5E9" />
                  Activity Timeline
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>Tracking actions for <strong>{activityUser.name}</strong></p>
              </div>
              <button onClick={() => setShowActivityModal(false)} style={{ background: '#F1F5F9', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            {loadingActivity ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading timeline...</div>
            ) : activityLogs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: 16 }}>
                No activity recorded yet for this user.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 20 }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: 27, top: 10, bottom: 10, width: 2, background: '#E2E8F0' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {activityLogs.map((log) => {
                    const dateObj = new Date(log.timestamp);
                    const isLoginOut = log.action_type === 'Login' || log.action_type === 'Logout';
                    return (
                      <div key={log.id} style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                          width: 16, height: 16, borderRadius: '50%', 
                          background: isLoginOut ? '#0EA5E9' : '#10B981', 
                          border: '4px solid #FFFFFF', 
                          boxShadow: '0 0 0 1px #E2E8F0',
                          marginTop: 4
                        }}></div>
                        <div style={{ flex: 1, background: '#F8FAFC', padding: '12px 16px', borderRadius: 12, border: '1px solid #F1F5F9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>{log.action_type}</span>
                            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({dateObj.toLocaleDateString()})</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>{log.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
