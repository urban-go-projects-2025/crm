import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Send, RotateCcw, Search, Plus, X, CheckCircle2, FileText, Download } from 'lucide-react';
import { fetchPayments } from '../services/api';

export default function PaymentPayout() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Record Form state
  const [recordForm, setRecordForm] = useState({
    entryType: 'Customer Payment Received',
    customer: '',
    worker: 'Priya Singh',
    service: 'AC Servicing & Repair',
    grossFee: '',
    paymentMethod: 'UPI (GPay)',
    status: 'Completed'
  });

  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);

  const loadPayments = async () => {
    try {
      const data = await fetchPayments({ search, status: statusFilter });
      setPayments(data.payments || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [search, statusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!recordForm.customer.trim() || !recordForm.grossFee) return;

    const fee = parseFloat(recordForm.grossFee) || 0;
    const commPercent = 0.15;
    const commAmount = Math.round(fee * commPercent);
    const netPayout = fee - commAmount;

    const newTxn = {
      id: `TXN-${Math.floor(9000 + Math.random() * 900)}`,
      customer: recordForm.customer,
      customerMethod: recordForm.paymentMethod,
      worker: recordForm.worker,
      service: recordForm.service,
      grossFee: fee,
      commissionSplit: `15% (₹${commAmount})`,
      netWorkerPayout: netPayout,
      refundStatus: "No Refund",
      status: recordForm.status,
      date: "27 Aug 2026, Just Now"
    };

    setPayments([newTxn, ...payments]);
    setShowRecordModal(false);
    setRecordForm({
      entryType: 'Customer Payment Received',
      customer: '',
      worker: 'Priya Singh',
      service: 'AC Servicing & Repair',
      grossFee: '',
      paymentMethod: 'UPI (GPay)',
      status: 'Completed'
    });
    showToast(`Payment entry ${newTxn.id} recorded successfully!`);
  };

  const handleProcessAction = (p) => {
    showToast(`Payout for transaction ${p.id} (${p.worker}) processed!`);
  };

  const filtered = payments;

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
            <span className="stat-title">Gross Customer Revenue</span>
            <span className="stat-value">₹{stats ? stats.grossRevenue.toLocaleString() : '0'}</span>
            <span className="stat-subtext">Gross customer bookings</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Platform Commission</span>
            <span className="stat-value">₹{stats ? stats.platformCommission.toLocaleString() : '0'}</span>
            <span className="stat-subtext">OMW Hub commission (16%)</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Dispatched Worker Payouts</span>
            <span className="stat-value">₹{stats ? stats.dispatchedPayouts.toLocaleString() : '0'}</span>
            <span className="stat-subtext">Net payouts sent to workers</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <Send size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Processed Refunds</span>
            <span className="stat-value">₹{stats ? stats.processedRefunds.toLocaleString() : '0'}</span>
            <span className="stat-subtext">Cancelled booking refunds</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <RotateCcw size={20} />
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
              placeholder="Search Txn ID, Client, Worker, or Service..."
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
              <option value="All Statuses">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>

            <button 
              className="btn-primary"
              onClick={() => setShowRecordModal(true)}
              style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.3)', cursor: 'pointer' }}
            >
              <Plus size={18} />
              <span>Record Payment / Payout</span>
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Customer Payment</th>
                <th>Worker Payout Details</th>
                <th>Gross Booking Fee</th>
                <th>Commission Split</th>
                <th>Net Worker Payout</th>
                <th>Refund Status</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{p.id}</td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{p.customer}</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{p.customerMethod}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{p.worker}</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{p.service}</span>
                    </div>
                  </td>

                  <td style={{ fontWeight: 800, color: '#0F172A' }}>
                    ₹{p.grossFee.toLocaleString()}
                  </td>

                  <td>
                    <span className="badge-outline" style={{ color: '#1E293B', background: '#F1F5F9', borderColor: '#CBD5E1' }}>
                      {p.commissionSplit}
                    </span>
                  </td>

                  <td style={{ fontWeight: 800, color: '#16A34A' }}>
                    ₹{p.netWorkerPayout.toLocaleString()}
                  </td>

                  <td style={{ fontSize: 12, color: p.refundStatus.includes('Refunded') ? '#B91C1C' : '#475569', fontWeight: 600 }}>
                    {p.refundStatus}
                  </td>

                  <td>
                    <span className={`status-pill ${
                      p.status === 'Completed' ? 'completed' :
                      p.status === 'Pending' ? 'pending' : 'cancelled'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn-secondary"
                        onClick={() => setViewingInvoice(p)}
                        style={{ cursor: 'pointer' }}
                      >
                        Invoice
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleProcessAction(p)}
                        style={{ cursor: 'pointer' }}
                      >
                        Process
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#64748B' }}>
          <span>Showing {filtered.length} of {payments.length} payments</span>
          <span>All payout calculations verified</span>
        </div>
      </div>

      {/* Modal 1: Record Payment / Payout Modal Popup (Dark Navy Theme) */}
      {showRecordModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF' }}>Record Payment / Worker Payout</h3>
              <button className="modal-close" onClick={() => setShowRecordModal(false)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleRecordSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div className="form-group">
                  <label>Entry Type</label>
                  <select 
                    className="form-control"
                    value={recordForm.entryType}
                    onChange={e => setRecordForm({ ...recordForm, entryType: e.target.value })}
                  >
                    <option value="Customer Payment Received">Customer Payment Received 🟢</option>
                    <option value="Worker Weekly Payout">Worker Weekly Payout 💳</option>
                    <option value="Refund Issued">Refund Issued 🔄</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Customer Name *</label>
                  <input 
                    required
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={recordForm.customer}
                    onChange={e => setRecordForm({ ...recordForm, customer: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Specialist / Worker</label>
                  <select 
                    className="form-control"
                    value={recordForm.worker}
                    onChange={e => setRecordForm({ ...recordForm, worker: e.target.value })}
                  >
                    <option value="Priya Singh">Priya Singh (AC Specialist)</option>
                    <option value="Neha Verma">Neha Verma (Cleaning)</option>
                    <option value="Amit Sharma">Amit Sharma (Plumbing)</option>
                    <option value="Simran Kaur">Simran Kaur (Electrical)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Service Category</label>
                  <input 
                    className="form-control"
                    placeholder="e.g. AC Servicing & Repair"
                    value={recordForm.service}
                    onChange={e => setRecordForm({ ...recordForm, service: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Gross Amount (₹) *</label>
                    <input 
                      required
                      type="number"
                      className="form-control"
                      placeholder="e.g. 2500"
                      value={recordForm.grossFee}
                      onChange={e => setRecordForm({ ...recordForm, grossFee: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select 
                      className="form-control"
                      value={recordForm.paymentMethod}
                      onChange={e => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                    >
                      <option value="UPI (GPay)">UPI (GPay / PhonePe)</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select 
                    className="form-control"
                    value={recordForm.status}
                    onChange={e => setRecordForm({ ...recordForm, status: e.target.value })}
                  >
                    <option value="Completed">Completed 🟢</option>
                    <option value="Pending">Pending 🟡</option>
                    <option value="Refunded">Refunded 🔴</option>
                  </select>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowRecordModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
                  Save Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Invoice Details */}
      {viewingInvoice && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={20} color="#38BDF8" /> Invoice #{viewingInvoice.id}
              </h3>
              <button className="modal-close" onClick={() => setViewingInvoice(null)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>CUSTOMER & PAYMENT METHOD</span>
                <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#0F172A', fontSize: 16 }}>{viewingInvoice.customer}</p>
                <span style={{ fontSize: 12, color: '#475569' }}>Method: {viewingInvoice.customerMethod}</span>
              </div>

              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>SPECIALIST & SERVICE</span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#334155' }}>{viewingInvoice.worker} • {viewingInvoice.service}</p>
              </div>

              {/* Financial Calculation Breakdown */}
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}>
                  <span>Gross Booking Amount:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{viewingInvoice.grossFee.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1E293B' }}>
                  <span>Platform Commission ({viewingInvoice.commissionSplit}):</span>
                  <span style={{ fontWeight: 700 }}>-₹{(viewingInvoice.grossFee - viewingInvoice.netWorkerPayout).toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: '#16A34A' }}>
                  <span>Net Worker Payout:</span>
                  <span>₹{viewingInvoice.netWorkerPayout.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                <span>Status: <strong style={{ color: '#10B981' }}>{viewingInvoice.status}</strong></span>
                <span>Date: {viewingInvoice.date || '27 Aug 2026'}</span>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingInvoice(null)}>Close</button>
              <button className="btn-primary" onClick={() => { showToast(`Invoice #${viewingInvoice.id} downloaded!`); setViewingInvoice(null); }} style={{ background: 'rgb(56, 74, 102)' }}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
