import { useListProducts, getListProductsQueryKey } from '@/lib/api';
import type { Product } from '@/lib/api';
import { ratingSummary, reviewsOf } from '@/lib/shops';

export function priceOf(p: Product) { return p.salePrice ?? p.price; }
// Dummy social proof derived from the id so it stays stable between renders.

export const ratingOf = (p: Product) => ratingSummary(reviewsOf(p.id)).avg.toFixed(1);

export const soldOf = (p: Product) => 80 + (p.id * 137) % 900;

export function useAllProducts() {
  return useListProducts({ sort: 'featured' }, { query: { queryKey: getListProductsQueryKey({ sort: 'featured' }) } });
}
