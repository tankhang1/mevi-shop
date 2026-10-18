import { useEffect, useState } from 'react';
import type { Product, OrderStatusInput } from '@/lib/api';

export function useCart() {
  const [items, setItems] = useState<{ productId: number; quantity: number; product: Product }[]>(() => {
    try { return JSON.parse(localStorage.getItem('mevi-cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('mevi-cart', JSON.stringify(items)); }, [items]);
  const add = (product: Product, quantity = 1) => setItems(old => {
    const found = old.find(item => item.productId === product.id);
    return found ? old.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...old, { productId: product.id, quantity, product }];
  });
  const update = (productId: number, quantity: number) => setItems(old => quantity < 1 ? old.filter(x => x.productId !== productId) : old.map(x => x.productId === productId ? { ...x, quantity } : x));
  const clear = () => setItems([]);
  return { items, add, update, clear, count: items.reduce((n, item) => n + item.quantity, 0), total: items.reduce((n, item) => n + (item.product.salePrice ?? item.product.price) * item.quantity, 0) };
}

export type OrderStatus = OrderStatusInput['status'];

export let cartStore: ReturnType<typeof useCart>;

/** Called once from <App /> so non-hook modules can read the live cart. */
export function useBindCart() { cartStore = useCart(); }
