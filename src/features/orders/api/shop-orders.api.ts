import { API_ENDPOINTS } from '@/config/api-endpoints';
import { apiClient } from '@/shared/api/api-client';
import type { Page } from '@/shared/api/api.types';
import type { ShopOrder, ShopOrderListParams, ShopOrderRequest } from './shop-orders.types';

// Customer endpoints need the MEVI_CUSTOMER role and are not workspace-scoped.
const CUSTOMER = { skipWorkspaceHeader: true } as const;
const { orders, orderDetail, cancelOrder } = API_ENDPOINTS.shop.customer;

export const shopOrdersApi = {
  /** POST /api/shop/customer/orders — stock is deducted immediately; new orders start as PENDING. */
  create: (body: ShopOrderRequest) => apiClient.post<ShopOrder>(orders, body, CUSTOMER),
  /** GET /api/shop/customer/orders — newest first. */
  list: (params: ShopOrderListParams = {}) => apiClient.get<Page<ShopOrder>>(orders, { ...CUSTOMER, params: { ...params } }),
  /** GET /api/shop/customer/orders/{id} — another customer's order is a 404. */
  get: (id: number) => apiClient.get<ShopOrder>(orderDetail(id), CUSTOMER),
  /** POST /api/shop/customer/orders/{id}/cancel — PENDING only, otherwise 409. Restores stock. */
  cancel: (id: number, reason?: string) => apiClient.post<ShopOrder>(cancelOrder(id), reason ? { reason } : {}, CUSTOMER),
};
