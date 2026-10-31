import type { Agency, AgencyInput, Banner, BannerInput, AdminSummary, Order, Product, ProductInput, ProductModeration } from '@/shared/types';
import { db, MockHttpError, notFound, save, updateIn } from '../db';

const revenue = (orders: Order[]) => orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
const byNewest = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt);

export function getSummary(): AdminSummary {
  return {
    productCount: db.products.length,
    pendingProducts: db.products.filter(p => p.status === 'pending').length,
    orderCount: db.orders.length,
    newOrders: db.orders.filter(o => o.status === 'new').length,
    totalRevenue: revenue(db.orders),
    recentOrders: [...db.orders].sort(byNewest).slice(0, 5),
  };
}

// Products
export const listProducts = (status: string) =>
  [...db.products].filter(p => status === 'all' || p.status === status).sort((a, b) => b.id - a.id);

export function createProduct(input: ProductInput): Product {
  const product: Product = { ...input, id: ++db.seq, status: 'pending', rejectionReason: null, createdAt: new Date().toISOString() };
  db.products.push(product); save();
  return product;
}

export const updateProduct = (id: number, patch: Partial<Product>) => updateIn(db.products, id, patch);

export function deleteProduct(id: number) {
  db.products = db.products.filter(p => p.id !== id); save();
  return null;
}

export const moderateProduct = (id: number, { status, rejectionReason }: ProductModeration) =>
  updateIn(db.products, id, { status, rejectionReason: status === 'rejected' ? rejectionReason ?? null : null });

// Orders
export const listOrders = (status: string) =>
  [...db.orders].filter(o => status === 'all' || o.status === status).sort(byNewest);

export const updateOrderStatus = (id: number, status: Order['status']) => updateIn(db.orders, id, { status });

// Agencies
export const listAgencies = () => db.agencies;

export const getAgency = (id: number) => db.agencies.find(a => a.id === id) ?? notFound();

export function listAgencyOrders(id: number, status: string) {
  const { slug } = getAgency(id);
  return listOrders(status).filter(o => o.agencySlug === slug);
}

const assertUniqueSlug = (slug: string | undefined, selfId?: number) => {
  if (slug && db.agencies.some(a => a.slug === slug && a.id !== selfId)) throw new MockHttpError(409, 'Slug đã tồn tại');
};

export function createAgency(input: AgencyInput): Agency {
  assertUniqueSlug(input.slug);
  const agency: Agency = { ...input, logoUrl: input.logoUrl ?? null, id: ++db.seq, active: true, createdAt: new Date().toISOString() };
  db.agencies.push(agency); save();
  return agency;
}

export function updateAgency(id: number, patch: Partial<Agency>) {
  assertUniqueSlug(patch.slug, id);
  const before = getAgency(id).slug;
  const agency = updateIn(db.agencies, id, patch);
  // Keep the agency's order history attached when its slug changes.
  if (patch.slug && patch.slug !== before) { db.orders.forEach(o => { if (o.agencySlug === before) o.agencySlug = patch.slug!; }); save(); }
  return agency;
}

// Banners
export const listBanners = () => [...db.banners].sort((a, b) => a.sortOrder - b.sortOrder);

export function createBanner(input: BannerInput): Banner {
  const banner: Banner = { ...input, id: ++db.seq, createdAt: new Date().toISOString() };
  db.banners.push(banner); save();
  return banner;
}

export const updateBanner = (id: number, patch: Partial<Banner>) => updateIn(db.banners, id, patch);

export function deleteBanner(id: number) {
  db.banners = db.banners.filter(b => b.id !== id); save();
  return null;
}
