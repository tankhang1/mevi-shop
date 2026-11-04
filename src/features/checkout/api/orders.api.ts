import { shopOrdersApi } from '@/features/orders/api/shop-orders.api';
import { fromShopOrder, toShopOrderRequest } from '@/features/orders/model/shop-order-adapter';
import { USE_REAL_SHOP } from '@/features/products/api/products.api';
import { http } from '@/shared/api/http-client';
import type { Order, OrderInput } from '@/shared/types';

export const ordersApi = {
  // Real products only exist on the real backend, so orders follow the storefront's data source.
  create: (input: OrderInput): Promise<Order> =>
    USE_REAL_SHOP ? shopOrdersApi.create(toShopOrderRequest(input)).then(fromShopOrder) : http.post<Order>('/orders', input),
};
