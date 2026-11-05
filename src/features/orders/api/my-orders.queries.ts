import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authStorage } from '@/features/auth/api/auth.storage';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { USE_REAL_SHOP } from '@/features/products/api/products.api';
import type { Order } from '@/shared/types';
import { fromShopOrder } from '../model/shop-order-adapter';
import { useCustomerOrdersStore } from './customer-orders';
import { shopOrdersApi } from './shop-orders.api';

export const myOrdersKey = ['my-orders'] as const;
const NO_ORDERS: Order[] = [];

/** The customer's orders: real API when logged in, the local demo store in mock-shop mode. */
export function useMyOrders() {
  const user = useAuthStore(s => s.user);
  const demoOrders = useCustomerOrdersStore(s => s.orders);
  const query = useQuery({
    queryKey: [...myOrdersKey, user?.id],
    queryFn: async () => {
      // Status tabs and search work client-side, so load every page (max size is 100).
      const first = await shopOrdersApi.list({ size: 100 });
      const rest = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, i) => shopOrdersApi.list({ size: 100, page: i + 1 })),
      );
      return [first, ...rest].flatMap(p => p.content).map(fromShopOrder);
    },
    enabled: USE_REAL_SHOP && !!user && !!authStorage.getToken(),
    retry: false,
  });
  if (!USE_REAL_SHOP) return { orders: demoOrders, isLoading: false, isError: false, refetch: query.refetch };
  return { orders: query.data ?? NO_ORDERS, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => shopOrdersApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: myOrdersKey }),
  });
}
