import type { Order, OrderInput } from '@/shared/types';
import { db, MockHttpError, notFound, save } from '../db';

export function createOrder(input: OrderInput): Order {
  const order = makeOrderFromInput(input);
  db.orders.push(order); save();
  return order;
}

function makeOrderFromInput(input: OrderInput): Order {
  if (!input.items?.length) throw new MockHttpError(400, 'Order has no items');
  const orderId = ++db.seq;
  const items = input.items.map((it, i) => {
    const p = db.products.find(x => x.id === it.productId) ?? notFound();
    const unitPrice = p.salePrice ?? p.price;
    return { id: orderId * 10 + i, productId: p.id, productName: p.name, quantity: it.quantity, unitPrice, lineTotal: unitPrice * it.quantity };
  });
  return {
    id: orderId, code: `MV${1000 + orderId}`, customerName: input.customerName, phone: input.phone, address: input.address,
    province: input.province, district: input.district, note: input.note ?? null, agencySlug: input.agencySlug ?? null,
    total: items.reduce((s, l) => s + l.lineTotal, 0), status: 'new', items, createdAt: new Date().toISOString(),
  };
}
