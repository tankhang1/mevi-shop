import type { Agency, AgencySummary, Order, PublicAgency } from '@/shared/types';
import { db, notFound, updateIn } from '../db';

const isOpen = (o: Order) => !['completed', 'cancelled'].includes(o.status);
const revenue = (orders: Order[]) => orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
const recent = (orders: Order[]) => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
// The demo agency account always manages the first agency.
const myAgency = () => db.agencies[0] ?? notFound();

export function getPublicAgency(slug: string): PublicAgency {
  const a = db.agencies.find(x => x.slug === slug) ?? notFound();
  return { id: a.id, slug: a.slug, displayName: a.displayName, logoUrl: a.logoUrl, primaryColor: a.primaryColor, active: a.active };
}

export function getAgencySummary(): AgencySummary {
  const orders = db.orders.filter(o => o.agencySlug === myAgency().slug);
  return { orderCount: orders.length, openOrders: orders.filter(isOpen).length, totalRevenue: revenue(orders), recentOrders: recent(orders) };
}

export const getAgencySettings = () => myAgency();
export const updateAgencySettings = (patch: Partial<Agency>) => updateIn(db.agencies, myAgency().id, patch);
