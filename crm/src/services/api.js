// API Integration Layer for OMW CRM Frontend

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE}${path}`;

const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

const apiFetch = (path, options = {}) => {
  const url = path.startsWith('/') ? apiUrl(path) : path;
  return fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
    ...options
  });
};

const parseResponse = async (res, defaultError = 'Request failed') => {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let errorMsg = defaultError;
    if (isJson) {
      const errorData = await res.json().catch(() => ({}));
      errorMsg = errorData.error || defaultError;
    } else if (res.status === 405) {
      errorMsg = 'HTTP 405 Method Not Allowed: Check Vercel backend route configuration.';
    } else {
      errorMsg = `${defaultError} (HTTP ${res.status})`;
    }
    const err = new Error(errorMsg);
    err.status = res.status;
    throw err;
  }

  if (!isJson) {
    throw new Error(`${defaultError}: Non-JSON response received`);
  }

  return await res.json();
};

export const fetchDashboardStats = async () => {
  const res = await apiFetch('/api/dashboard/stats');
  return parseResponse(res, 'Failed to fetch dashboard stats');
};

export const fetchCustomers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/customers?${query}`);
  return parseResponse(res, 'Failed to fetch customers');
};

export const createCustomer = async (data) => {
  const res = await apiFetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create customer');
};

export const fetchWorkers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/workers?${query}`);
  return parseResponse(res, 'Failed to fetch workers');
};

export const createWorker = async (data) => {
  const res = await apiFetch('/api/workers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create worker');
};

export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/bookings?${query}`);
  return parseResponse(res, 'Failed to fetch bookings');
};

export const createBooking = async (data) => {
  const res = await apiFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create booking');
};

export const updateBookingStatus = async (id, payload) => {
  const res = await apiFetch(`/api/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return parseResponse(res, 'Failed to update booking status');
};

export const fetchPayments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/payments?${query}`);
  return parseResponse(res, 'Failed to fetch payments');
};

export const fetchSupportTickets = async () => {
  const res = await apiFetch('/api/support-tickets');
  return parseResponse(res, 'Failed to fetch support tickets');
};

export const createSupportTicket = async (data) => {
  const res = await apiFetch('/api/support-tickets', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create ticket');
};

export const resolveSupportTicket = async (id, resolutionNotes) => {
  const res = await apiFetch(`/api/support-tickets/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ resolutionNotes })
  });
  return parseResponse(res, 'Failed to resolve ticket');
};

export const fetchAnalytics = async () => {
  const res = await apiFetch('/api/analytics');
  return parseResponse(res, 'Failed to fetch analytics');
};

export const triggerDatabaseSync = async () => {
  const res = await apiFetch('/api/sync/trigger', { method: 'POST' });
  return parseResponse(res, 'Failed to sync database');
};

export const loginUser = async (email, password, type) => {
  const endpoint = type === 'admin' ? '/api/auth/admin-login' : '/api/auth/user-login';
  const res = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return parseResponse(res, 'Invalid Email or Password');
};

export const switchUserAccount = async (userId) => {
  const res = await apiFetch('/api/auth/impersonate', {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
  return parseResponse(res, 'Failed to switch user account');
};

export const logoutUser = async () => {
  const res = await apiFetch('/api/auth/logout', { method: 'POST' });
  return parseResponse(res, 'Failed to logout');
};

export const fetchMe = async () => {
  const res = await apiFetch('/api/auth/me');
  return parseResponse(res, 'Not authenticated');
};

export const fetchLeaveRequests = async () => {
  const res = await apiFetch(`/api/attendance/leaves?t=${Date.now()}`);
  return parseResponse(res, 'Failed to fetch leave requests');
};

export const createLeaveRequest = async (leaveData) => {
  const res = await apiFetch('/api/attendance/leaves', {
    method: 'POST',
    body: JSON.stringify(leaveData)
  });
  return parseResponse(res, 'Failed to create leave request');
};

export const updateLeaveStatus = async (id, status) => {
  const res = await apiFetch(`/api/attendance/leaves/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return parseResponse(res, 'Failed to update leave status');
};

export const fetchAttendanceLogs = async () => {
  const res = await apiFetch(`/api/attendance/logs?t=${Date.now()}`);
  return parseResponse(res, 'Failed to fetch attendance logs');
};

export const markAttendance = async (data) => {
  const res = await apiFetch('/api/attendance/mark', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to mark attendance');
};

export const updateWorkDescription = async (logId, workDescription) => {
  const res = await apiFetch(`/api/attendance/logs/${logId}/work-description`, {
    method: 'PUT',
    body: JSON.stringify({ workDescription })
  });
  return parseResponse(res, 'Failed to update work description');
};

export const fetchCrmUsers = async () => {
  const res = await apiFetch('/api/crm-users');
  return parseResponse(res, 'Failed to fetch CRM users');
};

export const createCrmUser = async (data) => {
  const res = await apiFetch('/api/crm-users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create CRM user');
};

export const updateCrmUser = async (id, data) => {
  const res = await apiFetch(`/api/crm-users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to update CRM user');
};

export const deleteCrmUser = async (id) => {
  const res = await apiFetch(`/api/crm-users/${id}`, {
    method: 'DELETE'
  });
  return parseResponse(res, 'Failed to delete CRM user');
};

export const fetchActivityLogs = async (userId) => {
  const res = await apiFetch(`/api/activity-logs/${userId}?t=${Date.now()}`);
  return parseResponse(res, 'Failed to fetch activity logs');
};

export const fetchIndianHolidays = async (year) => {
  const res = await apiFetch(`/api/holidays/IN/${year || new Date().getFullYear()}`);
  return parseResponse(res, 'Failed to fetch Indian holidays');
};

export const fetchLeads = async () => {
  const res = await apiFetch(`/api/leads?t=${Date.now()}`);
  return parseResponse(res, 'Failed to fetch leads');
};

export const createLead = async (data) => {
  const res = await apiFetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to create lead');
};

export const updateLead = async (id, data) => {
  const res = await apiFetch(`/api/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to update lead');
};

export const deleteLead = async (id) => {
  const res = await apiFetch(`/api/leads/${id}`, {
    method: 'DELETE'
  });
  return parseResponse(res, 'Failed to delete lead');
};

export const sendBulkEmails = async (data) => {
  const res = await apiFetch('/api/leads/send-email', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return parseResponse(res, 'Failed to send bulk email');
};
