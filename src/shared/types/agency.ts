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
}

export type PublicAgency = Pick<Agency, 'id' | 'slug' | 'displayName' | 'logoUrl' | 'primaryColor' | 'active'>;

export type AgencyUpdate = Partial<Omit<Agency, 'id'>>;

export interface AgencySummary {
  orderCount: number;
  openOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}
