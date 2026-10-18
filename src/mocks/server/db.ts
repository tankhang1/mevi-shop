import type { Agency, Order, Product } from '@/shared/types';
import { seedAgencies, seedOrders, seedProducts } from './seed';

// In-browser fake backend. All data is dummy and persisted in localStorage.
interface Db { products: Product[]; orders: Order[]; agencies: Agency[]; seq: number }

const STORAGE_KEY = 'mevi-mock-db-v3';

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to seed */ }
  return { products: seedProducts, orders: seedOrders, agencies: seedAgencies, seq: 100 };
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
