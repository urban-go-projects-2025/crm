import React, { useState, useEffect } from 'react';
import { MessageSquare, Bell, UserCheck, Zap, Search, Plus, X, CheckCircle2, Headphones } from 'lucide-react';
import { fetchSupportTickets, createSupportTicket, resolveSupportTicket } from '../services/api';
import { useSocket } from '../context/SocketContext';

export default function CustomerSupport() {
  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Ticket Statuses');
  const [escalationFilter, setEscalationFilter] = useState('All Escalations');

  // Modals state
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [ticketForm, setTicketForm] = useState({
    reporterType: 'Customer',
    customerName: '',
    contact: '',
    category: 'Booking Cancellation & Refund',
    priority: 'Medium',
    title: '',
    description: '',
    assignedExecutive: 'Pooja Sharma'
  });

  const loadData = () => {
    fetchSupportTickets()
      .then(res => {
        if (res && res.tickets) {
          setTickets(res.tickets);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const socket = useSocket();
  useEffect(() => {
    if (socket) {
      const handleTicketUpdate = () => loadData();
      socket.on('support_ticket_created', handleTicketUpdate);
      socket.on('support_ticket_updated', handleTicketUpdate);
      return () => {
        socket.off('support_ticket_created', handleTicketUpdate);
        socket.off('support_ticket_updated', handleTicketUpdate);
      };
    }
  }, [socket]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.customerName.trim() || !ticketForm.title.trim()) return;

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: ticketForm.customerName,
      contact: ticketForm.contact || "+91 98000 11223",
      title: ticketForm.title,
      category: ticketForm.category,
      assignedExecutive: ticketForm.assignedExecutive,
      escalationLevel: ticketForm.priority === 'High' ? 'Escalated' : 'Normal',
      priority: ticketForm.priority
    };

    try {
      await createSupportTicket(newTicket);
      setShowRaiseModal(false);
      setTicketForm({
        reporterType: 'Customer',
        customerName: '',
        contact: '',
        category: 'Booking Cancellation & Refund',
        priority: 'Medium',
        title: '',
        description: '',
        assignedExecutive: 'Pooja Sharma'
      });
      showToast(`Support ticket ${newTicket.id} created & assigned to ${newTicket.assignedExecutive}!`);
      loadData();
    } catch (err) {
      showToast("Failed to create ticket.");
    }
  };

  const handleResolveTicket = async (t) => {
    try {
      await resolveSupportTicket(t.id, 'Resolved by executive.');
      showToast(`Ticket ${t.id} marked as Resolved 🟢`);
      loadData();
    } catch (err) {
      showToast("Failed to resolve ticket.");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedExecutive && t.assignedExecutive.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All Ticket Statuses' || t.status === statusFilter;
    const matchesEscalation = escalationFilter === 'All Escalations' || t.escalationLevel === escalationFilter;

    return matchesSearch && matchesStatus && matchesEscalation;
  });
  const openTicketsCount = tickets.filter(t => t.status && t.status.toLowerCase() !== 'resolved').length;
  const escalatedTicketsCount = tickets.filter(t => t.escalationLevel === 'Escalated').length;
  const assignedExecutivesCount = new Set(tickets.map(t => t.assignedExecutive).filter(e => e && e !== 'Unassigned')).size;
  // A naive mock for Avg Resolution Time if there are any resolved tickets
  const avgResolutionTime = tickets.some(t => t.status && t.status.toLowerCase() === 'resolved') ? "1.2 Hours" : "N/A";

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
            <span className="stat-title">Open Tickets</span>
            <span className="stat-value">{openTicketsCount}</span>
            <span className="stat-subtext">Active customer tickets</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 74, 102, 0.12)', color: 'rgb(56, 74, 102)' }}>
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Escalated Tickets</span>
            <span className="stat-value">{escalatedTicketsCount}</span>
            <span className="stat-subtext">Requires manager intervention</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#FEE2E2', color: '#EF4444' }}>
            <Bell size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Assigned Executives</span>
            <span className="stat-value">{assignedExecutivesCount}</span>
            <span className="stat-subtext">Support staff on duty</span>
          </div>
          <div className="stat-icon-wrapper">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Avg Resolution Time</span>
            <span className="stat-value">{avgResolutionTime}</span>
            <span className="stat-subtext">First response turnaround</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Zap size={20} />
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
              placeholder="Search ticket ID, customer, or executive..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select 
              className="select-dropdown"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All Ticket Statuses">All Ticket Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select 
              className="select-dropdown"
              value={escalationFilter}
              onChange={e => setEscalationFilter(e.target.value)}
            >
              <option value="All Escalations">All Escalations</option>
              <option value="Escalated">Escalated</option>
              <option value="Normal">Normal</option>
            </select>

            <button 
              className="btn-primary"
              onClick={() => setShowRaiseModal(true)}
              style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.3)', cursor: 'pointer' }}
            >
              <Plus size={18} />
              <span>Raise Support Ticket</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Customer Details</th>
                <th>Subject & Issue Description</th>
                <th>Assigned Executive</th>
                <th>Escalation Level</th>
                <th>Resolution Notes</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{t.id}</td>

                  <td style={{ fontWeight: 700, color: '#0F172A' }}>
                    {t.customer}
                  </td>

                  <td style={{ maxWidth: 220, fontSize: 13, color: '#334155' }}>
                    {t.title}
                  </td>

                  <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
                    {t.assignedExecutive || 'Unassigned'}
                  </td>

                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4, 
                      fontWeight: 700, 
                      fontSize: 12, 
                      color: t.escalationLevel === 'Escalated' ? '#B91C1C' : '#475569' 
                    }}>
                      {t.escalationLevel === 'Escalated' ? 'Escalated 🚨' : 'Normal'}
                    </span>
                  </td>

                  <td style={{ maxWidth: 220, fontSize: 12, color: '#64748B' }}>
                    {t.resolutionNotes || 'N/A'}
                  </td>

                  <td>
                    <span className={`status-pill ${
                      t.status === 'In Progress' ? 'on-duty' :
                      t.status === 'Open' ? 'pending' : 'completed'
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td style={{ fontSize: 12, color: '#64748B' }}>{t.date}</td>

                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn-secondary"
                        onClick={() => setViewingTicket(t)}
                        style={{ cursor: 'pointer' }}
                      >
                        View
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleResolveTicket(t)}
                        style={{ cursor: 'pointer', color: t.status === 'Resolved' ? '#16A34A' : '#334155' }}
                      >
                        {t.status === 'Resolved' ? 'Done ✓' : 'Resolve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#64748B' }}>
          <span>Showing {filteredTickets.length} of {tickets.length} support tickets</span>
          <span>All executive assignments monitored</span>
        </div>
      </div>

      {/* Modal 1: Raise Support Ticket Modal Popup (Dark Navy Theme) */}
      {showRaiseModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Headphones size={20} color="#38BDF8" /> Raise Support Ticket
              </h3>
              <button className="modal-close" onClick={() => setShowRaiseModal(false)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleRaiseSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="form-group">
                  <label>Reporter Type</label>
                  <select 
                    className="form-control"
                    value={ticketForm.reporterType}
                    onChange={e => setTicketForm({ ...ticketForm, reporterType: e.target.value })}
                  >
                    <option value="Customer">Customer / Registered App User</option>
                    <option value="Worker">Service Specialist / Worker</option>
                    <option value="Internal Manager">Internal Operations Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>User / Customer Name *</label>
                  <input 
                    required
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={ticketForm.customerName}
                    onChange={e => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone / Mobile</label>
                  <input 
                    className="form-control"
                    placeholder="e.g. +91 98111 22334"
                    value={ticketForm.contact}
                    onChange={e => setTicketForm({ ...ticketForm, contact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Issue Category</label>
                  <select 
                    className="form-control"
                    value={ticketForm.category}
                    onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                  >
                    <option value="Booking Cancellation & Refund">Booking Cancellation & Refund</option>
                    <option value="Technician Delay">Technician Delay / No Show</option>
                    <option value="Payment Failure">App Payment Failure / Refund</option>
                    <option value="Service Quality Complaint">Service Quality Complaint</option>
                    <option value="Worker Payout">Worker Payout / Commission Query</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Priority Level</label>
                    <select 
                      className="form-control"
                      value={ticketForm.priority}
                      onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="High">High 🔴 (Escalated)</option>
                      <option value="Medium">Medium 🟡</option>
                      <option value="Low">Low 🟢</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned Support Agent</label>
                    <select 
                      className="form-control"
                      value={ticketForm.assignedExecutive}
                      onChange={e => setTicketForm({ ...ticketForm, assignedExecutive: e.target.value })}
                    >
                      <option value="Pooja Sharma">Pooja Sharma (Lead Agent)</option>
                      <option value="Vikram Singh">Vikram Singh (Senior Agent)</option>
                      <option value="Sunil Verma">Sunil Verma (Operations)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject / Issue Summary *</label>
                  <input 
                    required
                    className="form-control"
                    placeholder="e.g. Specialist delayed by 45 mins due to rain"
                    value={ticketForm.title}
                    onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea 
                    className="form-control"
                    rows={3}
                    placeholder="Provide additional ticket notes or resolution context..."
                    value={ticketForm.description}
                    onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                  />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowRaiseModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Ticket Details */}
      {viewingTicket && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Headphones size={20} color="#38BDF8" /> Ticket Details #{viewingTicket.id}
              </h3>
              <button className="modal-close" onClick={() => setViewingTicket(null)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>CUSTOMER NAME & CONTACT</span>
                <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#0F172A', fontSize: 16 }}>{viewingTicket.customer}</p>
                <span style={{ fontSize: 12, color: '#475569' }}>Phone: {viewingTicket.contact}</span>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>SUBJECT / ISSUE</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#334155' }}>{viewingTicket.title}</p>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>RESOLUTION NOTES</span>
                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, marginTop: 4, border: '1px solid #E2E8F0', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                  {viewingTicket.resolutionNotes}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>ASSIGNED AGENT</span>
                  <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{viewingTicket.assignedExecutive}</p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>ESCALATION STATUS</span>
                  <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: viewingTicket.escalationLevel === 'Escalated' ? '#B91C1C' : '#475569' }}>
                    {viewingTicket.escalationLevel === 'Escalated' ? 'Escalated 🚨' : 'Normal'}
                  </p>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingTicket(null)}>Close</button>
              {viewingTicket.status !== 'Resolved' && (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    handleResolveTicket(viewingTicket);
                    setViewingTicket(null);
                  }}
                  style={{ background: '#16A34A' }}
                >
                  Mark as Resolved 🟢
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
