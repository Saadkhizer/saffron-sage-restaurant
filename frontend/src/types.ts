export interface AppConfig {
  restaurantName: string;
  currencyCode: string;
  currencySymbol: string;
  deliveryFeeCents: number;
  googleClientId: string;
}

export type Role = 'customer' | 'owner';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  role: Role;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  name: string;
  description: string;
  priceCents: number;
  image: string | null;
  tags: string[];
  popular: boolean;
  available: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
}

export interface Address {
  id: number;
  label: string;
  line1: string;
  city: string;
  phone: string | null;
  isDefault: boolean;
}

export type Fulfillment = 'delivery' | 'pickup';
export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'on_the_way'
  | 'ready'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderLine {
  id: number;
  menuItemId: number | null;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  fulfillment: Fulfillment;
  contactName: string;
  contactPhone: string;
  addressLine1: string | null;
  addressCity: string | null;
  notes: string | null;
  subtotalCents: number;
  deliveryCents: number;
  totalCents: number;
  paymentMethod: string;
  paymentStatus: string;
  etaMinutes: number;
  placedAt: string;
  items: OrderLine[];
}

export interface AdminOrder extends Order {
  userId: number;
}

export interface AdminStats {
  pending: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenueCents: number;
  menuCount: number;
}

export type OrderAction = 'accept' | 'reject' | 'advance';
