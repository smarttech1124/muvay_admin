import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/${API_VERSION}`;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token
api.interceptors.request.use(cfg => {
  const token = Cookies.get('muvay_admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  r => r,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('muvay_admin_token');
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login:  (email: string, password: string) => api.post('/admin/auth/login', { email, password }),
  logout: () => api.post('/admin/auth/logout'),
  forgot: (email: string) => api.post('/admin/auth/forgot-password', { email }),
  reset:  (token: string, password: string) => api.post('/admin/auth/reset-password', { token, password }),
  me:     () => api.get('/admin/auth/me'),
};

// ── Dashboard ───────────────────────────────────────────────────────────────
export const adminDashboardApi = {
  stats: () => api.get('/admin/dashboard/stats'),
};

// ── Users ───────────────────────────────────────────────────────────────────
export const adminUsersApi = {
  list:    (p: Record<string, any>) => api.get('/admin/users', { params: p }),
  getById: (id: string)             => api.get(`/admin/users/${id}`),
  update:  (id: string, d: any)     => api.patch(`/admin/users/${id}`, d),
  suspend: (id: string, r: string)  => api.post(`/admin/users/${id}/suspend`, { reason: r }),
  activate:(id: string)             => api.post(`/admin/users/${id}/activate`),
  delete:  (id: string)             => api.delete(`/admin/users/${id}`),
};

// ── Trips ───────────────────────────────────────────────────────────────────
export const adminTripsApi = {
  list:    (p: Record<string, any>) => api.get('/admin/trips', { params: p }),
  getById: (id: string)             => api.get(`/admin/trips/${id}`),
  update:  (id: string, d: any)     => api.patch(`/admin/trips/${id}`, d),
  approve: (id: string)             => api.post(`/admin/trips/${id}/approve`),
  reject:  (id: string, r: string)  => api.post(`/admin/trips/${id}/reject`, { reason: r }),
  feature: (id: string, v: boolean) => api.patch(`/admin/trips/${id}`, { featured: v }),
  delete:  (id: string)             => api.delete(`/admin/trips/${id}`),
};

// ── Activities ──────────────────────────────────────────────────────────────
export const adminActivitiesApi = {
  list:    (p: Record<string, any>) => api.get('/admin/activities', { params: p }),
  getById: (id: string)             => api.get(`/admin/activities/${id}`),
  update:  (id: string, d: any)     => api.patch(`/admin/activities/${id}`, d),
  approve: (id: string)             => api.post(`/admin/activities/${id}/approve`),
  reject:  (id: string, r: string)  => api.post(`/admin/activities/${id}/reject`, { reason: r }),
  delete:  (id: string)             => api.delete(`/admin/activities/${id}`),
};

// ── Influencers ─────────────────────────────────────────────────────────────
export const adminInfluencersApi = {
  applications: (p: Record<string, any>) => api.get('/admin/influencers/applications', { params: p }),
  approve: (id: string)            => api.post(`/admin/influencers/applications/${id}/approve`),
  reject:  (id: string, r: string) => api.post(`/admin/influencers/applications/${id}/reject`, { reason: r }),
  list:    (p: Record<string, any>) => api.get('/admin/influencers', { params: p }),
};

// ── Bookings ────────────────────────────────────────────────────────────────
export const adminBookingsApi = {
  list:    (p: Record<string, any>) => api.get('/admin/bookings', { params: p }),
  getById: (id: string)             => api.get(`/admin/bookings/${id}`),
  update:  (id: string, d: any)     => api.patch(`/admin/bookings/${id}`, d),
  cancel:  (id: string, r: string)  => api.post(`/admin/bookings/${id}/cancel`, { reason: r }),
};

// ── Transactions ────────────────────────────────────────────────────────────
export const adminTransactionsApi = {
  list:    (p: Record<string, any>) => api.get('/admin/transactions', { params: p }),
  getById: (id: string)             => api.get(`/admin/transactions/${id}`),
  refund:  (id: string, reason: string) => api.post(`/admin/transactions/${id}/refund`, { reason }),
};

// ── Admin Management ────────────────────────────────────────────────────────
export const adminMgmtApi = {
  list:    (p: Record<string, any>) => api.get('/admin/admins', { params: p }),
  create:  (d: any)                 => api.post('/admin/admins', d),
  getById: (id: string)             => api.get(`/admin/admins/${id}`),
  update:  (id: string, d: any)     => api.patch(`/admin/admins/${id}`, d),
  delete:  (id: string)             => api.delete(`/admin/admins/${id}`),
  resetPw: (id: string)             => api.post(`/admin/admins/${id}/reset-password`),
};

// ── Logs ────────────────────────────────────────────────────────────────────
export const adminLogsApi = {
  list: (p: Record<string, any>) => api.get('/admin/logs', { params: p }),
};

// ── Settings ────────────────────────────────────────────────────────────────
export const adminSettingsApi = {
  get:    ()       => api.get('/admin/settings'),
  update: (d: any) => api.patch('/admin/settings', d),
};

// ── Analytics ───────────────────────────────────────────────────────────────
export const adminAnalyticsApi = {
  revenue: (range: string) => api.get('/admin/analytics/revenue', { params: { range } }),
  users:   (range: string) => api.get('/admin/analytics/users', { params: { range } }),
  bookings:(range: string) => api.get('/admin/analytics/bookings', { params: { range } }),
};
