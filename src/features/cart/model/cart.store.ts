import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/shared/types';
import { farmOf, variantOf, variantPrice } from '@/shared/lib/product-options';

/** One cart line = product + chosen quy cách (+ garden for farm products). */
export interface CartItem { key: string; productId: number; variantId: string; farmId: string | null; quantity: number; product: Product }
export interface CartOptions { variantId?: string; farmId?: string | null }

const keyOf = (productId: number, variantId: string, farmId: string | null) => `${productId}:${variantId}:${farmId ?? ''}`;

interface CartState {
  items: CartItem[];
  add: (product: Product, quantity?: number, options?: CartOptions) => void;
  update: (key: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(persist(set => ({
  items: [],
  add: (product, quantity = 1, options = {}) => set(({ items }) => {
    const variantId = variantOf(product, options.variantId).id;
    const farmId = options.farmId ?? null;
    const key = keyOf(product.id, variantId, farmId);
    const found = items.some(item => item.key === key);
    return {
      items: found
        ? items.map(item => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { key, productId: product.id, variantId, farmId, quantity, product }],
    };
  }),
  update: (key, quantity) => set(({ items }) => ({
    items: quantity < 1 ? items.filter(x => x.key !== key) : items.map(x => x.key === key ? { ...x, quantity } : x),
  })),
  clear: () => set({ items: [] }),
}), { name: 'mevi-cart-v3' }));

export const unitPriceOf = (item: CartItem) => variantPrice(variantOf(item.product, item.variantId));
export const variantLabelOf = (item: CartItem) => variantOf(item.product, item.variantId).label;
export const farmNameOf = (item: CartItem) => farmOf(item.product, item.farmId)?.name ?? null;

const lineTotal = (item: CartItem) => unitPriceOf(item) * item.quantity;
export const selectCount = (s: CartState) => s.items.reduce((n, item) => n + item.quantity, 0);
export const selectTotal = (s: CartState) => s.items.reduce((n, item) => n + lineTotal(item), 0);

/** Full cart view (items, actions, count, total) for pages that render the whole cart. */
export function useCart() {
  const state = useCartStore();
  return { ...state, count: selectCount(state), total: selectTotal(state) };
}
