import { apiClient } from '@/shared/api/api-client';
import type { Page } from '@/shared/api/api.types';
import type {
  PublicId, ShopCategory, ShopProductDetail, ShopProductDetailParams, ShopProductListParams, ShopProductSummary,
} from './shop.types';

const BASE = '/api/public/shop';
// Public: no token / workspace header.
const PUBLIC = { skipAuth: true } as const;

export const shopApi = {
  /** GET /api/public/shop/product-categories — sorted by sortOrder, id. */
  listCategories: () => apiClient.get<ShopCategory[]>(`${BASE}/product-categories`, PUBLIC),

  /** GET /api/public/shop/products — ACTIVE only, newest first. Out-of-stock items are included. */
  listProducts: (params: ShopProductListParams = {}, signal?: AbortSignal) =>
    apiClient.get<Page<ShopProductSummary>>(`${BASE}/products`, { ...PUBLIC, params: { ...params }, signal }),

  /** GET /api/public/shop/products/{id}?storefrontId= — 404 when INACTIVE / deleted / missing; 400 when id not numeric. */
  getProduct: (id: PublicId, params: ShopProductDetailParams = {}, signal?: AbortSignal) =>
    apiClient.get<ShopProductDetail>(`${BASE}/products/${id}`, { ...PUBLIC, params: { ...params }, signal }),
};
