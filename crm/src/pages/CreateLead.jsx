import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneOff, Trash2, ArrowLeft, Search, CheckCircle2, UserPlus, Eye, Phone, RefreshCw, Info, Lock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { fetchLeads, createLead, deleteLead } from '../services/api';

export default function CreateLead({ onCancel, onSave }) {
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'view'
  const [leadsList, setLeadsList] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState = {
    leadOwner: 'Sania',
    company: '',
    salutation: '-None-',
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    fax: '',
    mobile: '',
    website: '',
    leadSource: '-None-',
    leadStatus: 'captured',
    industry: '-None-',
    noOfEmployees: '',
    annualRevenue: '',
    rating: '-None-',
    emailOptOut: false,
    skypeId: '',
    secondaryEmail: '',
    twitter: '',
    connectedTo: 'Contacts',
    countryRegion: '-None-',
    flatHouseNo: '',
    street: '',
    city: '',
    state: '-None-',
    zipCode: '',
    latitude: '',
    longitude: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [dialedNumber, setDialedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [dialTab, setDialTab] = useState('recent');

  const loadLeads = async () => {
    try {
      setLoadingLeads(true);
      const res = await fetchLeads();
      setLeadsList(res.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('lead_updated', loadLeads);
    return () => {
      socket.off('lead_updated', loadLeads);
    };
  }, [socket]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Keypad buttons definition
  const keypad = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  const handleKeyPress = (digit) => {
    setDialedNumber(prev => (typeof prev === 'string' ? prev : '') + digit);
    setFormData(prev => ({ ...prev, phone: (prev.phone || '') + digit }));
  };

  const handleBackspace = () => {
    const current = (typeof dialedNumber === 'string' ? dialedNumber : formData.phone) || '';
    const updated = typeof current === 'string' ? current.slice(0, -1) : '';
    setDialedNumber(updated);
    setFormData(prev => ({ ...prev, phone: updated }));
  };

  const handleCallToggle = (numToCall) => {
    const target = (typeof numToCall === 'string' && numToCall) ? numToCall : (typeof dialedNumber === 'string' ? dialedNumber : formData.phone);
    if (!target || typeof target !== 'string') return;
    setDialedNumber(target);
    setIsCalling(prev => !prev);
  };

  const handleClearAddress = () => {
    setFormData(prev => ({
      ...prev,
      countryRegion: '-None-',
      flatHouseNo: '',
      street: '',
      city: '',
      state: '-None-',
      zipCode: '',
      latitude: '',
      longitude: ''
    }));
  };

  const handleFormSubmit = async (e, isSaveAndNew = false) => {
    if (e) e.preventDefault();
    const fname = formData.firstName.trim();
    const lname = formData.lastName.trim();
    const emailStr = formData.email.trim();
    const phoneStr = (formData.phone || dialedNumber).trim();

    if (!fname && !lname && !emailStr && !phoneStr) {
      showToast('Please enter at least a Name, Email, or Phone number!');
      return;
    }

    try {
      setIsSaving(true);
      const leadPayload = {
        firstName: fname || 'Lead',
        lastName: lname || '',
        email: emailStr,
        phone: phoneStr,
        status: formData.leadStatus && formData.leadStatus !== '-None-' ? formData.leadStatus.toLowerCase() : 'captured'
      };

      await createLead(leadPayload);
      showToast(`Lead saved successfully!`);
      loadLeads();

      if (isSaveAndNew) {
        setFormData(initialFormState);
        setDialedNumber('');
      } else {
        setActiveTab('view');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save lead to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead for ${name}?`)) return;
    try {
      await deleteLead(id);
      showToast(`Lead deleted successfully`);
      loadLeads();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete lead');
    }
  };

  const filteredLeads = leadsList.filter(l => {
    const fname = l.first_name || l.firstName || '';
    const lname = l.last_name || l.lastName || '';
    const name = `${fname} ${lname}`.toLowerCase();
    const email = (l.email || '').toLowerCase();
    const phone = (l.phone || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="page-content" style={{ paddingBottom: 24 }}>
      
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

      {/* Header Bar with 2 Option Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottom: '1px solid #E2E8F0',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            onClick={onCancel}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Lead Management & Quick Call
            </h2>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              Create customer leads or view captured database leads
            </span>
          </div>
        </div>

        {/* 2 Main Option Tabs: Create Lead vs View Leads */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            type="button"
            onClick={() => setActiveTab('create')}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'create' ? 'rgb(56, 74, 102)' : '#F1F5F9',
              color: activeTab === 'create' ? '#FFFFFF' : '#475569',
              boxShadow: activeTab === 'create' ? '0 4px 12px rgba(56, 74, 102, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} />
            <span>Create Lead</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('view')}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'view' ? 'rgb(56, 74, 102)' : '#F1F5F9',
              color: activeTab === 'view' ? '#FFFFFF' : '#475569',
              boxShadow: activeTab === 'view' ? '0 4px 12px rgba(56, 74, 102, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Eye size={16} />
            <span>View Leads ({leadsList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
        
        {/* Left Section: Lead Form Card or View Leads Data Table */}
        {activeTab === 'view' ? (
          <div className="card-section" style={{ flex: 1, padding: 24 }}>
            {/* Search and Refresh Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: 38 }}
                  placeholder="Search lead by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={loadLeads}
                disabled={loadingLeads}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
              >
                <RefreshCw size={15} className={loadingLeads ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Leads Data Table */}
            {loadingLeads ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                Loading leads from database...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#334155', margin: '0 0 6px' }}>No leads found</p>
                <p style={{ fontSize: 13, margin: 0 }}>Create a new lead using the "Create Lead" tab above.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>First Name</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Last Name</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Created At</th>
                      <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const fname = lead.first_name || lead.firstName || '-';
                      const lname = lead.last_name || lead.lastName || '-';
                      const ph = lead.phone || '-';
                      const em = lead.email || '-';
                      const st = lead.status || 'captured';
                      const createdDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

                      return (
                        <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>{fname}</td>
                          <td style={{ padding: '14px 16px', color: '#334155' }}>{lname}</td>
                          <td style={{ padding: '14px 16px', color: '#0284C7', fontWeight: 500 }}>{ph}</td>
                          <td style={{ padding: '14px 16px', color: '#64748B' }}>{em}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              background: st === 'registered' ? '#DCFCE7' : '#FEF3C7',
                              color: st === 'registered' ? '#166534' : '#92400E',
                              textTransform: 'capitalize'
                            }}>
                              {st}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B', fontSize: 13 }}>{createdDate}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              {ph !== '-' && (
                                <button
                                  type="button"
                                  onClick={() => handleCallToggle(ph)}
                                  title="Call Phone"
                                  style={{
                                    background: '#10B981',
                                    color: '#FFF',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '6px 10px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <Phone size={14} />
                                  <span>Call</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteLead(lead.id, `${fname} ${lname}`)}
                                title="Delete Lead"
                                style={{
                                  background: '#FEE2E2',
                                  color: '#EF4444',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card-section" style={{ flex: 1, padding: 28, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            
            {/* Header Title Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 24,
              borderLeft: '4px solid #0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserPlus size={20} color="#0284C7" />
                  <span>Create New Customer Lead</span>
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                  Enter lead contact details to add directly into the MySQL database table (`leads`).
                </p>
              </div>
              <span style={{
                background: '#E0F2FE',
                color: '#0369A1',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20
              }}>
                MySQL Table: leads
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 28 }}>
                
                {/* First Name */}
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginBottom: 6, display: 'block' }}>
                    First Name
                  </label>
                  <input 
                    type="text"
                    maxLength={100}
                    className="form-control"
                    placeholder="e.g. Ronak"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, width: '100%' }}
                  />
                </div>

                {/* Last Name */}
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Last Name *
                  </label>
                  <input 
                    required
                    type="text"
                    maxLength={100}
                    className="form-control"
                    placeholder="e.g. Singh"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, width: '100%' }}
                  />
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Phone Number *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                    <input 
                      required
                      type="tel"
                      maxLength={20}
                      className="form-control"
                      placeholder="e.g. 9955235689"
                      value={formData.phone}
                      onChange={e => {
                        setFormData({ ...formData, phone: e.target.value });
                        setDialedNumber(e.target.value);
                      }}
                      style={{ paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, width: '100%' }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Email Address
                  </label>
                  <input 
                    type="email"
                    maxLength={255}
                    className="form-control"
                    placeholder="e.g. ranok@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, width: '100%' }}
                  />
                </div>

                {/* Lead Status */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#334155', marginBottom: 6, display: 'block' }}>
                    Lead Status
                  </label>
                  <select 
                    className="form-control"
                    value={formData.leadStatus}
                    onChange={e => setFormData({ ...formData, leadStatus: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 14, width: '100%', background: '#FFF' }}
                  >
                    <option value="captured">Captured (Default)</option>
                    <option value="registered">Registered</option>
                  </select>
                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setFormData(initialFormState)}
                  style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', cursor: 'pointer' }}
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={(e) => handleFormSubmit(e, true)}
                  disabled={isSaving}
                  style={{ padding: '10px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: '#475569', color: '#FFF', border: 'none', cursor: 'pointer' }}
                >
                  {isSaving ? 'Saving...' : 'Save & Add Another'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFF', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)' }}
                >
                  {isSaving ? 'Saving Lead...' : 'Save Lead & View'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Right Section: Quick Customer Calling Dialer Widget (Sticky Always-In-View) */}
        <div style={{
          width: 340,
          position: 'sticky',
          top: 85,
          alignSelf: 'flex-start',
          zIndex: 30
        }}>
          
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)'
          }}>
            
            {/* Dark Navy Header Box */}
            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '18px 16px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: '#38BDF8', display: 'block', marginBottom: 6 }}>
                QUICK CUSTOMER CALLING
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: dialedNumber || formData.phone ? '#FFFFFF' : '#64748B' }}>
                  {dialedNumber || formData.phone || 'Enter Number...'}
                </span>
              </div>

              <span style={{ fontSize: 11, color: isCalling ? '#4ADE80' : '#94A3B8', marginTop: 4, display: 'block', fontWeight: 600 }}>
                {isCalling ? '📞 Calling... (Live VoIP Connection)' : 'Ready to Dial'}
              </span>
            </div>

            {/* Sub-tabs: Recent | Contacts */}
            <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <button 
                onClick={() => setDialTab('recent')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: 13,
                  color: dialTab === 'recent' ? '#0F172A' : '#64748B',
                  borderBottom: dialTab === 'recent' ? '2px solid #1E293B' : 'none',
                  cursor: 'pointer'
                }}
              >
                Recent
              </button>
              <button 
                onClick={() => setDialTab('contacts')}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: 13,
                  color: dialTab === 'contacts' ? '#0F172A' : '#64748B',
                  borderBottom: dialTab === 'contacts' ? '2px solid #1E293B' : 'none',
                  cursor: 'pointer'
                }}
              >
                Contacts
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 16 }}>
              
              {/* Call Action Button */}
              <button
                onClick={handleCallToggle}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 12,
                  border: 'none',
                  background: isCalling ? '#EF4444' : '#10B981',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: isCalling ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(16, 185, 129, 0.3)',
                  marginBottom: 14
                }}
              >
                {isCalling ? <PhoneOff size={18} /> : <PhoneCall size={18} />}
                <span>{isCalling ? 'End Call' : 'Call Now'}</span>
              </button>

              {/* Keypad Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {keypad.map((k, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeyPress(k.num)}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      margin: '0 auto',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{k.num}</span>
                    {k.sub && (
                      <span style={{ fontSize: 8, fontWeight: 700, color: '#64748B', marginTop: 1 }}>{k.sub}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bottom Quick Controls Matching User Screenshot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, padding: '0 8px' }}>
                
                {/* Bottom Left Backspace Arrow Button */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#E2E8F0',
                    border: 'none',
                    color: '#475569',
                    fontSize: 18,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}
                  title="Backspace"
                >
                  ←
                </button>

                {/* Bottom Right Call Button */}
                <button
                  type="button"
                  onClick={() => handleCallToggle()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isCalling ? '#EF4444' : '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isCalling ? '0 4px 12px rgba(239, 68, 68, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                  title={isCalling ? "End Call" : "Call Now"}
                >
                  {isCalling ? <PhoneOff size={20} /> : <PhoneCall size={20} />}
                </button>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
