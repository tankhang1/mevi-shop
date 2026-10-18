import { useProducts } from '@/features/products/api/products.queries';
import { reviewsOf, ratingSummary } from '@/features/reviews/model/reviews';
import type { Product } from '@/shared/types';

export function priceOf(p: Product) { return p.salePrice ?? p.price; }
// Dummy social proof derived from the id so it stays stable between renders.

export const ratingOf = (p: Product) => ratingSummary(reviewsOf(p.id)).avg.toFixed(1);

export const soldOf = (p: Product) => 80 + (p.id * 137) % 900;

export function useAllProducts() {
  return useProducts({ sort: 'featured' });
}
