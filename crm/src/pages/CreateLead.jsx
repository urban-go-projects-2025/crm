import React, { useState } from 'react';
import { PhoneCall, PhoneOff, Trash2, ArrowLeft, Info, Lock } from 'lucide-react';

export default function CreateLead({ onCancel, onSave }) {
  const [formData, setFormData] = useState({
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
    leadStatus: '-None-',
    industry: '-None-',
    noOfEmployees: '',
    annualRevenue: '',
    rating: '-None-',
    emailOptOut: false,
    skypeId: '',
    secondaryEmail: '',
    twitter: '',
    connectedTo: 'Contacts',
    // Address Information
    countryRegion: '-None-',
    flatHouseNo: '',
    street: '',
    city: '',
    state: '-None-',
    zipCode: '',
    latitude: '',
    longitude: '',
    // Description Information
    description: ''
  });

  const [dialedNumber, setDialedNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [dialTab, setDialTab] = useState('recent');

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
    setDialedNumber(prev => prev + digit);
    setFormData(prev => ({ ...prev, phone: prev.phone + digit }));
  };

  const handleBackspace = () => {
    const current = dialedNumber || formData.phone || '';
    const updated = current.slice(0, -1);
    setDialedNumber(updated);
    setFormData(prev => ({ ...prev, phone: updated }));
  };

  const handleCallToggle = () => {
    if (!dialedNumber && !formData.phone) return;
    setIsCalling(!isCalling);
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

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <div className="page-content" style={{ paddingBottom: 24 }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottom: '1px solid #E2E8F0',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Lead</h2>
          <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            Edit Page Layout
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: '8px 18px', fontSize: 14 }}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleFormSubmit} style={{ padding: '8px 18px', fontSize: 14 }}>
            Save and New
          </button>
          <button type="button" className="btn-primary" onClick={handleFormSubmit} style={{ padding: '8px 24px', fontSize: 14 }}>
            Save
          </button>
        </div>
      </div>

      {/* Main Container Layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
        
        {/* Left Section: Lead Form Card */}
        <div className="card-section" style={{ flex: 1, padding: 28 }}>
          
          {/* Lead Image Placeholder */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Lead Image</label>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#F1F5F9',
              border: '2px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#64748B' }}></div>
            </div>
          </div>

          {/* Lead Information Section Header */}
          <div style={{
            background: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            borderLeft: '4px solid #1E293B'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Lead Information</h3>
            <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
              Enter the customer's contact and business information.
            </p>
          </div>

          {/* Form Fields Grid */}
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 28 }}>
              
              <div className="form-group">
                <label>Lead owner</label>
                <select 
                  className="form-control"
                  value={formData.leadOwner}
                  onChange={e => setFormData({ ...formData, leadOwner: e.target.value })}
                >
                  <option value="Sania">Sania</option>
                  <option value="Admin Administrator">Admin Administrator</option>
                  <option value="Priya Singh">Priya Singh</option>
                  <option value="Vikram M.">Vikram M.</option>
                </select>
              </div>

              <div className="form-group">
                <label>Company *</label>
                <input 
                  required
                  className="form-control"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>First name</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select 
                    className="form-control"
                    style={{ width: 100 }}
                    value={formData.salutation}
                    onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                  >
                    <option value="-None-">-None-</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                  <input 
                    className="form-control"
                    style={{ flex: 1 }}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Last name *</label>
                <input 
                  required
                  className="form-control"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Title</label>
                <input 
                  className="form-control"
                  placeholder="Job title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email"
                  className="form-control"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input 
                  className="form-control"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fax</label>
                <input 
                  className="form-control"
                  placeholder="Fax number"
                  value={formData.fax}
                  onChange={e => setFormData({ ...formData, fax: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input 
                  className="form-control"
                  placeholder="Mobile number"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input 
                  className="form-control"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Lead Source</label>
                <select 
                  className="form-control"
                  value={formData.leadSource}
                  onChange={e => setFormData({ ...formData, leadSource: e.target.value })}
                >
                  <option value="-None-">-None-</option>
                  <option value="Web Search">Web Search</option>
                  <option value="Phone Inquiry">Phone Inquiry</option>
                  <option value="Partner Referral">Partner Referral</option>
                  <option value="OMW Platform">OMW Platform</option>
                </select>
              </div>

              <div className="form-group">
                <label>Lead Status</label>
                <select 
                  className="form-control"
                  value={formData.leadStatus}
                  onChange={e => setFormData({ ...formData, leadStatus: e.target.value })}
                >
                  <option value="-None-">-None-</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>

              <div className="form-group">
                <label>Industry</label>
                <select 
                  className="form-control"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="-None-">-None-</option>
                  <option value="Home Services">Home Services</option>
                  <option value="HVAC Repair">HVAC Repair</option>
                  <option value="Cleaning & Hygiene">Cleaning & Hygiene</option>
                  <option value="Corporate Maintenance">Corporate Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>No. of Employees</label>
                <input 
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50"
                  value={formData.noOfEmployees}
                  onChange={e => setFormData({ ...formData, noOfEmployees: e.target.value })}
                />
              </div>

              {/* Annual Revenue with Rs. prefix & info badge */}
              <div className="form-group">
                <label>Annual Revenue</label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748B'
                  }}>Rs.</span>
                  <input 
                    className="form-control"
                    style={{ paddingLeft: 42, paddingRight: 36 }}
                    placeholder=""
                    value={formData.annualRevenue}
                    onChange={e => setFormData({ ...formData, annualRevenue: e.target.value })}
                  />
                  <span style={{ position: 'absolute', right: 12, color: '#94A3B8', cursor: 'pointer' }}>
                    <Info size={16} />
                  </span>
                </div>
              </div>

              {/* Rating Dropdown */}
              <div className="form-group">
                <label>Rating</label>
                <select 
                  className="form-control"
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: e.target.value })}
                >
                  <option value="-None-">-None-</option>
                  <option value="Acquired">Acquired</option>
                  <option value="Active">Active</option>
                  <option value="Market Failed">Market Failed</option>
                  <option value="Project Cancelled">Project Cancelled</option>
                  <option value="Shutdown">Shutdown</option>
                </select>
              </div>

              {/* Email Opt Out Checkbox */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
                <label style={{ margin: 0, cursor: 'pointer' }}>Email Opt Out</label>
                <input 
                  type="checkbox"
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1E293B' }}
                  checked={formData.emailOptOut}
                  onChange={e => setFormData({ ...formData, emailOptOut: e.target.checked })}
                />
              </div>

              {/* Skype ID */}
              <div className="form-group">
                <label>Skype ID</label>
                <input 
                  className="form-control"
                  placeholder=""
                  value={formData.skypeId}
                  onChange={e => setFormData({ ...formData, skypeId: e.target.value })}
                />
              </div>

              {/* Secondary Email */}
              <div className="form-group">
                <label>Secondary Email</label>
                <input 
                  type="email"
                  className="form-control"
                  placeholder=""
                  value={formData.secondaryEmail}
                  onChange={e => setFormData({ ...formData, secondaryEmail: e.target.value })}
                />
              </div>

              {/* Twitter with @ prefix */}
              <div className="form-group">
                <label>Twitter</label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#64748B'
                  }}>@</span>
                  <input 
                    className="form-control"
                    style={{ paddingLeft: 32 }}
                    placeholder=""
                    value={formData.twitter}
                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>
              </div>

              {/* Connected To Badge */}
              <div className="form-group">
                <label>Connected To</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  background: '#F8FAFC',
                  overflow: 'hidden'
                }}>
                  <span style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#334155', borderRight: '1px solid #E2E8F0' }}>
                    Contacts
                  </span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 12, color: '#94A3B8' }}>
                    <Lock size={16} />
                  </div>
                </div>
              </div>

            </div>

            {/* Address Information Section */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>Address Information</h3>
              
              {/* Framed Address Box Matching Screenshot 4 */}
              <div style={{
                border: '1px solid #CBD5E1',
                borderRadius: 12,
                padding: '24px 20px 16px',
                position: 'relative',
                background: '#FFFFFF',
                marginTop: 10
              }}>
                {/* Top Legend */}
                <span style={{
                  position: 'absolute',
                  top: -12,
                  left: 16,
                  background: '#FFFFFF',
                  padding: '0 8px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#475569'
                }}>
                  Address
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                  
                  <div className="form-group">
                    <label>Country / Region</label>
                    <select 
                      className="form-control"
                      value={formData.countryRegion}
                      onChange={e => setFormData({ ...formData, countryRegion: e.target.value })}
                    >
                      <option value="-None-">-None-</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="UAE">UAE</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Flat / House No. / Building / Apartment Name</label>
                    <input 
                      className="form-control"
                      placeholder=""
                      value={formData.flatHouseNo}
                      onChange={e => setFormData({ ...formData, flatHouseNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Street Address</label>
                    <input 
                      className="form-control"
                      placeholder=""
                      value={formData.street}
                      onChange={e => setFormData({ ...formData, street: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input 
                      className="form-control"
                      placeholder=""
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>State / Province</label>
                    <select 
                      className="form-control"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    >
                      <option value="-None-">-None-</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Zip / Postal Code</label>
                    <input 
                      className="form-control"
                      placeholder=""
                      value={formData.zipCode}
                      onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </div>

                  {/* Coordinates: Latitude & Longitude Inputs Side by Side */}
                  <div className="form-group">
                    <label>Coordinates</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <input 
                        className="form-control"
                        placeholder="Latitude"
                        value={formData.latitude}
                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      />
                      <input 
                        className="form-control"
                        placeholder="Longitude"
                        value={formData.longitude}
                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>

                </div>

                {/* Bottom Right Clear All Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button 
                    type="button" 
                    onClick={handleClearAddress}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                </div>

              </div>
            </div>

            {/* Description Information Section Matching User Screenshot */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>Description Information</h3>
              
              <div className="form-group">
                <textarea 
                  className="form-control"
                  rows={5}
                  style={{ width: '100%', minHeight: 120, resize: 'vertical' }}
                  placeholder="Add lead description, customer preferences, or meeting notes..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

          </form>
        </div>

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
                  onClick={handleCallToggle}
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
