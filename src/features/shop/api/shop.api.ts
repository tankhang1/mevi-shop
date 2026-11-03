import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/shared/api/api-client";
import type { Page } from "@/shared/api/api.types";
import type {
  CreatePartnerContactRequestPayload,
  PublicId,
  PublicStorefront,
  ShopCategory,
  ShopProductDetail,
  ShopProductDetailParams,
  ShopProductListParams,
  ShopProductSummary,
  StorefrontProductListParams,
} from "./shop.types";

// Public: no token / workspace header.
const PUBLIC = { skipAuth: true } as const;

export const shopApi = {
  /** GET /api/public/shop/product-categories — sorted by sortOrder, id. */
  listCategories: () =>
    apiClient.get<ShopCategory[]>(API_ENDPOINTS.public.shop.categories, PUBLIC),

  /** GET /api/public/shop/products — ACTIVE only, newest first. Out-of-stock items are included. */
  listProducts: (params: ShopProductListParams = {}, signal?: AbortSignal) =>
    apiClient.get<Page<ShopProductSummary>>(
      API_ENDPOINTS.public.shop.products,
      {
        ...PUBLIC,
        params: { ...params },
        signal,
      },
    ),

  /** GET /api/public/shop/products/{id}?storefrontId= — 404 when INACTIVE / deleted / missing; 400 when id not numeric. */
  getProduct: (
    id: PublicId,
    params: ShopProductDetailParams = {},
    signal?: AbortSignal,
  ) =>
    apiClient.get<ShopProductDetail>(
      API_ENDPOINTS.public.shop.productDetail(id),
      {
        ...PUBLIC,
        params: { ...params },
        signal,
      },
    ),

  /** POST /api/public/shop/partner-contact-requests — Gửi form liên hệ hợp tác (204 No Content). */
  submitPartnerContactRequest: (
    payload: CreatePartnerContactRequestPayload,
    signal?: AbortSignal,
  ) =>
    apiClient.post<void>(
      API_ENDPOINTS.public.shop.partnerContactRequests,
      payload,
      {
        ...PUBLIC,
        signal,
      },
    ),

  /** GET /api/public/shop/storefronts/{id} — 404 khi gian hàng tạm khóa hoặc không tồn tại. */
  getStorefront: (id: PublicId, signal?: AbortSignal) =>
    apiClient.get<PublicStorefront>(
      API_ENDPOINTS.public.shop.storefrontDetail(id),
      {
        ...PUBLIC,
        signal,
      },
    ),

  /** GET /api/public/shop/storefronts/{id}/products — Danh sách sản phẩm của gian hàng. */
  listStorefrontProducts: (
    id: PublicId,
    params: StorefrontProductListParams = {},
    signal?: AbortSignal,
  ) =>
    apiClient.get<Page<ShopProductSummary>>(
      API_ENDPOINTS.public.shop.storefrontProducts(id),
      {
        ...PUBLIC,
        params: { ...params },
        signal,
      },
    ),
};
