import type { Order, OrderItem, Product } from '@/shared/types';
import type { CartOptions } from '@/features/cart/model/cart.store';

/** Rebuilds a cart-ready product from an order line, keeping its quy cách and garden. */
export function reorderLine(order: Order, item: OrderItem): [Product, number, CartOptions] {
  const variantId = item.variantId ?? 'std';
  const label = item.variantLabel ?? 'Tiêu chuẩn';
  const product: Product = {
    id: item.productId, name: item.productName, sku: `SKU-${item.productId}`, category: 'Nông sản', description: '',
    origin: order.province || 'Việt Nam', packageSize: label, shelfLife: '12 tháng', storageInstructions: '',
    price: item.unitPrice, salePrice: null, status: 'approved', createdAt: new Date().toISOString(), imageUrls: [],
    kind: item.farmId ? 'farm' : 'general',
    variants: [{ id: variantId, label, price: item.unitPrice, salePrice: null, stock: 999 }],
    farms: item.farmId ? [{ id: item.farmId, name: item.farmName ?? 'Vườn đối tác', owner: '', location: order.province, stock: { [variantId]: 999 } }] : undefined,
  };
  return [product, item.quantity, { variantId, farmId: item.farmId ?? null }];
}
