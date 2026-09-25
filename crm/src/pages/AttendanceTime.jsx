import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Inbox, Sun, ChevronLeft, ChevronRight, X, CheckCircle2, Check, XCircle } from 'lucide-react';
import { fetchLeaveRequests, createLeaveRequest, updateLeaveStatus, fetchCrmUsers, fetchAttendanceLogs, markAttendance } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AttendanceTime() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
      socket.on('attendance_updated', loadData);
      socket.on('leave_updated', loadData);
    return () => {
      socket.off('attendance_updated', loadData);
      socket.off('leave_updated', loadData);
    };
  }, [socket]);

  const { currentUser } = useAuth();
  const today = new Date();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [monthOffset, setMonthOffset] = useState(0);

  // Modals state
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showOnLeaveModal, setShowOnLeaveModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [markForm, setMarkForm] = useState({
    workerName: '',
    category: 'AC Repair & Electrical',
    date: today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    actionType: 'Check In'
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);

  const [workersList, setWorkersList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Load Leave Requests from Database
  const loadData = async () => {
    try {
      setIsLoadingLeaves(true);
      const [leaveData, logsData, usersData] = await Promise.all([
        fetchLeaveRequests(),
        fetchAttendanceLogs(),
        fetchCrmUsers()
      ]);
      setLeaveRequests(leaveData.requests || []);
      setAttendanceRecords(logsData.logs || []);
      setWorkersList(usersData.users || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load attendance data');
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedLeavesCount = leaveRequests.filter(r => r.status === 'Approved').length;


  // Generate Month Details dynamically
  const getMonthDetails = (offset) => {
    const baseDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const monthName = baseDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0

    const days = [];
    // Padding days for grid alignment
    for (let i = 0; i < firstDay; i++) {
      days.push({ empty: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      if (offset < 0) {
        days.push({ day: d, present: 0, absent: 0, leave: 0, isPast: true });
      } else if (offset > 0) {
        days.push({ day: d, upcoming: true });
      } else {
        if (d <= today.getDate()) {
          days.push({ day: d, present: 0, absent: 0, leave: 0, isPast: true });
        } else {
          days.push({ day: d, upcoming: true });
        }
      }
    }

    return { monthName, days };
  };

  const currentMonthData = getMonthDetails(monthOffset);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handlePrevMonth = () => {
    setMonthOffset(prev => prev - 1);
  };

  const handleNextMonth = () => {
    setMonthOffset(prev => prev + 1);
  };

  const handleToday = () => {
    setMonthOffset(0);
    setSelectedDay(today.getDate());
  };

  const handleMarkAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedWorker = workersList.find(w => w.name === markForm.workerName);
      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const attendanceData = {
        workerId: selectedWorker ? selectedWorker.id : null,
        workerName: markForm.workerName,
        date: markForm.date,
        actionType: markForm.actionType,
        time: currentTime
      };

      await markAttendance(attendanceData);
      setShowMarkModal(false);
      showToast(`${markForm.actionType} successful for ${markForm.workerName}!`);
      loadData();
    } catch (err) {
      showToast(`Failed to ${markForm.actionType}. Please check if you have an active session.`);
    }
  };

  const handleAbsenceSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData(e.target);
      const leaveData = {
        workerName: form.get('workerName'),
        leaveType: form.get('leaveType'),
        startDate: form.get('startDate'),
        endDate: form.get('endDate'),
        reason: form.get('reason')
      };
      await createLeaveRequest(leaveData);
      setShowAbsenceModal(false);
      showToast(`Absence request submitted for ${leaveData.workerName}! Pending approval.`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to submit leave request');
    }
  };

  const handleActionLeave = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      showToast(`Leave request ${status.toLowerCase()}!`);
      loadData();
    } catch (err) {
      showToast(`Failed to update leave request`);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    setAttendanceRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
    setEditingRecord(null);
    showToast(`Attendance record updated for ${editingRecord.name}`);
  };

  const filtered = attendanceRecords.filter(r => {
    const workerName = r.worker_name || r.name || '';
    const recordId = r.worker_id ? `WRK-${r.worker_id}` : (r.id ? `LOG-${r.id}` : '');
    
    // Role-based visibility check
    const matchesUser = currentUser?.isAdmin || workerName === currentUser?.name;

    const matchesSearch = recordId.toLowerCase().includes(search.toLowerCase()) ||
      workerName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Statuses' || r.status === statusFilter;
    
    const matchesDate = dateFilter === 'All Dates' || r.date === dateFilter;

    return matchesUser && matchesSearch && matchesStatus && matchesDate;
  });

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

      {/* 2 Top Action Stat Cards (Clickable) - Only for Admin */}
      {!!currentUser?.isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div 
            className="stat-card" 
            onClick={() => setStatusFilter('Absent')}
            style={{
              borderLeft: '4px solid #EF4444',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            title="Click to view all Absent & Pending Requests"
          >
            <div className="stat-info">
              <span className="stat-title" style={{ color: '#991B1B', fontWeight: 700 }}>Absence Requests</span>
              <span className="stat-value" style={{ fontSize: 24, color: '#991B1B' }}>{pendingLeavesCount} <span style={{ fontSize: 14, fontWeight: 600, color: '#791919' }}>Pending Requests</span></span>
              <span className="stat-subtext" style={{ color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={14} /> Needs Manager Approval (Scroll down to view)
              </span>
            </div>
            <div className="stat-icon" style={{ background: '#FECACA' }}>
              <Inbox size={22} color="#DC2626" />
            </div>
          </div>

          <div 
            className="stat-card" 
            onClick={() => setShowOnLeaveModal(true)}
            style={{
              borderLeft: '4px solid #F59E0B',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            title="Click to view all Approved Leaves"
          >
            <div className="stat-info">
              <span className="stat-title" style={{ color: '#92400E', fontWeight: 700 }}>On Leave Today</span>
              <span className="stat-value" style={{ fontSize: 24, color: '#92400E' }}>{approvedLeavesCount} <span style={{ fontSize: 14, fontWeight: 600, color: '#A16207' }}>Workers</span></span>
              <span className="stat-subtext" style={{ color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sun size={14} /> Approved Staff Leaves (Click to Filter)
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Sun size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Calendar Card Section */}
      <div className="card-section" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 20, fontWeight: 800 }}>{currentMonthData.monthName}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn-secondary" 
              onClick={handlePrevMonth}
              style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            >
              <ChevronLeft size={16} /> Previous Month
            </button>
            <button 
              className="btn-secondary"
              onClick={handleToday}
              style={{ cursor: 'pointer', background: monthOffset === 0 ? '#1E293B' : '#F1F5F9', color: monthOffset === 0 ? '#FFF' : '#334155' }}
            >
              Today
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleNextMonth}
              style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            >
              Next Month <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 12 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={idx} style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#64748B', paddingBottom: 8 }}>
              {day}
            </div>
          ))}

          {currentMonthData.days.map((c, idx) => {
            if (c.empty) {
              return <div key={idx} style={{ minHeight: 85 }} />;
            }

            const isSelected = monthOffset === 0 && selectedDay === c.day;
            return (
              <div 
                key={idx} 
                onClick={() => !c.upcoming && setSelectedDay(c.day)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2px solid #1E293B' : '1px solid #F1F5F9',
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 85,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: c.upcoming ? 'default' : 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(30, 41, 59, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 15, color: isSelected ? '#1E293B' : '#0F172A' }}>{c.day}</span>

                {c.upcoming ? (
                  <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Upcoming</span>
                ) : (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {c.present > 0 && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); setStatusFilter('Present'); }}
                        style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        title="Filter Present workers"
                      >
                        🟢 {c.present}
                      </span>
                    )}
                    {c.absent > 0 && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); setStatusFilter('Absent'); }}
                        style={{ background: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        title="Filter Absent workers"
                      >
                        🔴 {c.absent}
                      </span>
                    )}
                    {c.leave > 0 && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); setStatusFilter('On Leave'); }}
                        style={{ background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        title="Filter On Leave workers"
                      >
                        🟡 {c.leave}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Requests Section: Admin sees Pending only, Staff sees all their own requests (History) */}
      {(currentUser?.isAdmin ? pendingLeavesCount > 0 : leaveRequests.filter(r => r.worker_name === currentUser?.name).length > 0) && (
        <div className="card-section" style={{ marginTop: 24, borderLeft: currentUser?.isAdmin ? '4px solid #EF4444' : '4px solid #3B82F6' }}>
          <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: currentUser?.isAdmin ? '#991B1B' : '#1E40AF', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Inbox size={20} /> {currentUser?.isAdmin ? 'Pending Absence Requests' : 'My Leave Requests History'}
            </h3>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Submitted At</th>
                  <th>Status/Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests
                  .filter(r => currentUser?.isAdmin ? r.status === 'Pending' : r.worker_name === currentUser?.name)
                  .map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.worker_name}</td>
                    <td><span className="badge-outline">{r.leave_type}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.start_date} to {r.end_date}</td>
                    <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>{r.reason}</td>
                    <td style={{ fontSize: 12, color: '#64748B' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      {currentUser?.isAdmin ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            className="btn-primary"
                            onClick={() => handleActionLeave(r.id, 'Approved')}
                            style={{ background: '#22C55E', padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => handleActionLeave(r.id, 'Rejected')}
                            style={{ color: '#EF4444', padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ 
                          fontSize: 12, 
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: r.status === 'Approved' ? '#DCFCE7' : r.status === 'Rejected' ? '#FEE2E2' : '#F1F5F9',
                          color: r.status === 'Approved' ? '#15803D' : r.status === 'Rejected' ? '#B91C1C' : '#64748B'
                        }}>
                          {r.status === 'Pending' ? '⏳ Awaiting Admin' : r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Worker Attendance Table Card */}
      <div className="card-section" style={{ marginTop: 24 }}>
        <div className="controls-bar">
          <div className="search-input-wrapper">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text"
              placeholder="Search worker name, ID or category..."
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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>

            <select 
              className="select-dropdown"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="All Dates">All Dates</option>
              <option value={today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}>
                Today ({today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
              </option>
              <option value={new Date(today.getTime() - 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}>
                Yesterday ({new Date(today.getTime() - 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
              </option>
            </select>

            {!currentUser?.isAdmin && (
              <>
                <button 
                  className="btn-primary" 
                  onClick={() => setShowAbsenceModal(true)}
                  style={{ background: '#EF4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)', cursor: 'pointer' }}
                >
                  <Plus size={18} />
                  <span>Request Absence 📩</span>
                </button>

                <button 
                  className="btn-primary"
                  onClick={() => setShowMarkModal(true)}
                  style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 12px rgba(56, 74, 102, 0.25)', cursor: 'pointer' }}
                >
                  <Plus size={18} />
                  <span>Mark Attendance</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Worker Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {filtered.map((r, i) => {
                  const workerDetails = workersList.find(w => w.name === r.worker_name);
                  const phone = workerDetails ? workerDetails.phone : "+91 99999 00000";
                  const category = workerDetails ? workerDetails.service_category : "Staff";
                  const avatar = r.worker_name ? r.worker_name.split(' ').map(n => n[0]).join('') : "U";
                  return (
                    <tr key={r.id || i}>
                      <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>{r.worker_id ? `WRK-${r.worker_id}` : `LOG-${r.id}`}</td>

                      <td>
                        <div className="profile-cell">
                          <div className="profile-avatar-circle" style={{ background: '#1E293B', color: '#FFFFFF' }}>
                            {avatar}
                          </div>
                          <div className="profile-details">
                            <span className="profile-name">{r.worker_name}</span>
                            <span className="profile-contact">{phone}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge-outline" style={{ background: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1' }}>
                          {category}
                        </span>
                      </td>

                      <td style={{ fontSize: 13, color: '#334155' }}>{r.date}</td>

                      <td>
                        <span className={`status-pill ${
                          r.status === 'Present' ? 'completed' :
                          r.status === 'Absent' ? 'cancelled' : 'pending'
                        }`}>
                          {r.status} {r.status === 'Present' ? '🟢' : r.status === 'Absent' ? '🔴' : '🟡'}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{r.check_in}</td>
                      <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>{r.check_out}</td>

                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{r.total_hours}</td>

                      <td>
                        {currentUser?.isAdmin && (
                          <button 
                            className="btn-secondary"
                            onClick={() => setEditingRecord({ ...r })}
                            style={{ cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: '#64748B' }}>
          Showing {filtered.length} worker attendance records for {selectedDay} Aug 2026 ({currentMonthData.monthName})
        </div>
      </div>

      {/* Modal 1: Mark Attendance (Dark Navy Theme) */}
      {showMarkModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF' }}>Mark Worker Attendance</h3>
              <button className="modal-close" onClick={() => setShowMarkModal(false)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleMarkAttendanceSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Worker Name</label>
                  <select 
                    className="form-control"
                    value={markForm.workerName}
                    onChange={e => setMarkForm({ ...markForm, workerName: e.target.value })}
                  >
                    <option value="">Select Worker...</option>
                    {workersList.map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.role || 'Worker'})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Action</label>
                  <select 
                    className="form-control"
                    value={markForm.actionType}
                    onChange={e => setMarkForm({ ...markForm, actionType: e.target.value })}
                  >
                    <option value="Check In">Check In (Start Shift) 🟢</option>
                    <option value="Check Out">Check Out (End Shift) 🔴</option>
                  </select>
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                    Current time will be saved automatically upon submission.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowMarkModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)' }}>{markForm.actionType}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Request Absence (Red Theme) */}
      {showAbsenceModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ background: '#FEE2E2', borderBottom: '1px solid #FCA5A5' }}>
              <h3 style={{ color: '#991B1B' }}>Request Absence / Staff Leave</h3>
              <button className="modal-close" onClick={() => setShowAbsenceModal(false)} style={{ color: '#DC2626' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAbsenceSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Worker Name</label>
                  <select 
                    className="form-control"
                    name="workerName"
                  >
                    {workersList.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Leave Type</label>
                  <select 
                    className="form-control"
                    name="leaveType"
                    defaultValue="Casual Leave"
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" className="form-control" name="startDate" required />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" className="form-control" name="endDate" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason for Leave</label>
                  <textarea 
                    className="form-control"
                    name="reason"
                    rows={3}
                    placeholder="Enter reason..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAbsenceModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#EF4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)' }}>Submit Leave Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Attendance */}
      {editingRecord && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <h3 style={{ color: '#FFFFFF' }}>Edit Attendance - {editingRecord.name}</h3>
              <button className="modal-close" onClick={() => setEditingRecord(null)} style={{ color: '#94A3B8' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="form-control"
                    value={editingRecord.status}
                    onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value })}
                  >
                    <option value="Present">Present 🟢</option>
                    <option value="Absent">Absent 🔴</option>
                    <option value="On Leave">On Leave 🟡</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Check In</label>
                    <input 
                      className="form-control"
                      value={editingRecord.checkIn}
                      onChange={e => setEditingRecord({ ...editingRecord, checkIn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Check Out</label>
                    <input 
                      className="form-control"
                      value={editingRecord.checkOut}
                      onChange={e => setEditingRecord({ ...editingRecord, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Total Hours</label>
                  <input 
                    className="form-control"
                    value={editingRecord.totalHours}
                    onChange={e => setEditingRecord({ ...editingRecord, totalHours: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: On Leave Details */}
      {showOnLeaveModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 600 }}>
            <div className="modal-header" style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A' }}>
              <h3 style={{ color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sun size={20} /> Workers On Leave Today
              </h3>
              <button className="modal-close" onClick={() => setShowOnLeaveModal(false)} style={{ color: '#B45309' }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {leaveRequests.filter(r => r.status === 'Approved').length > 0 ? (
                <div className="table-responsive" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ background: '#FFFBEB' }}>Worker Name</th>
                        <th style={{ background: '#FFFBEB' }}>Leave Type</th>
                        <th style={{ background: '#FFFBEB' }}>Dates</th>
                        <th style={{ background: '#FFFBEB' }}>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.filter(r => r.status === 'Approved').map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700 }}>{r.worker_name}</td>
                          <td><span className="badge-outline" style={{ borderColor: '#F59E0B', color: '#D97706' }}>{r.leave_type}</span></td>
                          <td style={{ fontSize: 13, color: '#475569' }}>{r.start_date} - {r.end_date}</td>
                          <td style={{ fontSize: 13 }}>{r.reason || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                  <Sun size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                  <p>No workers are on leave today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
