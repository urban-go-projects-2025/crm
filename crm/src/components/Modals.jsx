import React, { useState } from 'react';
import { X, UserPlus, UserCheck, CalendarPlus, FileText } from 'lucide-react';

/* 1. Add Customer Profile Modal Popup */
export function AddCustomerModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    cityArea: 'South Delhi',
    status: 'Active',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CU',
      bookingsCount: 0,
      rating: 5.0,
      totalSpent: 0,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    setFormData({ name: '', email: '', phone: '', address: '', cityArea: 'South Delhi', status: 'Active', notes: '' });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
          <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={20} color="#38BDF8" /> Add Customer Profile
          </h3>
          <button className="modal-close" onClick={onClose} style={{ color: '#CBD5E1' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div className="form-group">
              <label>Full Customer Name *</label>
              <input 
                required
                className="form-control" 
                placeholder="e.g. Rahul Sharma" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input 
                  required
                  className="form-control" 
                  placeholder="+91 98765 43210" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email"
                  className="form-control" 
                  placeholder="rahul@example.com" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>City / Location Area</label>
                <select 
                  className="form-control"
                  value={formData.cityArea}
                  onChange={e => setFormData({ ...formData, cityArea: e.target.value })}
                >
                  <option value="South Delhi">South Delhi</option>
                  <option value="Gurgaon Sector 54">Gurgaon Sector 54</option>
                  <option value="Noida Express Way">Noida Express Way</option>
                  <option value="West Delhi">West Delhi</option>
                  <option value="Central Delhi">Central Delhi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Account Tier Status</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active 🟢</option>
                  <option value="VIP">VIP 🌟</option>
                  <option value="Inactive">Inactive ⚪</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Full Home Address</label>
              <textarea 
                className="form-control" 
                rows="3"
                placeholder="Flat / House No, Street Address, Landmark..." 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Initial Profile Notes</label>
              <input 
                className="form-control" 
                placeholder="e.g. Prefers morning appointments only" 
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
              Save Customer Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* 2. Add Worker Profile Modal Popup */
export function AddWorkerModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    category: 'AC Repair & Electrical', 
    cityArea: 'Gurgaon',
    dutyStatus: 'On Duty',
    kycStatus: 'Verified',
    commissionRate: 15 
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: `WRK-${Math.floor(2000 + Math.random() * 8000)}`,
      avatar: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'WK',
      rating: 5.0,
      completedJobs: 0,
      totalEarnings: 0
    });
    setFormData({ name: '', phone: '', category: 'AC Repair & Electrical', cityArea: 'Gurgaon', dutyStatus: 'On Duty', kycStatus: 'Verified', commissionRate: 15 });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
          <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={20} color="#38BDF8" /> Add Worker Profile
          </h3>
          <button className="modal-close" onClick={onClose} style={{ color: '#CBD5E1' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div className="form-group">
              <label>Worker Full Name *</label>
              <input 
                required
                className="form-control" 
                placeholder="e.g. Priya Singh" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Mobile Number *</label>
                <input 
                  required
                  className="form-control" 
                  placeholder="+91 98111 22334" 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Service Category *</label>
                <select 
                  className="form-control"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="AC Repair & Electrical">AC Repair & Electrical ❄️</option>
                  <option value="Plumbing & Pipe Fitting">Plumbing & Pipe Fitting 🚰</option>
                  <option value="Home Deep Cleaning">Home Deep Cleaning 🧹</option>
                  <option value="Appliance Fix & Wiring">Appliance Fix & Wiring 🔌</option>
                  <option value="Personal Care & Wellness">Personal Care & Wellness 💆</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Initial Duty Status</label>
                <select 
                  className="form-control"
                  value={formData.dutyStatus}
                  onChange={e => setFormData({ ...formData, dutyStatus: e.target.value })}
                >
                  <option value="On Duty">On Duty 🟢</option>
                  <option value="Off Duty">Off Duty ⚪</option>
                </select>
              </div>

              <div className="form-group">
                <label>KYC Verification</label>
                <select 
                  className="form-control"
                  value={formData.kycStatus}
                  onChange={e => setFormData({ ...formData, kycStatus: e.target.value })}
                >
                  <option value="Verified">KYC Verified ✅</option>
                  <option value="Pending KYC">Pending KYC ⏳</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Primary Service Location</label>
                <input 
                  className="form-control" 
                  placeholder="e.g. Gurgaon & South Delhi" 
                  value={formData.cityArea}
                  onChange={e => setFormData({ ...formData, cityArea: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Commission Split (%)</label>
                <input 
                  type="number"
                  className="form-control" 
                  value={formData.commissionRate}
                  onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
              Register Worker Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* 3. Create Service Booking Modal Popup */
export function CreateBookingModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    workerName: 'Priya Singh',
    workerPhone: '+91 98111 22334',
    service: 'AC Servicing & Repair',
    address: 'South Delhi, Block C',
    amount: 2500,
    paymentMethod: 'Online',
    bookingStatus: 'Scheduled'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: `BK-${Math.floor(7000 + Math.random() * 3000)}`,
      otpVerified: true,
      completionPhotoUploaded: false,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    setFormData({
      customerName: '',
      customerPhone: '',
      workerName: 'Priya Singh',
      workerPhone: '+91 98111 22334',
      service: 'AC Servicing & Repair',
      address: 'South Delhi, Block C',
      amount: 2500,
      paymentMethod: 'Online',
      bookingStatus: 'Scheduled'
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
          <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarPlus size={20} color="#38BDF8" /> Create New Booking
          </h3>
          <button className="modal-close" onClick={onClose} style={{ color: '#CBD5E1' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input 
                  required
                  className="form-control" 
                  placeholder="e.g. Rahul Sharma" 
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Customer Phone *</label>
                <input 
                  required
                  className="form-control" 
                  placeholder="+91 98765 43210" 
                  value={formData.customerPhone}
                  onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Assigned Specialist / Worker</label>
                <select 
                  className="form-control"
                  value={formData.workerName}
                  onChange={e => setFormData({ ...formData, workerName: e.target.value })}
                >
                  <option value="Priya Singh">Priya Singh (AC Specialist)</option>
                  <option value="Neha Verma">Neha Verma (Cleaning)</option>
                  <option value="Amit Sharma">Amit Sharma (Plumbing)</option>
                  <option value="Simran Kaur">Simran Kaur (Electrical)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Service Category *</label>
                <select 
                  className="form-control"
                  value={formData.service}
                  onChange={e => setFormData({ ...formData, service: e.target.value })}
                >
                  <option value="AC Servicing & Repair">AC Servicing & Repair ❄️</option>
                  <option value="Home Deep Cleaning">Home Deep Cleaning 🧹</option>
                  <option value="Plumbing Leak Fix">Plumbing Leak Fix 🚰</option>
                  <option value="Electrical Repair">Electrical Repair 🔌</option>
                  <option value="Appliance Fix & Wiring">Appliance Fix & Wiring 🛠️</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Service Destination Address</label>
              <input 
                className="form-control" 
                placeholder="Full service address..." 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Booking Amount (₹) *</label>
                <input 
                  type="number"
                  required
                  className="form-control" 
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  className="form-control"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Online">Online Payment 📱</option>
                  <option value="COD">Cash On Delivery (COD) 💵</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Initial Booking Status</label>
              <select 
                className="form-control"
                value={formData.bookingStatus}
                onChange={e => setFormData({ ...formData, bookingStatus: e.target.value })}
              >
                <option value="Scheduled">Scheduled 📅</option>
                <option value="In Progress">In Progress ⚡</option>
                <option value="Completed">Completed ✅</option>
              </select>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* 4. Export & Download Report Modal Popup */
export function ExportReportModal({ isOpen, onClose, initialFormat = 'PDF', onExport }) {
  const [format, setFormat] = useState(initialFormat);
  const [dateRange, setDateRange] = useState('This Month (Aug 2026)');
  const [reportType, setReportType] = useState('Full Executive Analytics');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeWorkerBreakdown, setIncludeWorkerBreakdown] = useState(true);

  if (!isOpen) return null;

  const handleDownload = (e) => {
    e.preventDefault();
    if (onExport) {
      onExport({ format, dateRange, reportType, includeCharts, includeWorkerBreakdown });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
          <h3 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color="#38BDF8" /> Generate & Export Report
          </h3>
          <button className="modal-close" onClick={onClose} style={{ color: '#CBD5E1' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            <div className="form-group">
              <label>Export Format</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setFormat('PDF')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    background: format === 'PDF' ? '#EFF6FF' : '#F8FAFC',
                    border: format === 'PDF' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                    color: format === 'PDF' ? '#1D4ED8' : '#334155',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  📄 PDF Document
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('CSV')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    background: format === 'CSV' ? '#ECFDF5' : '#F8FAFC',
                    border: format === 'CSV' ? '2px solid #10B981' : '1px solid #E2E8F0',
                    color: format === 'CSV' ? '#047857' : '#334155',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  📊 CSV Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('Excel')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    background: format === 'Excel' ? '#FEF3C7' : '#F8FAFC',
                    border: format === 'Excel' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                    color: format === 'Excel' ? '#B45309' : '#334155',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  📈 Excel XLSX
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Report Type</label>
                <select 
                  className="form-control"
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                >
                  <option value="Full Executive Analytics">Full Executive Analytics</option>
                  <option value="Revenue & Payout Report">Revenue & Payout Report</option>
                  <option value="Worker Performance Matrix">Worker Performance Matrix</option>
                  <option value="Customer Booking Summary">Customer Booking Summary</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date Range Filter</label>
                <select 
                  className="form-control"
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                >
                  <option value="This Month (Aug 2026)">This Month (Aug 2026)</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Current Quarter (Q3)">Current Quarter (Q3)</option>
                  <option value="Year to Date (2026)">Year to Date (2026)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <label style={{ marginBottom: 8, display: 'block' }}>Report Options & Sections</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    checked={includeCharts} 
                    onChange={e => setIncludeCharts(e.target.checked)} 
                    style={{ width: 16, height: 16, accentColor: 'rgb(56, 74, 102)' }}
                  />
                  <span>Include Visual Revenue & Booking Charts</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                  <input 
                    type="checkbox" 
                    checked={includeWorkerBreakdown} 
                    onChange={e => setIncludeWorkerBreakdown(e.target.checked)} 
                    style={{ width: 16, height: 16, accentColor: 'rgb(56, 74, 102)' }}
                  />
                  <span>Include Detailed Worker Commission Table</span>
                </label>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}>
              Download {format} Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

