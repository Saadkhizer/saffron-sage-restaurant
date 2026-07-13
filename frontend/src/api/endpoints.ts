
import { api, ApiError } from './client';
import { useAuthStore } from '../store/authStore';
import type {
  Address,
  AdminOrder,
  AdminStats,
  Category,
  MenuItem,
  Order,
  OrderAction,
  User,
} from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    api<AuthResponse>('/auth/signup', { method: 'POST', body: { name, email, password } }),
  login: (email: string, password: string) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  google: (credential: string) =>
    api<AuthResponse>('/auth/google', { method: 'POST', body: { credential } }),
  me: () => api<{ user: User }>('/auth/me', { auth: true }),
  updateProfile: (name: string, phone: string) =>
    api<{ user: User }>('/auth/me', { method: 'PUT', auth: true, body: { name, phone } }),
};

export const menuApi = {
  categories: () => api<Category[]>('/menu/categories'),
  list: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return api<MenuItem[]>(`/menu${qs ? `?${qs}` : ''}`);
  },
};

export interface PlaceOrderInput {
  items: { id: number; quantity: number }[];
  fulfillment: 'delivery' | 'pickup';
  contact: { name: string; phone: string };
  address?: { line1: string; city: string };
  notes?: string;
  paymentMethod: 'card' | 'cash';
}

export const ordersApi = {
  place: (input: PlaceOrderInput) =>
    api<Order>('/orders', { method: 'POST', auth: true, body: input }),
  list: () => api<Order[]>('/orders', { auth: true }),
  get: (id: number | string) => api<Order>(`/orders/${id}`, { auth: true }),
};

export interface MenuItemInput {
  name: string;
  description: string;
  priceCents: number;
  categoryId: number;
  image?: string;
  tags?: string[];
  popular?: boolean;
  available?: boolean;
}

export const adminApi = {
  stats: () => api<AdminStats>('/admin/stats', { auth: true }),
  orders: (status?: string) =>
    api<AdminOrder[]>(`/admin/orders${status && status !== 'all' ? `?status=${status}` : ''}`, { auth: true }),
  orderAction: (id: number, action: OrderAction) =>
    api<AdminOrder>(`/admin/orders/${id}`, { method: 'PATCH', auth: true, body: { action } }),
  menu: () => api<MenuItem[]>('/admin/menu', { auth: true }),
  createItem: (input: MenuItemInput) =>
    api<MenuItem>('/admin/menu', { method: 'POST', auth: true, body: input }),
  updateItem: (id: number, input: MenuItemInput) =>
    api<MenuItem>(`/admin/menu/${id}`, { method: 'PUT', auth: true, body: input }),
  setAvailability: (id: number, available: boolean) =>
    api<MenuItem>(`/admin/menu/${id}/availability`, { method: 'PATCH', auth: true, body: { available } }),
  deleteItem: (id: number) =>
    api<{ ok: boolean }>(`/admin/menu/${id}`, { method: 'DELETE', auth: true }),
  createCategory: (name: string) =>
    api<Category>('/admin/categories', { method: 'POST', auth: true, body: { name } }),
  // Multipart upload — bypasses the JSON api() helper on purpose.
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append('image', file);
    const token = useAuthStore.getState().token;
    const res = await fetch('/api/admin/menu/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(data?.error || 'Upload failed', res.status);
    }
    return data as { url: string };
  },
};

export const addressApi = {
  list: () => api<Address[]>('/addresses', { auth: true }),
  add: (input: { label: string; line1: string; city: string; phone?: string; isDefault?: boolean }) =>
    api<Address>('/addresses', { method: 'POST', auth: true, body: input }),
  remove: (id: number) => api<{ ok: boolean }>(`/addresses/${id}`, { method: 'DELETE', auth: true }),
};
