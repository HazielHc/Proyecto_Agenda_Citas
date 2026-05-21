import type { Appointment, AppointmentStatus } from './types';

const API_URL =
  ((import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_URL) ||
  'http://localhost:4000/api';
const TOKEN_KEY = 'agendabarber_token';

export interface SessionUser {
  barberId: number;
  businessId: number;
  email: string;
  role: 'administrador' | 'barbero';
  name: string;
  businessName: string;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const result = await request<{ token: string; user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setStoredToken(result.token);
  return result.user;
}

export async function registerBusiness(input: {
  businessName: string;
  email: string;
  password: string;
  plan: string;
}) {
  const result = await request<{ token: string; user: SessionUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  setStoredToken(result.token);
  return result.user;
}

export async function fetchCurrentUser() {
  return request<{ user: SessionUser }>('/me');
}

export async function fetchAppointments(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return request<{ appointments: Appointment[] }>(`/appointments${query}`);
}

export async function createAppointment(appointment: Appointment, channel: 'web' | 'manual' = 'web') {
  return request<{ appointment: Appointment }>('/appointments', {
    method: 'POST',
    body: JSON.stringify({ ...appointment, channel })
  });
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return request<{ appointment: Appointment }>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
