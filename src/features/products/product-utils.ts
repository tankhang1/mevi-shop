import { useProducts } from '@/features/products/api/products.queries';
import { reviewsOf, ratingSummary } from '@/features/reviews/model/reviews';
import type { Product } from '@/shared/types';
import { paths } from '@/shared/constants/routes';

export function priceOf(p: Product) { return p.salePrice ?? p.price; }
// Dummy social proof derived from the id so it stays stable between renders.

export const ratingOf = (p: Product) =>
  p.handle !== undefined ? (p.ratingAverage ?? 0).toFixed(1) : ratingSummary(reviewsOf(p.id)).avg.toFixed(1);

export const soldOf = (p: Product) => p.soldCount ?? 80 + (p.id * 137) % 900;

/** Detail URL: SEO slug for API products, legacy `/product/:id` for mock ones. */
export const productHref = (p: Pick<Product, 'id' | 'handle'>) =>
  p.handle !== undefined ? paths.shopProduct({ id: p.id, handle: p.handle }) : paths.product(p.id);

export function useAllProducts() {
  return useProducts({ sort: 'featured' });
}
