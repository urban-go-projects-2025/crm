import React from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  MessageSquare, 
  TrendingUp 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard({ data, onNavigate }) {


  if (!data) return <div className="page-content">Loading OMW Dashboard...</div>;

  const { stats, revenueData, recentBookings, openTickets } = data;

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers?.toLocaleString() || '0', subtext: 'Registered customers', icon: Users },
    { title: 'Total Workers', value: stats.totalWorkers?.toLocaleString() || '0', subtext: 'Registered workers', icon: UserCheck },
    { title: 'Active Bookings', value: stats.activeBookings || '0', subtext: 'Currently active', icon: Calendar },
    { title: 'Completed Bookings', value: stats.completedBookings || '0', subtext: 'Successfully completed', icon: CheckCircle2 },
    { title: 'Cancelled Bookings', value: stats.cancelledBookings || '0', subtext: 'Total cancelled', icon: XCircle },
    { title: 'Pending Payments', value: `₹${(stats.pendingPayments || 0).toLocaleString()}`, subtext: 'Awaiting payment', icon: IndianRupee },
    { title: 'Open Support Tickets', value: stats.openSupportTickets || '0', subtext: 'Tickets need attention', icon: MessageSquare },
    { title: 'Daily Revenue', value: `₹${(stats.dailyRevenue || 0).toLocaleString()}`, subtext: "Today's revenue", icon: IndianRupee },
  ];

  return (
    <div className="page-content">
      {/* 8 Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-info">
                <span className="stat-title">{card.title}</span>
                <span className="stat-value">{card.value}</span>
                <span className="stat-subtext">{card.subtext}</span>
              </div>
              <div className="stat-icon-wrapper">
                <IconComp size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Booking Overview */}
      <div className="dashboard-middle-row">
        <div className="card-section">
          <div className="card-header">
            <div>
              <h3>Revenue Overview</h3>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                ₹{(stats.totalRevenue || 0).toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>Total revenue generated</p>
            </div>
            <span style={{ fontSize: 12, color: '#1E293B', fontWeight: 600 }}>Last 7 Days</span>
          </div>

          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="revenue" fill="#1E293B" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-section">
          <div className="card-header">
            <h3>Booking Overview</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1E293B' }}></span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Active</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{stats.activeBookings || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Completed</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{stats.completedBookings || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Cancelled</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{stats.cancelledBookings || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8FAFC', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Pending</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{stats.pendingBookings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="card-section">
        <div className="card-header">
          <h3>Recent Bookings</h3>
          <span className="view-all-link" onClick={() => onNavigate('bookings')}>View All</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Worker</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentBookings || []).map((booking) => (
                <tr key={booking.id}>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{booking.customerName}</td>
                  <td style={{ color: '#475569' }}>{booking.workerName}</td>
                  <td style={{ color: '#475569' }}>{booking.service}</td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{booking.date}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>₹{booking.amount?.toLocaleString()}</td>
                  <td>
                    <span className={`status-pill ${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Support Tickets */}
      <div className="card-section">
        <div className="card-header">
          <h3>Open Support Tickets</h3>
          <span className="view-all-link" onClick={() => onNavigate('support')}>View All</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(openTickets || []).map((ticket) => (
            <div key={ticket.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px', 
              borderBottom: '1px solid #F1F5F9' 
            }}>
              <div>
                <span style={{ fontWeight: 700, color: '#0F172A', display: 'block', fontSize: 14 }}>
                  {ticket.title}
                </span>
                <span style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Customer: {ticket.customer}
                </span>
              </div>

              <span className="status-pill pending" style={{ fontSize: 12 }}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
