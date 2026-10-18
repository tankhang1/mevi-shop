import type { Order } from './order';

export interface Agency {
  id: number;
  slug: string;
  displayName: string;
  logoUrl: string | null;
  primaryColor: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  active: boolean;
  createdAt?: string;
}

export type PublicAgency = Pick<Agency, 'id' | 'slug' | 'displayName' | 'logoUrl' | 'primaryColor' | 'active'>;

export type AgencyUpdate = Partial<Omit<Agency, 'id'>>;

export interface AgencySummary {
  orderCount: number;
  openOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export type AgencyInput = Omit<Agency, 'id' | 'active' | 'createdAt'>;

export interface AdminSummary {
  productCount: number;
  pendingProducts: number;
  orderCount: number;
  newOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}
