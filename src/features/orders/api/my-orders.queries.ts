import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/features/auth/api/auth.storage";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { USE_REAL_SHOP } from "@/features/products/api/products.api";
import type { Order } from "@/shared/types";
import { fromShopOrder, toShopOrderStatus } from "../model/shop-order-adapter";
import type { ShopOrderStatus } from "./shop-orders.types";
import { useCustomerOrdersStore } from "./customer-orders";
import { shopOrdersApi } from "./shop-orders.api";

export const myOrdersKey = ["my-orders"] as const;
const NO_ORDERS: Order[] = [];

export interface MyOrdersParams {
  status?: ShopOrderStatus;
  keyword?: string;
}

/** The customer's orders: real API when logged in, the local demo store in mock-shop mode. */
export function useMyOrders(params: MyOrdersParams = {}) {
  const user = useAuthStore((s) => s.user);
  const demoOrders = useCustomerOrdersStore((s) => s.orders);
  const { status, keyword } = params;

  const query = useQuery({
    queryKey: [...myOrdersKey, user?.id, status, keyword],
    queryFn: async () => {
      const res = await shopOrdersApi.list({
        status,
        keyword: keyword || undefined,
        size: 50,
      });
      let orders = (res.content ?? []).map(fromShopOrder);
      // Fallback client filter in case backend keyword search is partial
      if (keyword?.trim()) {
        const q = keyword.trim().toLowerCase();
        orders = orders.filter(
          (o) =>
            o.code.toLowerCase().includes(q) ||
            o.phone.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.items.some((it) => it.productName.toLowerCase().includes(q)),
        );
      }
      return orders;
    },
    enabled: USE_REAL_SHOP && !!user && !!authStorage.getToken(),
    retry: false,
  });

  if (!USE_REAL_SHOP) {
    let list = demoOrders;
    if (status) {
      const clientStatus = Object.entries(toShopOrderStatus).find(
        ([, v]) => v === status,
      )?.[0];
      if (clientStatus) list = list.filter((o) => o.status === clientStatus);
    }
    if (keyword?.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q)),
      );
    }
    return {
      orders: list,
      isLoading: false,
      isError: false,
      refetch: query.refetch,
    };
  }

  return {
    orders: query.data ?? NO_ORDERS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      shopOrdersApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: myOrdersKey }),
  });
}
