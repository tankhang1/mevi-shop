import { http } from '@/shared/api/http-client';
import type { Order, OrderInput } from '@/shared/types';

export const ordersApi = {
  create: (input: OrderInput) => http.post<Order>('/orders', input),
};
