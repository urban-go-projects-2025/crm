import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Star, Users, CheckCircle2, Award } from 'lucide-react';
import { fetchCustomers, createCustomer } from '../services/api';
import { AddCustomerModal } from '../components/Modals';

export default function CustomerManagement() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
      socket.on('customer_updated', loadCustomers);
    return () => {
      socket.off('customer_updated', loadCustomers);
    };
  }, [socket]);

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortFilter, setSortFilter] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers({ search, status: statusFilter, sort: sortFilter });
      setCustomers(data.customers || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter, sortFilter]);

  const handleAddCustomer = async (formData) => {
    try {
      await createCustomer(formData);
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      {/* Metrics Header */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Customers</span>
            <span className="stat-value">{stats ? stats.totalCustomers : '0'}</span>
            <span className="stat-subtext">Registered user accounts</span>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">VIP Customers</span>
            <span className="stat-value">{stats ? stats.vipCustomers : '0'}</span>
            <span className="stat-subtext">High-volume bookings</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Star size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Active Accounts</span>
            <span className="stat-value">{stats ? stats.activeAccounts : '0'}</span>
            <span className="stat-subtext">Active & verified</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Avg Customer Rating</span>
            <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats ? stats.avgRating : '4.8'} <Star size={20} fill="#F59E0B" color="#F59E0B" />
            </span>
            <span className="stat-subtext">Platform-wide satisfaction</span>
          </div>
          <div className="stat-icon-wrapper">
            <Award size={20} />
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
              placeholder="Search customer profile, phone, or address..."
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
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select 
              className="select-dropdown"
              value={sortFilter}
              onChange={e => setSortFilter(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="spent">Sort by: Total Spent</option>
              <option value="rating">Sort by: Rating</option>
            </select>

            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Add Customer Profile</span>
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Profile & Contact</th>
                <th>Saved Address</th>
                <th>Booking History</th>
                <th>Rating & Review</th>
                <th>Total Spent</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{c.id}</td>

                  <td>
                    <div className="profile-cell">
                      <div className="profile-avatar-circle">{c.avatar}</div>
                      <div className="profile-details">
                        <span className="profile-name">{c.name}</span>
                        <span className="profile-contact">{c.email} | {c.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td style={{ maxWidth: 220, fontSize: 13, color: '#475569' }}>
                    {c.address}
                  </td>

                  <td style={{ fontWeight: 600, color: '#0F172A' }}>
                    {c.bookingsCount} bookings
                  </td>

                  <td>
                    <span className="badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {c.rating} <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    </span>
                  </td>

                  <td style={{ fontWeight: 800, color: '#0F172A' }}>
                    ₹{c.totalSpent?.toLocaleString()}
                  </td>

                  <td>
                    <span className={`status-pill ${c.status?.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>

                  <td style={{ fontSize: 13, color: '#64748B' }}>{c.joinedDate}</td>

                  <td>
                    <button className="btn-secondary">Profile</button>
                    <button className="btn-secondary">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </div>
  );
}
