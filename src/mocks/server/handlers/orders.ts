import type { Order, OrderInput, Product } from '@/shared/types';
import { farmOf, farmsOf, kindOf, stockOf, variantOf, variantPrice, variantsOf } from '@/shared/lib/product-options';
import { db, MockHttpError, notFound, save } from '../db';

export function createOrder(input: OrderInput): Order {
  const order = makeOrderFromInput(input);
  db.orders.push(order); save();
  return order;
}

// Materialise derived options on the stored product so stock can be decremented.
function ensureOptions(p: Product) {
  p.variants = variantsOf(p).map(v => ({ ...v }));
  if (kindOf(p) === 'farm') p.farms = farmsOf(p).map(f => ({ ...f, stock: { ...f.stock } }));
}

function makeOrderFromInput(input: OrderInput): Order {
  if (!input.items?.length) throw new MockHttpError(400, 'Order has no items');
  const lines = input.items.map(it => {
    const p = db.products.find(x => x.id === it.productId) ?? notFound();
    const variant = variantOf(p, it.variantId);
    const farm = kindOf(p) === 'farm' ? farmOf(p, it.farmId) ?? farmsOf(p)[0] : null;
    if (kindOf(p) === 'farm' && !farm) throw new MockHttpError(400, `Vui lòng chọn vườn cho ${p.name}`);
    return { it, p, variant, farm };
  });
  // Validate every line first (summing duplicates) so a failed order doesn't touch stock.
  const want = new Map<string, number>();
  for (const { it, p, variant, farm } of lines) {
    const k = `${p.id}:${variant.id}:${farm?.id ?? ''}`;
    want.set(k, (want.get(k) ?? 0) + it.quantity);
    const left = stockOf(p, variant.id, farm?.id);
    if (want.get(k)! > left) throw new MockHttpError(409, `${p.name} (${variant.label}${farm ? ` · ${farm.name}` : ''}) chỉ còn ${left} sản phẩm`);
  }
  const orderId = ++db.seq;
  const items = lines.map(({ it, p, variant, farm }, i) => {
    ensureOptions(p);
    if (farm) p.farms!.find(f => f.id === farm.id)!.stock[variant.id] -= it.quantity;
    else p.variants!.find(v => v.id === variant.id)!.stock -= it.quantity;
    const unitPrice = variantPrice(variant);
    return {
      id: orderId * 10 + i, productId: p.id, productName: p.name, variantId: variant.id, variantLabel: variant.label,
      farmId: farm?.id ?? null, farmName: farm?.name ?? null, quantity: it.quantity, unitPrice, lineTotal: unitPrice * it.quantity,
    };
  });
  return {
    id: orderId, code: `MV${1000 + orderId}`, customerName: input.customerName, phone: input.phone, address: input.address,
    province: input.province, district: input.district, note: input.note ?? null, agencySlug: input.agencySlug ?? null,
    total: items.reduce((s, l) => s + l.lineTotal, 0), status: 'new', items, createdAt: new Date().toISOString(),
  };
}
