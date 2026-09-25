import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Star, UserCheck, CheckCircle2, Zap, Award } from 'lucide-react';
import { fetchWorkers, createWorker } from '../services/api';
import { AddWorkerModal } from '../components/Modals';

export default function WorkerManagement() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
      socket.on('worker_updated', loadWorkers);
    return () => {
      socket.off('worker_updated', loadWorkers);
    };
  }, [socket]);

  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Service Categories');
  const [kycFilter, setKycFilter] = useState('All KYC Statuses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState(null);

  const loadWorkers = async () => {
    try {
      const data = await fetchWorkers({ search, category: categoryFilter, kycStatus: kycFilter });
      setWorkers(data.workers || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [search, categoryFilter, kycFilter]);

  const handleAddWorker = async (formData) => {
    try {
      await createWorker(formData);
      loadWorkers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      {/* KPI Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Workers</span>
            <span className="stat-value">{stats ? stats.totalWorkers : '0'}</span>
            <span className="stat-subtext">Registered specialists</span>
          </div>
          <div className="stat-icon-wrapper">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">KYC Verified</span>
            <span className="stat-value">{stats ? stats.kycVerified : '0'}</span>
            <span className="stat-subtext">Identity & documents verified</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Currently On Duty</span>
            <span className="stat-value">{stats ? stats.onDuty : '0'}</span>
            <span className="stat-subtext">Available for job assignment</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 74, 102, 0.12)', color: 'rgb(56, 74, 102)' }}>
            <Zap size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Avg Worker Rating</span>
            <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {stats ? stats.avgRating : '4.86'} <Star size={20} fill="#F59E0B" color="#F59E0B" />
            </span>
            <span className="stat-subtext">Service quality score</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
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
              placeholder="Search worker profile, category, or phone..."
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
              <option value="All Service Categories">All Service Categories</option>
              <option value="AC Repair & Electrical">AC Repair & Electrical</option>
              <option value="Plumbing & Pipe Fitting">Plumbing & Pipe Fitting</option>
              <option value="Home Deep Cleaning">Home Deep Cleaning</option>
              <option value="Appliance Fix & Wiring">Appliance Fix & Wiring</option>
            </select>

            <select 
              className="select-dropdown"
              value={kycFilter}
              onChange={e => setKycFilter(e.target.value)}
            >
              <option value="All KYC Statuses">All KYC Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending KYC">Pending KYC</option>
            </select>

            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Add Worker Profile</span>
            </button>
          </div>
        </div>

        {/* Worker Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Worker Profile</th>
                <th>Service Category</th>
                <th>KYC Status</th>
                <th>Availability</th>
                <th>Assigned Jobs</th>
                <th>Ratings</th>
                <th>Total Earnings & Commission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{w.id}</td>

                  <td>
                    <div className="profile-cell">
                      <div className="profile-avatar-circle">{w.avatar}</div>
                      <div className="profile-details">
                        <span className="profile-name">{w.name}</span>
                        <span className="profile-contact">{w.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ 
                      background: '#F1F5F9', 
                      color: '#334155', 
                      padding: '4px 10px', 
                      borderRadius: 6, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {w.category}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${w.kycStatus === 'Verified' ? 'verified' : 'pending-kyc'}`}>
                      {w.kycStatus === 'Verified' ? 'Verified ✓' : 'Pending KYC ⏳'}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${
                      w.availability === 'On Duty' ? 'on-duty' :
                      w.availability === 'In Session' ? 'in-session' : 'offline'
                    }`}>
                      {w.availability}
                    </span>
                  </td>

                  <td style={{ fontSize: 13, color: '#475569' }}>
                    <strong>{w.activeJobsCount} active</strong> ({w.totalJobsCount} total)
                  </td>

                  <td>
                    <span className="badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {w.rating} <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>
                        ₹{w.totalEarnings?.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        Comm: {w.commissionRate}% | Net: ₹{w.netEarnings?.toLocaleString()}
                      </span>
                    </div>
                  </td>

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

      <AddWorkerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddWorker}
      />
    </div>
  );
}
