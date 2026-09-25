import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Calendar, Zap, CheckCircle2, Camera } from 'lucide-react';
import { fetchBookings, createBooking, updateBookingStatus } from '../services/api';
import { CreateBookingModal } from '../components/Modals';

export default function BookingManagement() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
      socket.on('booking_updated', loadBookings);
    return () => {
      socket.off('booking_updated', loadBookings);
    };
  }, [socket]);

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Booking Statuses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const loadBookings = async () => {
    try {
      const data = await fetchBookings({ search, status: statusFilter });
      setBookings(data.bookings || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [search, statusFilter]);

  const handleCreateBooking = async (formData) => {
    try {
      await createBooking(formData);
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOtp = async (booking) => {
    try {
      await updateBookingStatus(booking.id, { otpVerified: !booking.otpVerified });
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePhoto = async (booking) => {
    try {
      await updateBookingStatus(booking.id, { photoUploaded: !booking.photoUploaded });
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Bookings</span>
            <span className="stat-value">{stats ? stats.totalBookings : '0'}</span>
            <span className="stat-subtext">Lifetime appointments</span>
          </div>
          <div className="stat-icon-wrapper">
            <Calendar size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Active / In Progress</span>
            <span className="stat-value">{stats ? stats.activeBookings : '0'}</span>
            <span className="stat-subtext">Ongoing & scheduled</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 74, 102, 0.12)', color: 'rgb(56, 74, 102)' }}>
            <Zap size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">OTP Verified</span>
            <span className="stat-value">{stats ? stats.otpVerified : '0'}</span>
            <span className="stat-subtext">Worker start OTP authenticated</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Photos Uploaded</span>
            <span className="stat-value">{stats ? stats.photosUploaded : '0'}</span>
            <span className="stat-subtext">Service completion verified</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#F1F5F9', color: '#475569' }}>
            <Camera size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-section">
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="search-input-wrapper">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text"
              placeholder="Search Booking ID, Customer, Worker, or Service..."
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
              <option value="All Booking Statuses">All Booking Statuses</option>
              <option value="Active">In Progress / Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Create Booking</span>
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Details</th>
                <th>Worker Details</th>
                <th>Service Type</th>
                <th>OTP Verification</th>
                <th>Completion Photo</th>
                <th>Payment Status</th>
                <th>Booking Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{b.id}</td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{b.customerName}</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{b.customerPhone}</span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{b.workerName}</span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{b.workerPhone}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ 
                      background: '#F1F5F9', 
                      color: '#1E293B', 
                      border: '1px solid #CBD5E1',
                      padding: '4px 10px', 
                      borderRadius: 6, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {b.service}
                    </span>
                  </td>

                  <td>
                    <button 
                      onClick={() => handleToggleOtp(b)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <span className={`status-pill ${b.otpVerified ? 'verified' : 'pending'}`}>
                        {b.otpVerified ? 'OTP Verified ✓' : 'Pending OTP ⏳'}
                      </span>
                    </button>
                  </td>

                  <td>
                    <button 
                      onClick={() => handleTogglePhoto(b)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <span className={`status-pill ${b.photoUploaded ? 'active' : 'pending'}`}>
                        {b.photoUploaded ? 'Photo Uploaded 📷' : 'Pending Photo ⏳'}
                      </span>
                    </button>
                  </td>

                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>
                    ₹{b.amount?.toLocaleString()} ({b.paymentStatus})
                  </td>

                  <td>
                    <span className={`status-pill ${
                      b.status === 'Active' || b.status === 'In Progress' ? 'on-duty' :
                      b.status === 'Scheduled' ? 'scheduled' :
                      b.status === 'Completed' ? 'completed' : 'cancelled'
                    }`}>
                      {b.status}
                    </span>
                  </td>

                  <td>
                    <button className="btn-secondary">Photos</button>
                    <button className="btn-secondary">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateBookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
}
