import React, { useState } from 'react';
import { Bell, MessageSquare, Send, Mail, Search, Plus, X, CheckCircle2 } from 'lucide-react';

export default function NotificationPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // Modal states
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [composeForm, setComposeForm] = useState({
    targetAudience: 'All Customers',
    title: '',
    category: 'Promotional',
    message: '',
    channels: {
      app: true,
      sms: true,
      whatsapp: true,
      email: true
    }
  });

  const [notifications, setNotifications] = useState([
    {
      id: "NTF-3001",
      targetAudience: "All Customers",
      title: "Home Deep Cleaning Festival Discount Offer",
      category: "Promotional",
      channels: "App 🔔, Email ✉️, SMS 📱, WhatsApp 💬",
      status: "Delivered",
      dateTime: "27 Aug 2026, 10:00 AM",
      messageBody: "Get 20% OFF on all Home Deep Cleaning and AC Servicing packages this week! Use code FESTIVAL20 on OMW Hub."
    },
    {
      id: "NTF-3002",
      targetAudience: "Active Workers",
      title: "System Maintenance Alert: App Update at 02:00 AM",
      category: "System Alert",
      channels: "App 🔔, SMS 📱",
      status: "Delivered",
      dateTime: "26 Aug 2026, 08:30 PM",
      messageBody: "Important Notice: OMW Worker App will be down for scheduled database maintenance tonight from 02:00 AM to 03:00 AM."
    },
    {
      id: "NTF-3003",
      targetAudience: "Rahul Sharma (Customer)",
      title: "Booking OTP: 4920 for AC Servicing with Priya Singh",
      category: "OTP & Booking",
      channels: "SMS 📱, WhatsApp 💬",
      status: "Delivered",
      dateTime: "26 Aug 2026, 02:15 PM",
      messageBody: "Your OTP for AC Servicing booking #OMW-84920 is 4920. Please share with specialist Priya Singh upon arrival."
    },
    {
      id: "NTF-3004",
      targetAudience: "All Service Workers",
      title: "Weekly Commission & Payout Disbursement Completed",
      category: "System Alert",
      channels: "App 🔔, Email ✉️",
      status: "Delivered",
      dateTime: "25 Aug 2026, 05:00 PM",
      messageBody: "Weekly earnings split payout of ₹1,42,800 has been transferred directly to verified Razorpay worker bank accounts."
    },
    {
      id: "NTF-3005",
      targetAudience: "VIP Customers",
      title: "Exclusive Appliance Repair Package Invitation",
      category: "Promotional",
      channels: "Email ✉️, WhatsApp 💬",
      status: "Pending",
      dateTime: "24 Aug 2026, 11:00 AM",
      messageBody: "Exclusive invitation for OMW Platinum members: Priority 30-minute technician arrival for all home appliance repairs."
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleComposeSubmit = (e) => {
    e.preventDefault();
    if (!composeForm.title.trim()) return;

    const selectedChannelsList = [];
    if (composeForm.channels.app) selectedChannelsList.push('App 🔔');
    if (composeForm.channels.email) selectedChannelsList.push('Email ✉️');
    if (composeForm.channels.sms) selectedChannelsList.push('SMS 📱');
    if (composeForm.channels.whatsapp) selectedChannelsList.push('WhatsApp 💬');

    const newNotification = {
      id: `NTF-${Math.floor(3000 + Math.random() * 900)}`,
      targetAudience: composeForm.targetAudience,
      title: composeForm.title,
      category: composeForm.category,
      channels: selectedChannelsList.join(', '),
      status: 'Delivered',
      dateTime: '27 Aug 2026, Just Now',
      messageBody: composeForm.message || composeForm.title
    };

    setNotifications([newNotification, ...notifications]);
    setShowComposeModal(false);
    setComposeForm({
      targetAudience: 'All Customers',
      title: '',
      category: 'Promotional',
      message: '',
      channels: { app: true, sms: true, whatsapp: true, email: true }
    });
    showToast(`Broadcast notification "${newNotification.title}" sent successfully!`);
  };

  const handleResend = (notif) => {
    showToast(`Notification ${notif.id} ("${notif.title}") resent to ${notif.targetAudience}!`);
  };

  const filtered = notifications.filter(n => {
    const matchesSearch = n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.targetAudience.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All Categories' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-content" style={{ paddingBottom: 32 }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 14
        }}>
          <CheckCircle2 size={18} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Sent</span>
            <span className="stat-value">1,420</span>
            <span className="stat-subtext">Across SMS, Email, Push & WhatsApp</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Bell size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">WhatsApp Delivered</span>
            <span className="stat-value">580</span>
            <span className="stat-subtext">WhatsApp API integrations</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">SMS / OTP Triggers</span>
            <span className="stat-value">890</span>
            <span className="stat-subtext">Verification & OTP alerts</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 74, 102, 0.12)', color: 'rgb(56, 74, 102)' }}>
            <Send size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Email Campaigns</span>
            <span className="stat-value">420</span>
            <span className="stat-subtext">Invoices & promotional newsletters</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 74, 102, 0.12)', color: 'rgb(56, 74, 102)' }}>
            <Mail size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-section">
        <div className="controls-bar">
          <div className="search-input-wrapper">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text"
              placeholder="Search notification title, channel, or audience..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="select-dropdown"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Promotional">Promotional</option>
              <option value="System Alert">System Alert</option>
              <option value="OTP & Booking">OTP & Booking</option>
            </select>

            <button 
              className="btn-primary"
              onClick={() => setShowComposeModal(true)}
              style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.3)', cursor: 'pointer' }}
            >
              <Plus size={18} />
              <span>Compose Notification</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Target Audience</th>
                <th>Title / Subject</th>
                <th>Category</th>
                <th>Supported Channels</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{n.id}</td>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{n.targetAudience}</td>
                  <td style={{ fontWeight: 600, color: '#334155', maxWidth: 220 }}>{n.title}</td>

                  <td>
                    <span className="badge-outline" style={{ background: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1' }}>
                      {n.category}
                    </span>
                  </td>

                  <td style={{ fontSize: 12, color: '#475569' }}>{n.channels}</td>

                  <td>
                    <span className={`status-pill ${n.status === 'Delivered' ? 'completed' : 'pending'}`}>
                      {n.status}
                    </span>
                  </td>

                  <td style={{ fontSize: 12, color: '#64748B' }}>{n.dateTime}</td>

                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn-secondary"
                        onClick={() => setViewingNotification(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        View
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleResend(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        Resend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Compose Notification Modal Popup (Dark Navy Theme) */}
      {showComposeModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF' }}>Compose Broadcast Notification</h3>
              <button className="modal-close" onClick={() => setShowComposeModal(false)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleComposeSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="form-group">
                  <label>Target Audience</label>
                  <select 
                    className="form-control"
                    value={composeForm.targetAudience}
                    onChange={e => setComposeForm({ ...composeForm, targetAudience: e.target.value })}
                  >
                    <option value="All Customers">All Customers (Registered App Users)</option>
                    <option value="Active Workers">All Active Service Workers</option>
                    <option value="VIP Customers">VIP / Platinum Subscription Customers</option>
                    <option value="All Platform Users">All Platform Users (Customers & Workers)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notification Category</label>
                  <select 
                    className="form-control"
                    value={composeForm.category}
                    onChange={e => setComposeForm({ ...composeForm, category: e.target.value })}
                  >
                    <option value="Promotional">Promotional Offer 🎁</option>
                    <option value="System Alert">System Alert 🚨</option>
                    <option value="OTP & Booking">OTP & Booking Update 📲</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notification Title / Subject *</label>
                  <input 
                    required
                    className="form-control"
                    placeholder="e.g. Monsoon Special Discount 🌧️ - 20% OFF Servicing"
                    value={composeForm.title}
                    onChange={e => setComposeForm({ ...composeForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea 
                    className="form-control"
                    rows={4}
                    placeholder="Enter broadcast message details..."
                    value={composeForm.message}
                    onChange={e => setComposeForm({ ...composeForm, message: e.target.value })}
                  />
                </div>

                {/* Delivery Channels Checklist */}
                <div className="form-group">
                  <label>Delivery Channels</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={composeForm.channels.app}
                        onChange={e => setComposeForm({ ...composeForm, channels: { ...composeForm.channels, app: e.target.checked } })}
                        style={{ accentColor: '#1E293B' }}
                      />
                      App Push 🔔
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={composeForm.channels.sms}
                        onChange={e => setComposeForm({ ...composeForm, channels: { ...composeForm.channels, sms: e.target.checked } })}
                        style={{ accentColor: '#1E293B' }}
                      />
                      SMS 📱
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={composeForm.channels.whatsapp}
                        onChange={e => setComposeForm({ ...composeForm, channels: { ...composeForm.channels, whatsapp: e.target.checked } })}
                        style={{ accentColor: '#1E293B' }}
                      />
                      WhatsApp 💬
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input 
                        type="checkbox"
                        checked={composeForm.channels.email}
                        onChange={e => setComposeForm({ ...composeForm, channels: { ...composeForm.channels, email: e.target.checked } })}
                        style={{ accentColor: '#1E293B' }}
                      />
                      Email ✉️
                    </label>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowComposeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
                  Save & Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Notification Details */}
      {viewingNotification && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF' }}>Notification Details - {viewingNotification.id}</h3>
              <button className="modal-close" onClick={() => setViewingNotification(null)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Target Audience</span>
                <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#0F172A', fontSize: 15 }}>{viewingNotification.targetAudience}</p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Subject / Title</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#334155' }}>{viewingNotification.title}</p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Message Content</span>
                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, marginTop: 4, border: '1px solid #E2E8F0', fontSize: 14, color: '#334155', lineHeight: 1.5 }}>
                  {viewingNotification.messageBody || viewingNotification.title}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Channels</span>
                  <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#475569' }}>{viewingNotification.channels}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Dispatched Date</span>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>{viewingNotification.dateTime}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingNotification(null)}>Close</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  handleResend(viewingNotification);
                  setViewingNotification(null);
                }}
                style={{ background: '#1E293B' }}
              >
                Resend Again
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
