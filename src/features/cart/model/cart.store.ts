import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/shared/types';

export interface CartItem { productId: number; quantity: number; product: Product }

interface CartState {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  update: (productId: number, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(persist(set => ({
  items: [],
  add: (product, quantity = 1) => set(({ items }) => {
    const found = items.some(item => item.productId === product.id);
    return {
      items: found
        ? items.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { productId: product.id, quantity, product }],
    };
  }),
  update: (productId, quantity) => set(({ items }) => ({
    items: quantity < 1 ? items.filter(x => x.productId !== productId) : items.map(x => x.productId === productId ? { ...x, quantity } : x),
  })),
  clear: () => set({ items: [] }),
}), { name: 'mevi-cart-v2' }));

const lineTotal = (item: CartItem) => (item.product.salePrice ?? item.product.price) * item.quantity;
export const selectCount = (s: CartState) => s.items.reduce((n, item) => n + item.quantity, 0);
export const selectTotal = (s: CartState) => s.items.reduce((n, item) => n + lineTotal(item), 0);

/** Full cart view (items, actions, count, total) for pages that render the whole cart. */
export function useCart() {
  const state = useCartStore();
  return { ...state, count: selectCount(state), total: selectTotal(state) };
}
