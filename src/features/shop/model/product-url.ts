import { paths } from '@/shared/constants/routes';
import type { PublicId } from '../api/shop.types';

/** FE product URL: `/products/<handle>-i.<id>` (handle is cosmetic, id is the key). */
export const productPath = paths.shopProduct;

/** Parses the `<handle>-i.<id>` slug. Returns null when the id part is missing / not numeric. */
export function parseProductSlug(slug: string): { handle: string; id: PublicId } | null {
  const m = /^(.*)-i\.(\d{1,16})$/.exec(slug);
  if (!m) return null;
  const id = Number(m[2]);
  return Number.isSafeInteger(id) ? { handle: m[1], id } : null;
}

/** True when the URL handle is stale (product renamed) → FE should redirect to `productPath`. */
export const needsCanonicalRedirect = (urlHandle: string, product: { handle: string }) => urlHandle !== product.handle;
