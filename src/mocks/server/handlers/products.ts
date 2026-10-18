import type { Product } from '@/shared/types';
import { db, notFound } from '../db';

const price = (p: Product) => p.salePrice ?? p.price;

export function listProducts(q: URLSearchParams): Product[] {
  const term = q.get('q')?.toLowerCase(); const category = q.get('category'); const sort = q.get('sort');
  const minPrice = Number(q.get('minPrice') ?? 0); const maxPrice = Number(q.get('maxPrice') ?? Infinity);
  const list = db.products.filter(p => p.status === 'approved'
    && (!term || `${p.name} ${p.description} ${p.origin}`.toLowerCase().includes(term))
    && (!category || p.category === category) && price(p) >= minPrice && price(p) <= maxPrice);
  if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
  else if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
  return list;
}

export const getProduct = (id: number) => db.products.find(p => p.id === id && p.status === 'approved') ?? notFound();
