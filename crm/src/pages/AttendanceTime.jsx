import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Search, Plus, Inbox, Sun, ChevronLeft, ChevronRight, X, CheckCircle2, Check, XCircle, FileText, ClipboardList } from 'lucide-react';
import { fetchLeaveRequests, createLeaveRequest, updateLeaveStatus, fetchCrmUsers, fetchAttendanceLogs, markAttendance, fetchWorkers, fetchIndianHolidays, updateWorkDescription } from '../services/api';
import { useAuth } from '../context/AuthContext';

function calculateTotalHours(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr || checkInStr === '--' || checkOutStr === '--') {
    return '--';
  }

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const cleanStr = timeStr.trim().toUpperCase();
    const isPM = cleanStr.includes('PM');
    const isAM = cleanStr.includes('AM');
    
    const timeOnly = cleanStr.replace(/(AM|PM)/g, '').trim();
    const parts = timeOnly.split(':');
    if (parts.length < 2) return null;
    
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return null;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const startMins = parseTimeToMinutes(checkInStr);
  const endMins = parseTimeToMinutes(checkOutStr);

  if (startMins === null || endMins === null) {
    return '--';
  }

  let diffMins = endMins - startMins;
  if (diffMins < 0) {
    diffMins += 24 * 60;
  }

  if (diffMins === 0) return '0.0 hrs';
  
  const hrs = (diffMins / 60).toFixed(1);
  if (hrs === '0.0' && diffMins > 0) {
    return `${diffMins} mins`;
  }
  return `${hrs} hrs`;
}

const DEFAULT_INDIAN_HOLIDAYS = [
  // 2026 (10 Selected Holidays)
  { date: '2026-01-26', name: 'Republic Day', localName: 'Republic Day' },
  { date: '2026-03-04', name: 'Holi', localName: 'Holi' },
  { date: '2026-05-01', name: 'Labour Day', localName: 'Labour Day' },
  { date: '2026-08-15', name: 'Independence Day', localName: 'Independence Day' },
  { date: '2026-08-28', name: 'Raksha Bandhan', localName: 'Raksha Bandhan' },
  { date: '2026-09-04', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra', localName: 'Vijayadashami / Dussehra' },
  { date: '2026-11-08', name: 'Diwali', localName: 'Deepavali / Diwali' },
  { date: '2026-12-25', name: 'Christmas', localName: 'Christmas' },

  // 2027 (10 Selected Holidays)
  { date: '2027-01-26', name: 'Republic Day', localName: 'Republic Day' },
  { date: '2027-03-22', name: 'Holi', localName: 'Holi' },
  { date: '2027-05-01', name: 'Labour Day', localName: 'Labour Day' },
  { date: '2027-08-15', name: 'Independence Day', localName: 'Independence Day' },
  { date: '2027-08-17', name: 'Raksha Bandhan', localName: 'Raksha Bandhan' },
  { date: '2027-08-25', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami' },
  { date: '2027-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
  { date: '2027-10-09', name: 'Dussehra', localName: 'Vijayadashami / Dussehra' },
  { date: '2027-10-29', name: 'Diwali', localName: 'Deepavali / Diwali' },
  { date: '2027-12-25', name: 'Christmas', localName: 'Christmas' },

  // 2028 (10 Selected Holidays)
  { date: '2028-01-26', name: 'Republic Day', localName: 'Republic Day' },
  { date: '2028-03-11', name: 'Holi', localName: 'Holi' },
  { date: '2028-05-01', name: 'Labour Day', localName: 'Labour Day' },
  { date: '2028-08-15', name: 'Independence Day', localName: 'Independence Day' },
  { date: '2028-08-05', name: 'Raksha Bandhan', localName: 'Raksha Bandhan' },
  { date: '2028-08-13', name: 'Krishna Janmashtami', localName: 'Krishna Janmashtami' },
  { date: '2028-10-02', name: 'Gandhi Jayanti', localName: 'Gandhi Jayanti' },
  { date: '2028-09-28', name: 'Dussehra', localName: 'Vijayadashami / Dussehra' },
  { date: '2028-10-17', name: 'Diwali', localName: 'Deepavali / Diwali' },
  { date: '2028-12-25', name: 'Christmas', localName: 'Christmas' }
];

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

  // Daily Work Log modal state
  const [workLogModalRecord, setWorkLogModalRecord] = useState(null);
  const [workLogInput, setWorkLogInput] = useState('');
  const [isSavingWorkLog, setIsSavingWorkLog] = useState(false);

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
  const [holidays, setHolidays] = useState(DEFAULT_INDIAN_HOLIDAYS);

  // Load Leave Requests & Indian Holidays from Database/API
  const loadData = async () => {
    try {
      setIsLoadingLeaves(true);
      const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
      const targetYear = targetDate.getFullYear();

      const [leaveData, logsData, usersData, workersData, holidayData] = await Promise.all([
        fetchLeaveRequests(),
        fetchAttendanceLogs(),
        fetchCrmUsers(),
        fetchWorkers().catch(() => ({ workers: [] })),
        fetchIndianHolidays(targetYear).catch(() => ({ holidays: [] }))
      ]);
      setLeaveRequests(leaveData.requests || []);
      setAttendanceRecords(logsData.logs || []);
      const crmUsers = usersData.users || [];
      setWorkersList(crmUsers);

      const fetchedHolidays = holidayData.holidays || [];
      const mergedMap = {};
      [...DEFAULT_INDIAN_HOLIDAYS, ...fetchedHolidays].forEach(h => {
        if (h.date) mergedMap[h.date] = h;
      });
      setHolidays(Object.values(mergedMap));
    } catch (err) {
      console.error(err);
      showToast('Failed to load attendance data');
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [monthOffset]);

  const getHolidayForDay = (dayNumber) => {
    if (!dayNumber || !holidays.length) return null;
    const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, dayNumber);
    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayNumber).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    return holidays.find(h => h.date === dateStr);
  };

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

    const checkIn = editingRecord.check_in || editingRecord.checkIn || '--';
    const checkOut = editingRecord.check_out || editingRecord.checkOut || '--';
    const computedHours = calculateTotalHours(checkIn, checkOut);

    const updated = {
      ...editingRecord,
      check_in: checkIn,
      check_out: checkOut,
      total_hours: computedHours !== '--' ? computedHours : (editingRecord.total_hours || editingRecord.totalHours || '--')
    };

    setAttendanceRecords(prev => prev.map(r => r.id === editingRecord.id ? updated : r));
    setEditingRecord(null);
    showToast(`Attendance record updated for ${editingRecord.worker_name || editingRecord.name || 'Worker'}`);
  };

  const openWorkLogModal = (record) => {
    setWorkLogModalRecord(record);
    const existing = record.work_description || record.workDescription || '';
    if (!existing) {
      setWorkLogInput('• ');
    } else {
      const formatted = existing.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
          return line;
        }
        return `• ${line}`;
      }).join('\n');
      setWorkLogInput(formatted);
    }
  };

  const handleWorkLogKeyDown = (e) => {
    if (currentUser?.isAdmin) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const cursor = e.target.selectionStart;
      const value = workLogInput;

      const linesBefore = value.substring(0, cursor).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      if (currentLine.trim() === '•') {
        const lineStartPos = cursor - currentLine.length;
        const newValue = value.substring(0, lineStartPos) + value.substring(cursor);
        setWorkLogInput(newValue);
        setTimeout(() => {
          if (e.target) e.target.selectionStart = e.target.selectionEnd = lineStartPos;
        }, 0);
        return;
      }

      const before = value.substring(0, cursor);
      const after = value.substring(cursor);
      const newValue = before + '\n• ' + after;
      setWorkLogInput(newValue);

      setTimeout(() => {
        if (e.target) e.target.selectionStart = e.target.selectionEnd = cursor + 3;
      }, 0);
    }
  };

  const handleSaveWorkLog = async (e) => {
    e.preventDefault();
    if (!workLogModalRecord) return;
    try {
      setIsSavingWorkLog(true);
      const formattedInput = workLogInput
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
            return line;
          }
          return `• ${line}`;
        })
        .filter(Boolean)
        .join('\n');

      await updateWorkDescription(workLogModalRecord.id, formattedInput || workLogInput);
      setWorkLogModalRecord(null);
      showToast('Daily work log saved successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save work log. Please try again.');
    } finally {
      setIsSavingWorkLog(false);
    }
  };

  const filtered = attendanceRecords.filter(r => {
    const workerName = r.worker_name || r.name || '';
    const workerDetails = workersList.find(w => 
      (w.name && workerName && w.name.toLowerCase() === workerName.toLowerCase()) ||
      (w.id && r.worker_id && String(w.id) === String(r.worker_id))
    );
    const roleDisplay = workerDetails ? 
      (workerDetails.role || workerDetails.designation || (workerDetails.isAdmin ? 'Super Administrator' : 'Worker')) : 
      (r.role || r.designation || 'Staff');
    
    // Role-based visibility check
    const matchesUser = currentUser?.isAdmin || workerName === currentUser?.name;

    const matchesSearch = roleDisplay.toLowerCase().includes(search.toLowerCase()) ||
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>{currentMonthData.monthName}</h3>
            <span style={{ 
              background: '#FEF2F2', 
              color: '#991B1B', 
              border: '1px solid #FCA5A5', 
              padding: '4px 10px', 
              borderRadius: 20, 
              fontSize: 11, 
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6 
            }}>
              🇮🇳 Indian Public Holidays Synced
            </span>
          </div>
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
            const holiday = getHolidayForDay(c.day);

            return (
              <div 
                key={idx} 
                onClick={() => !c.upcoming && setSelectedDay(c.day)}
                style={{
                  background: holiday ? '#FFFDF5' : '#FFFFFF',
                  border: isSelected ? '2px solid #1E293B' : holiday ? '1.5px solid #FDE68A' : '1px solid #F1F5F9',
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: isSelected ? '#1E293B' : '#0F172A' }}>{c.day}</span>
                  {holiday && (
                    <span style={{ fontSize: 12 }} title={`Indian Holiday: ${holiday.localName || holiday.name}`}>🇮🇳</span>
                  )}
                </div>

                {holiday && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '3px 6px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }} title={`Indian Public Holiday: ${holiday.localName || holiday.name}`}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(holiday.localName || holiday.name).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim()}
                    </span>
                  </div>
                )}

                {c.upcoming ? (
                  !holiday && <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginTop: 4 }}>Upcoming</span>
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
                <th>Role / Designation</th>
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
                  const workerDetails = workersList.find(w => 
                    (w.name && r.worker_name && w.name.toLowerCase() === r.worker_name.toLowerCase()) ||
                    (w.id && r.worker_id && String(w.id) === String(r.worker_id))
                  );
                  const phone = workerDetails ? (workerDetails.phone || workerDetails.phone_number || "+91 99999 00000") : "+91 99999 00000";
                  const category = workerDetails ? (workerDetails.service_category || workerDetails.category || "Staff") : "Staff";
                  const avatar = r.worker_name ? r.worker_name.split(' ').map(n => n[0]).join('') : "U";
                  
                  const roleDisplay = workerDetails ? 
                    (workerDetails.role || workerDetails.designation || (workerDetails.isAdmin ? 'Super Administrator' : 'Worker')) : 
                    (r.role || r.designation || 'Staff');

                  return (
                    <tr key={r.id || i}>
                      <td style={{ fontWeight: 700, color: '#0F172A', fontSize: 13, whiteSpace: 'nowrap' }}>{roleDisplay}</td>

                      <td style={{ whiteSpace: 'nowrap' }}>
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

                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="badge-outline" style={{ background: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1' }}>
                          {category}
                        </span>
                      </td>

                      <td style={{ fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>{r.date}</td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`status-pill ${
                          r.status === 'Present' ? 'completed' :
                          r.status === 'Absent' ? 'cancelled' : 'pending'
                        }`}>
                          {r.status} {r.status === 'Present' ? '🟢' : r.status === 'Absent' ? '🔴' : '🟡'}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13, whiteSpace: 'nowrap' }}>{r.check_in}</td>
                      <td style={{ fontWeight: 600, color: '#0F172A', fontSize: 13, whiteSpace: 'nowrap' }}>{r.check_out}</td>

                      <td style={{ fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                        {(!r.total_hours || r.total_hours === 'Calculated') ? calculateTotalHours(r.check_in, r.check_out) : r.total_hours}
                      </td>

                      <td style={{ whiteSpace: 'nowrap', minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {currentUser?.isAdmin ? (
                            <button 
                              className="btn-secondary"
                              onClick={() => openWorkLogModal(r)}
                              style={{ 
                                background: r.work_description ? '#ECFDF5' : '#F1F5F9', 
                                color: r.work_description ? '#047857' : '#475569', 
                                borderColor: r.work_description ? '#A7F3D0' : '#CBD5E1', 
                                fontWeight: 700, 
                                padding: '6px 12px', 
                                fontSize: 12, 
                                borderRadius: 8, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 6,
                                cursor: 'pointer' 
                              }}
                              title="View Staff Daily Work Log"
                            >
                              <FileText size={14} color={r.work_description ? '#10B981' : '#64748B'} />
                              <span>View Work Log</span>
                            </button>
                          ) : (
                            r.work_description ? (
                              <button 
                                className="btn-secondary"
                                onClick={() => openWorkLogModal(r)}
                                style={{ 
                                  background: '#ECFDF5', 
                                  color: '#047857', 
                                  borderColor: '#A7F3D0', 
                                  fontWeight: 700, 
                                  padding: '6px 12px', 
                                  fontSize: 12, 
                                  borderRadius: 8, 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: 6,
                                  cursor: 'pointer' 
                                }}
                                title="View / Edit Daily Work Log"
                              >
                                <FileText size={14} color="#10B981" />
                                <span>View Work Log</span>
                              </button>
                            ) : (
                              <button 
                                className="btn-primary"
                                onClick={() => openWorkLogModal(r)}
                                style={{ 
                                  background: 'rgb(56, 74, 102)', 
                                  padding: '6px 12px', 
                                  fontSize: 12, 
                                  borderRadius: 8, 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: 6,
                                  cursor: 'pointer' 
                                }}
                                title="Add Daily Work Log"
                              >
                                <Plus size={14} />
                                <span>Work Log</span>
                              </button>
                            )
                          )}

                          {!!currentUser?.isAdmin && (
                            <button 
                              className="btn-secondary"
                              onClick={() => setEditingRecord({ ...r })}
                              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
          </table>
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
                  <label>Staff Name</label>
                  <select 
                    className="form-control"
                    value={markForm.workerName}
                    onChange={e => setMarkForm({ ...markForm, workerName: e.target.value })}
                  >
                    <option value="">Select Staff Member...</option>
                    {workersList.map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.role || w.category || 'Staff'})</option>
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
                      value={editingRecord.check_in || editingRecord.checkIn || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, check_in: e.target.value, checkIn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Check Out</label>
                    <input 
                      className="form-control"
                      value={editingRecord.check_out || editingRecord.checkOut || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, check_out: e.target.value, checkOut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Total Hours</label>
                  <input 
                    className="form-control"
                    value={editingRecord.total_hours || editingRecord.totalHours || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, total_hours: e.target.value, totalHours: e.target.value })}
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

      {/* Modal 5: Daily Work Description / Activity Log */}
      {workLogModalRecord && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header" style={{ background: 'rgb(56, 74, 102)', borderBottom: '1px solid rgb(42, 57, 79)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardList size={22} color="#FFFFFF" />
                <div>
                  <h3 style={{ color: '#FFFFFF', fontSize: 17, margin: 0 }}>Daily Work Description / Activity Log</h3>
                  <span style={{ fontSize: 12, color: '#CBD5E1' }}>
                    {workLogModalRecord.worker_name} • {workLogModalRecord.date}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setWorkLogModalRecord(null)} style={{ color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkLog}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Meta details badge */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13
                }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Check In: </span>
                    <strong style={{ color: '#0F172A' }}>{workLogModalRecord.check_in || '--'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Check Out: </span>
                    <strong style={{ color: '#0F172A' }}>{workLogModalRecord.check_out || '--'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Total: </span>
                    <strong style={{ color: '#0F172A' }}>{workLogModalRecord.total_hours || '--'}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{currentUser?.isAdmin ? 'Staff Completed Work & Tasks (Point-wise):' : "Mention Today's Completed Work & Tasks (Point-wise):"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: currentUser?.isAdmin ? '#059669' : '#3B82F6' }}>
                      {currentUser?.isAdmin ? '👁️ Admin View (Read Only)' : '✏️ Staff Edit Mode'}
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={6}
                    readOnly={!!currentUser?.isAdmin}
                    placeholder={currentUser?.isAdmin ? 'No work log submitted by staff for this date yet.' : `e.g.\n• Completed AC Repair & Service for Booking #402\n• Conducted site inspection in Sector 62\n• Updated customer status & collected feedback`}
                    value={workLogInput}
                    onChange={e => setWorkLogInput(e.target.value)}
                    onKeyDown={handleWorkLogKeyDown}
                    style={{ 
                      lineHeight: 1.6, 
                      padding: 14, 
                      fontSize: 13, 
                      fontFamily: 'inherit',
                      background: currentUser?.isAdmin ? '#F8FAFC' : '#FFFFFF',
                      cursor: currentUser?.isAdmin ? 'not-allowed' : 'text',
                      color: currentUser?.isAdmin ? '#334155' : '#0F172A'
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setWorkLogModalRecord(null)}>
                  Close
                </button>
                {!currentUser?.isAdmin && (
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSavingWorkLog}
                    style={{ background: 'rgb(56, 74, 102)', boxShadow: '0 4px 14px rgba(56, 74, 102, 0.35)', cursor: 'pointer' }}
                  >
                    {isSavingWorkLog ? 'Saving...' : 'Save Work Log 💾'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
