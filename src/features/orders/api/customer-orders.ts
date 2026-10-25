import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/shared/types";
import { seedOrders } from "@/mocks/server/seed";

interface CustomerOrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateStatus: (id: number, status: Order["status"]) => void;
  getActiveCount: () => number;
  lookup: (keyword: string) => Order[];
  initDemoOrders: () => void;
}

export const useCustomerOrdersStore = create<CustomerOrdersState>()(
  persist(
    (set, get) => ({
      // Initialize with demo seed orders so the user can immediately experience the UI
      orders: seedOrders,

      addOrder: (order) =>
        set((state) => ({
          orders: [
            order,
            ...state.orders.filter(
              (o) => o.id !== order.id && o.code !== order.code,
            ),
          ],
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      getActiveCount: () => {
        const activeStatuses: Order["status"][] = [
          "new",
          "confirmed",
          "processing",
          "shipped",
        ];
        return get().orders.filter((o) => activeStatuses.includes(o.status))
          .length;
      },

      lookup: (keyword) => {
        const q = keyword.trim().toLowerCase();
        if (!q) return get().orders;
        return get().orders.filter(
          (o) =>
            o.code.toLowerCase().includes(q) ||
            o.phone.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q),
        );
      },

      initDemoOrders: () => set({ orders: seedOrders }),
    }),
    {
      name: "mevi-customer-orders-v1",
    },
  ),
);
