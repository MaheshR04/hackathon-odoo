const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('dayflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const buildQuery = (params?: Record<string, any>) => {
  if (!params) return '';
  const cleanParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all' && value !== 'undefined') {
      cleanParams[key] = String(value);
    }
  }
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `?${query}` : '';
};

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  auth: {
    login: (credentials: { emailOrId: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
  },

  employees: {
    getAll: (params?: { department?: string; status?: string; role?: string; search?: string }) =>
      request(`/employees${buildQuery(params)}`),
    getById: (id: string) => request(`/employees/${id}`),
    create: (data: any) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    addDocument: (id: string, doc: { name: string; size?: string; type?: string }) =>
      request(`/employees/${id}/documents`, { method: 'POST', body: JSON.stringify(doc) }),
    deleteDocument: (id: string, docId: string) =>
      request(`/employees/${id}/documents/${docId}`, { method: 'DELETE' })
  },

  attendance: {
    getMy: (date?: string) => request(`/attendance/my${date ? `?date=${date}` : ''}`),
    checkIn: (remarks?: string, clientTime?: string, clientDate?: string) =>
      request('/attendance/check-in', { method: 'POST', body: JSON.stringify({ remarks, clientTime, clientDate }) }),
    checkOut: (clientTime?: string, clientDate?: string) =>
      request('/attendance/check-out', { method: 'POST', body: JSON.stringify({ clientTime, clientDate }) }),
    getAll: (params?: { date?: string; department?: string; status?: string; search?: string }) =>
      request(`/attendance/all${buildQuery(params)}`),
    recordManual: (data: any) =>
      request('/attendance/manual', { method: 'POST', body: JSON.stringify(data) })
  },

  leaves: {
    getMy: () => request('/leaves/my'),
    apply: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
      request('/leaves/apply', { method: 'POST', body: JSON.stringify(data) }),
    getAll: (params?: { status?: string; leaveType?: string; department?: string; search?: string }) =>
      request(`/leaves/all${buildQuery(params)}`),
    updateStatus: (id: string, data: { status: 'Approved' | 'Rejected'; adminComments?: string }) =>
      request(`/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify(data) })
  },

  payroll: {
    getMy: () => request('/payroll/my'),
    getAll: (params?: { department?: string; search?: string; month?: string }) =>
      request(`/payroll/all${buildQuery(params)}`),
    updateStructure: (employeeId: string, structure: any) =>
      request(`/payroll/structure/${employeeId}`, { method: 'PUT', body: JSON.stringify(structure) }),
    generateBatch: (data: { month?: string; payPeriod?: string }) =>
      request('/payroll/generate-batch', { method: 'POST', body: JSON.stringify(data) })
  },

  analytics: {
    getDashboard: () => request('/analytics/dashboard')
  },

  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request('/notifications/mark-all/read', { method: 'PUT' })
  }
};
