// API Integration Layer for OMW CRM Frontend

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE}${path}`;

const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const parseResponse = async (res, defaultError = 'Request failed') => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || defaultError);
    }
    if (res.status === 405) {
      throw new Error('HTTP 405 Method Not Allowed: Check Vercel backend route configuration.');
    }
    throw new Error(`${defaultError} (HTTP ${res.status})`);
  }

  if (!isJson) {
    throw new Error(`${defaultError}: Non-JSON response received`);
  }

  return await res.json();
};

export const fetchDashboardStats = async () => {
  const res = await fetch(apiUrl('/api/dashboard/stats'), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch dashboard stats');
};

export const fetchCustomers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/customers?${query}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch customers');
};

export const createCustomer = async (data) => {
  const res = await fetch(apiUrl('/api/customers'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create customer');
};

export const fetchWorkers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/workers?${query}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch workers');
};

export const createWorker = async (data) => {
  const res = await fetch(apiUrl('/api/workers'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create worker');
};

export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/bookings?${query}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch bookings');
};

export const createBooking = async (data) => {
  const res = await fetch(apiUrl('/api/bookings'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create booking');
};

export const updateBookingStatus = async (id, payload) => {
  const res = await fetch(apiUrl(`/api/bookings/${id}/status`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return parseResponse(res, 'Failed to update booking status');
};

export const fetchPayments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(apiUrl(`/api/payments?${query}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch payments');
};

export const fetchSupportTickets = async () => {
  const res = await fetch(apiUrl('/api/support-tickets'), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch support tickets');
};

export const createSupportTicket = async (data) => {
  const res = await fetch(apiUrl('/api/support-tickets'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create ticket');
};

export const resolveSupportTicket = async (id, resolutionNotes) => {
  const res = await fetch(apiUrl(`/api/support-tickets/${id}/resolve`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ resolutionNotes })
  });
  return parseResponse(res, 'Failed to resolve ticket');
};

export const fetchAnalytics = async () => {
  const res = await fetch(apiUrl('/api/analytics'), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch analytics');
};

export const triggerDatabaseSync = async () => {
  const res = await fetch(apiUrl('/api/sync/trigger'), { method: 'POST', headers: getHeaders() });
  return parseResponse(res, 'Failed to sync database');
};

export const loginUser = async (email, password, type) => {
  const endpoint = type === 'admin' ? '/api/auth/admin-login' : '/api/auth/user-login';
  const res = await fetch(apiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res, 'Invalid Email or Password');
};

export const switchUserAccount = async (userId) => {
  const res = await fetch(apiUrl('/api/auth/impersonate'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId })
  });
  return parseResponse(res, 'Failed to switch user account');
};

export const logoutUser = async () => {
  const res = await fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: getHeaders() });
  return parseResponse(res, 'Failed to logout');
};

export const fetchMe = async () => {
  const res = await fetch(apiUrl('/api/auth/me'), { headers: getHeaders() });
  return parseResponse(res, 'Not authenticated');
};

export const fetchLeaveRequests = async () => {
  const res = await fetch(apiUrl(`/api/attendance/leaves?t=${Date.now()}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch leave requests');
};

export const createLeaveRequest = async (leaveData) => {
  const res = await fetch(apiUrl('/api/attendance/leaves'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(leaveData)
  });
  return parseResponse(res, 'Failed to create leave request');
};

export const updateLeaveStatus = async (id, status) => {
  const res = await fetch(apiUrl(`/api/attendance/leaves/${id}/status`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  return parseResponse(res, 'Failed to update leave status');
};

export const fetchAttendanceLogs = async () => {
  const res = await fetch(apiUrl(`/api/attendance/logs?t=${Date.now()}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch attendance logs');
};

export const markAttendance = async (data) => {
  const res = await fetch(apiUrl('/api/attendance/mark'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to mark attendance');
};

export const fetchCrmUsers = async () => {
  const res = await fetch(apiUrl('/api/crm-users'), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch CRM users');
};

export const createCrmUser = async (data) => {
  const res = await fetch(apiUrl('/api/crm-users'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create CRM user');
};

export const updateCrmUser = async (id, data) => {
  const res = await fetch(apiUrl(`/api/crm-users/${id}`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to update CRM user');
};

export const deleteCrmUser = async (id) => {
  const res = await fetch(apiUrl(`/api/crm-users/${id}`), {
    method: 'DELETE',
    headers: getHeaders()
  });
  return parseResponse(res, 'Failed to delete CRM user');
};

export const fetchActivityLogs = async (userId) => {
  const res = await fetch(apiUrl(`/api/activity-logs/${userId}?t=${Date.now()}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch activity logs');
};

export const fetchIndianHolidays = async (year) => {
  const res = await fetch(apiUrl(`/api/holidays/IN/${year || new Date().getFullYear()}`), { headers: getHeaders() });
  return parseResponse(res, 'Failed to fetch Indian holidays');
};
