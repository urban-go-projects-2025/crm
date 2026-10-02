// API Integration Layer for OMW CRM Frontend

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE}${path}`;

const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

export const fetchDashboardStats = async () => {
  const res = await fetch(apiUrl('/api/dashboard/stats'), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
};

export const fetchCustomers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/customers?${query}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await fetch(apiUrl('/api/customers'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
};

export const fetchWorkers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/workers?${query}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch workers');
  return res.json();
};

export const createWorker = async (data) => {
  const res = await fetch(apiUrl('/api/workers'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create worker');
  return res.json();
};

export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/bookings?${query}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const createBooking = async (data) => {
  const res = await fetch(apiUrl('/api/bookings'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
};

export const updateBookingStatus = async (id, payload) => {
  const res = await fetch(apiUrl(`/api/bookings/${id}/status`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update booking status');
  return res.json();
};

export const fetchPayments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/payments?${query}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
};

export const fetchSupportTickets = async () => {
  const res = await fetch(apiUrl('/api/support-tickets'), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch support tickets');
  return res.json();
};

export const createSupportTicket = async (data) => {
  const res = await fetch(apiUrl('/api/support-tickets'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
};

export const resolveSupportTicket = async (id, resolutionNotes) => {
  const res = await fetch(apiUrl(`/api/support-tickets/${id}/resolve`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ resolutionNotes })
  });
  if (!res.ok) throw new Error('Failed to resolve ticket');
  return res.json();
};

export const fetchAnalytics = async () => {
  const res = await fetch(apiUrl('/api/analytics'), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

export const triggerDatabaseSync = async () => {
  const res = await fetch(apiUrl('/api/sync/trigger'), { method: 'POST', headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to sync database');
  return res.json();
};

export const loginUser = async (email, password, type) => {
  const endpoint = type === 'admin' ? '/api/auth/admin-login' : '/api/auth/user-login';
  const res = await fetch(apiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid Email or Password');
  }
  
  return await res.json();
};

export const switchUserAccount = async (userId) => {
  const res = await fetch(apiUrl('/api/auth/impersonate'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to switch user account`);
  }
  
  return await res.json();
};

export const logoutUser = async () => {
  const res = await fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: getHeaders() });
  return await res.json();
};

export const fetchMe = async () => {
  const res = await fetch(apiUrl('/api/auth/me'), { headers: getHeaders() });
  if (!res.ok) throw new Error('Not authenticated');
  return await res.json();
};

export const fetchLeaveRequests = async () => {
  const res = await fetch(apiUrl(`/api/attendance/leaves?t=${Date.now()}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch leave requests');
  return await res.json();
};

export const createLeaveRequest = async (leaveData) => {
  const res = await fetch(apiUrl('/api/attendance/leaves'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(leaveData)
  });
  if (!res.ok) throw new Error('Failed to create leave request');
  return await res.json();
};

export const updateLeaveStatus = async (id, status) => {
  const res = await fetch(apiUrl(`/api/attendance/leaves/${id}/status`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update leave status');
  return await res.json();
};

export const fetchAttendanceLogs = async () => {
  const res = await fetch(apiUrl(`/api/attendance/logs?t=${Date.now()}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch attendance logs');
  return await res.json();
};

export const markAttendance = async (data) => {
  const res = await fetch(apiUrl('/api/attendance/mark'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to mark attendance');
  return await res.json();
};

export const fetchCrmUsers = async () => {
  const res = await fetch(apiUrl('/api/crm-users'), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch CRM users');
  return await res.json();
};

export const createCrmUser = async (data) => {
  const res = await fetch(apiUrl('/api/crm-users'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create CRM user');
  }
  return await res.json();
};

export const updateCrmUser = async (id, data) => {
  const res = await fetch(apiUrl(`/api/crm-users/${id}`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update CRM user');
  }
  return await res.json();
};

export const deleteCrmUser = async (id) => {
  const res = await fetch(apiUrl(`/api/crm-users/${id}`), {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete CRM user');
  }
  return await res.json();
};

export const fetchActivityLogs = async (userId) => {
  const res = await fetch(apiUrl(`/api/activity-logs/${userId}?t=${Date.now()}`), { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return await res.json();
};
