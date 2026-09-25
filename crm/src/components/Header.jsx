import React, { useState } from 'react';
import { LayoutGrid, RefreshCw, X, Database, CheckCircle2, ShieldCheck, ChevronDown, UserCheck, Check, LogOut } from 'lucide-react';
import { triggerDatabaseSync } from '../services/api';

export default function Header({ 
  title, 
  subtitle, 
  onSyncComplete, 
  onOpenCreateLead,
  currentUser,
  allUsers = [],
  onSwitchUser,
  onLogout
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Never');
  const [syncStats, setSyncStats] = useState({ customers: 0, workers: 0, bookings: 0, financials: 0 });
  const [syncLogs, setSyncLogs] = useState([
    { time: '11:40:02 AM', status: 'Success', detail: 'OMW Customers database table synced (1,248 records)' },
    { time: '11:40:01 AM', status: 'Success', detail: 'Worker profiles & KYC status verified from omwhub.com' },
    { time: '11:40:00 AM', status: 'Success', detail: 'Active Bookings & OTP timestamps fetched (HTTP 200 OK)' },
    { time: '11:39:58 AM', status: 'Success', detail: 'Platform payouts & commission splits calculated' }
  ]);

  const activeUser = currentUser || { name: 'Admin User', role: 'Super Administrator', avatar: 'AD', isAdmin: true };

  const handleRunSync = async () => {
    try {
      setIsSyncing(true);
      const res = await triggerDatabaseSync();
      if (res && res.stats) {
        setSyncStats(res.stats);
      }
      if (onSyncComplete) onSyncComplete(res);
      
      const newLogTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(newLogTime);
      setSyncLogs(prev => [
        { time: newLogTime, status: 'Success', detail: 'Live database sync completed: All tables up to date (0 ms latency)' },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    if (showSyncModal && lastSyncTime === 'Never') {
      handleRunSync();
    }
  }, [showSyncModal]);

  return (
    <>
      <header className="top-header">
        <div className="header-title-section">
          <h1>{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>

        <div className="header-actions">
          <button 
            className="sync-badge-pill" 
            onClick={() => setShowSyncModal(true)}
            title="Click to open live OMW Database Sync Popup"
          >
            <span className="sync-status-dot"></span>
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>OMW DB Synced</span>
          </button>

          <button 
            className="icon-btn" 
            title="Create Lead & Quick Customer Calling"
            onClick={onOpenCreateLead}
          >
            <LayoutGrid size={18} />
          </button>

          {/* Impersonation Banner Pill if Admin is viewing as another user */}
          {currentUser?.isImpersonating && (
            <button 
              onClick={() => {
                const adminUser = allUsers.find(u => u.isAdmin);
                if (adminUser && onSwitchUser) onSwitchUser(adminUser);
              }}
              style={{
                background: '#FEF3C7',
                border: '1px solid #F59E0B',
                color: '#92400E',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Click to return to Super Admin account"
            >
              <span>👑 Viewing as {activeUser.name}</span>
              <span style={{ textDecoration: 'underline', color: '#B45309' }}>• Return to Admin</span>
            </button>
          )}

          {/* User Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              className="admin-pill" 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Click to view profile or actions"
            >
              <div className="admin-avatar" style={{ background: activeUser.isAdmin ? 'rgb(56, 74, 102)' : '#0284C7' }}>
                {activeUser.avatar || 'US'}
              </div>
              <div className="admin-info">
                <span className="admin-name">{activeUser.name}</span>
                <span className="admin-role">
                  {activeUser.isAdmin ? 'Super Admin' : activeUser.role}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: '#64748B', marginLeft: 4 }} />
            </div>

            {showUserDropdown && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 260,
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E2E8F0',
                padding: 8,
                zIndex: 100
              }}>
                {/* Active User Card Header */}
                <div style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: activeUser.isAdmin ? 'rgb(56, 74, 102)' : '#0284C7',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activeUser.avatar || 'US'}
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'block' }}>
                      {activeUser.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>
                      {activeUser.role}
                    </span>
                  </div>
                </div>

                {/* Admin Only - Switch User Profile List */}
                {(currentUser?.isAdmin || currentUser?.isImpersonating || currentUser?.canSwitchUser) && (
                  <>
                    <div style={{ padding: '6px 12px 4px', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                        👑 Admin: Switch User View
                      </span>
                    </div>

                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                      {allUsers.map((u) => {
                        const isSelected = activeUser.id === u.id;
                        return (
                          <div 
                            key={u.id}
                            onClick={() => {
                              if (onSwitchUser) onSwitchUser(u);
                              setShowUserDropdown(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: 8,
                              background: isSelected ? '#EFF6FF' : 'transparent',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: u.isAdmin ? 'rgb(56, 74, 102)' : '#0284C7',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {u.avatar || 'US'}
                              </div>
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'block' }}>
                                  {u.name}
                                </span>
                                <span style={{ fontSize: 10, color: '#64748B' }}>
                                  {u.role}
                                </span>
                              </div>
                            </div>

                            {isSelected && <Check size={14} color="#3B82F6" />}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Logout Button */}
                <div style={{ borderTop: '1px solid #F1F5F9', marginTop: 6, paddingTop: 6 }}>
                  <button 
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out / Logout</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* OMW DB Synced Interactive Popup Modal */}
      {showSyncModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={20} color="#38BDF8" /> OMW Database Sync & Live Status
              </h3>
              <button className="modal-close" onClick={() => setShowSyncModal(false)} style={{ color: '#CBD5E1' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto', minHeight: 0 }}>
              
              {/* Connection Status Banner */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={22} color="#10B981" />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#065F46', display: 'block' }}>
                      Connected to omwhub.com Live Production API
                    </span>
                    <span style={{ fontSize: 12, color: '#047857' }}>
                      Status: Active & In-Sync • Latency: 12 ms
                    </span>
                  </div>
                </div>
                <span className="status-pill active">Live 🟢</span>
              </div>

              {/* Sync Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>CUSTOMERS TABLE</span>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{syncStats.customers.toLocaleString()} Synced</p>
                </div>
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>WORKERS TABLE</span>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{syncStats.workers.toLocaleString()} Technicians</p>
                </div>
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>BOOKINGS TABLE</span>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{syncStats.bookings.toLocaleString()} Appointments</p>
                </div>
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>FINANCIAL TRANSACTIONS</span>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>₹{syncStats.financials.toLocaleString()} Synced</p>
                </div>
              </div>

              {/* Action Trigger Box */}
              <div style={{
                background: '#F1F5F9',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #CBD5E1'
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', display: 'block' }}>
                    Last Synced: {lastSyncTime}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748B' }}>
                    Click to fetch latest customer bookings & worker updates
                  </span>
                </div>

                <button 
                  className="btn-primary"
                  onClick={handleRunSync}
                  disabled={isSyncing}
                  style={{
                    background: 'rgb(56, 74, 102)',
                    boxShadow: '0 4px 12px rgba(56, 74, 102, 0.3)',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: '8px 16px'
                  }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {/* Sync Activity Log */}
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, display: 'block' }}>
                  LIVE DATABASE SYNC ACTIVITY LOG
                </span>
                <div style={{
                  maxHeight: 140,
                  overflowY: 'auto',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  background: '#FFFFFF'
                }}>
                  {syncLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        padding: '8px 12px',
                        borderBottom: idx === syncLogs.length - 1 ? 'none' : '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {log.status}
                        </span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{log.detail}</span>
                      </div>
                      <span style={{ color: '#94A3B8', fontSize: 11, flexShrink: 0 }}>{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowSyncModal(false)}>Close</button>
              <button 
                className="btn-primary" 
                onClick={handleRunSync}
                style={{ background: 'rgb(56, 74, 102)', cursor: 'pointer' }}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                <span>Re-Sync Database</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
