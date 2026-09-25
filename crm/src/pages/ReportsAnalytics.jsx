import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, ShoppingBag, Zap, Download, FileText, Star } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { fetchAnalytics } from '../services/api';
import { ExportReportModal } from '../components/Modals';

export default function ReportsAnalytics() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    grossRevenue: 0,
    platformCommission: 0,
    complaintResolutionRate: "98.1%"
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [servicePerformance, setServicePerformance] = useState([]);
  const [workerBreakdown, setWorkerBreakdown] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [reportTypeFilter, setReportTypeFilter] = useState('Daily Booking Report');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAnalytics();
        if (data.stats) setStats(data.stats);
        if (data.weeklyData) setWeeklyData(data.weeklyData);
        if (data.servicePerformance) setServicePerformance(data.servicePerformance);
        if (data.workerBreakdown) setWorkerBreakdown(data.workerBreakdown);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };
    loadData();
  }, []);

  const handleOpenExportModal = (format) => {
    setExportFormat(format);
    setIsModalOpen(true);
  };

  const handleExportReport = (config) => {
    alert(`✅ ${config.format} Report generated successfully!\nType: ${config.reportType}\nRange: ${config.dateRange}`);
  };

  return (
    <div className="page-content">
      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Daily Booking Growth</span>
            <span className="stat-value">{stats.totalBookings} Bookings</span>
            <span className="stat-subtext">+18.4% month-on-month</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Gross Revenue</span>
            <span className="stat-value">₹{stats.grossRevenue.toLocaleString()}</span>
            <span className="stat-subtext">Platform gross customer payments</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <IndianRupee size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Platform Commission</span>
            <span className="stat-value">₹{Math.round(stats.platformCommission).toLocaleString()}</span>
            <span className="stat-subtext">Net platform earnings (16% avg)</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Complaint Resolution Rate</span>
            <span className="stat-value">{stats.complaintResolutionRate}</span>
            <span className="stat-subtext">Tickets resolved under 24 hours</span>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#E2E8F0', color: '#1E293B' }}>
            <Zap size={20} />
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="controls-bar" style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: 16, border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Report Type & Range:</span>
          <select 
            className="select-dropdown" 
            style={{ background: '#F8FAFC' }}
            value={reportTypeFilter}
            onChange={e => setReportTypeFilter(e.target.value)}
          >
            <option value="Daily Booking Report">Daily Booking Report</option>
            <option value="Weekly Revenue Report">Weekly Revenue Report</option>
            <option value="Monthly Analytics">Monthly Analytics</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={() => handleOpenExportModal('CSV')}
            style={{ background: '#10B981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', cursor: 'pointer' }}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn-primary"
            onClick={() => handleOpenExportModal('PDF')}
            style={{ cursor: 'pointer' }}
          >
            <FileText size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts split */}
      <div className="dashboard-middle-row">
        <div className="card-section">
          <div className="card-header">
            <div>
              <h3>Daily Booking & Revenue Trend</h3>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                ₹{stats.grossRevenue.toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Total revenue generated across {stats.totalBookings} bookings</p>
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Aug 2026</span>
          </div>

          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#1E293B" radius={[6, 6, 0, 0]} barSize={54} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-section">
          <div className="card-header">
            <h3>Service-Wise Performance</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {servicePerformance.map((sp, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {sp.name} ({sp.jobs} Jobs)
                  </span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    ₹{Math.round(sp.revenue).toLocaleString()} | Comm: ₹{Math.round(sp.comm).toLocaleString()}
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: sp.width, height: '100%', background: sp.color, borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Performance & Revenue Breakdown */}
      <div className="card-section">
        <div className="card-header">
          <h3>Worker Performance & Revenue Breakdown</h3>
          <button 
            className="btn-secondary"
            onClick={() => handleOpenExportModal('PDF')}
            style={{ cursor: 'pointer' }}
          >
            Export Worker Performance Matrix
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Service Category</th>
                <th>Jobs Completed</th>
                <th>Worker Rating</th>
                <th>Total Generated Revenue</th>
                <th>Platform Commission (15-20%)</th>
              </tr>
            </thead>
            <tbody>
              {workerBreakdown.map((wb, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{wb.name}</td>
                  <td style={{ color: '#475569' }}>{wb.category}</td>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{wb.jobs}</td>
                  <td>
                    <span className="badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {wb.rating} <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#0F172A' }}>{wb.revenue}</td>
                  <td style={{ fontWeight: 800, color: '#1E293B' }}>{wb.comm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive JavaScript Modal Plugin Component */}
      <ExportReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFormat={exportFormat}
        onExport={handleExportReport}
      />
    </div>
  );
}
