import type { Agency, Banner, Order, Product } from '@/shared/types';
import { seedAgencies, seedBanners, seedOrders, seedProducts } from './seed';

// In-browser fake backend. All data is dummy and persisted in localStorage.
interface Db { products: Product[]; orders: Order[]; agencies: Agency[]; banners: Banner[]; seq: number }

const STORAGE_KEY = 'mevi-mock-db-v4';

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Older saved DBs predate banners; backfill rather than wiping the user's data.
    if (raw) return { banners: seedBanners, ...JSON.parse(raw) };
  } catch { /* fall through to seed */ }
  return { products: seedProducts, orders: seedOrders, agencies: seedAgencies, banners: seedBanners, seq: 100 };
}

export const db = load();
export const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch { /* storage unavailable */ } };

export class MockHttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
export const notFound = (): never => { throw new MockHttpError(404, 'Not found'); };

export function updateIn<T extends { id: number }>(list: T[], id: number, patch: Partial<T>): T {
  const item = list.find(x => x.id === id) ?? notFound();
  Object.assign(item, patch); save();
  return item;
}
