import { BackendError } from '@/shared/api/api-client';
import type { Order, OrderInput, OrderStatus } from '@/shared/types';
import type { ShopOrder, ShopOrderRequest, ShopOrderStatus } from '../api/shop-orders.types';

const statuses: Record<ShopOrderStatus, OrderStatus> = {
  PENDING: 'new', CONFIRMED: 'confirmed', SHIPPING: 'shipped', DELIVERED: 'completed', CANCELLED: 'cancelled',
};

/** Cart ids are strings; demo or reordered lines may hold non-numeric ones, which the API must not receive. */
const numericId = (id?: string | null) => (id && /^\d+$/.test(id) ? Number(id) : undefined);

const storefrontRef = () => {
  try { return numericId(localStorage.getItem('mevi-storefront-ref')); } catch { return undefined; }
};

export function toShopOrderRequest(input: OrderInput): ShopOrderRequest {
  return {
    recipientName: input.customerName,
    recipientPhone: input.phone,
    province: input.province,
    district: input.district,
    addressLine: input.address,
    note: input.note || undefined,
    storefrontId: storefrontRef(),
    items: input.items.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
      variantId: numericId(it.variantId),
      productionZoneId: numericId(it.farmId),
    })),
  };
}

export function fromShopOrder(o: ShopOrder): Order {
  return {
    id: o.id,
    code: o.code,
    customerName: o.recipient.name,
    phone: o.recipient.phone,
    address: o.recipient.addressLine,
    province: o.recipient.province,
    district: o.recipient.district,
    note: o.note,
    total: o.total,
    status: statuses[o.status],
    agencySlug: null,
    createdAt: o.createdAt,
    shippingCarrier: o.shippingCarrier,
    trackingCode: o.trackingCode,
    confirmedAt: o.confirmedAt,
    shippingAt: o.shippingAt,
    deliveredAt: o.deliveredAt,
    cancelledAt: o.cancelledAt,
    cancelReason: o.cancelReason,
    items: o.items.map(it => ({
      id: it.id,
      productId: it.product.id,
      productName: it.product.title,
      variantId: it.variant?.id != null ? String(it.variant.id) : undefined,
      variantLabel: it.variant?.title ?? (it.baseUnit ? baseUnits[it.baseUnit] ?? it.baseUnit : undefined),
      imageUrl: it.product.imageUrl,
      farmId: it.productionZone ? String(it.productionZone.id) : null,
      farmCode: it.productionZone?.code ?? null,
      farmName: it.productionZone?.name ?? null,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
    })),
  };
}

const baseUnits: Record<string, string> = { KG: 'kg', GRAM: 'gram', LITER: 'lít', ML: 'ml', PIECE: 'cái', BOX: 'hộp', BOTTLE: 'chai', PACK: 'gói', BAG: 'túi' };

const carriers: Record<string, string> = {
  SELF_DELIVERY: 'Mevi tự giao', GHN: 'GHN', GHTK: 'GHTK', VIETTEL_POST: 'Viettel Post', VNPOST: 'VNPost', JT_EXPRESS: 'J&T Express', NINJA_VAN: 'Ninja Van', OTHER: 'Đơn vị khác',
};
export const carrierLabel = (code: string) => carriers[code] ?? code;

const fieldLabel = (field: string, names: string[]) => {
  const line = /^items\[(\d+)\]\.(\w+)$/.exec(field);
  if (!line) return field === 'recipientPhone' ? 'Số điện thoại không hợp lệ (cần số di động Việt Nam)' : null;
  const name = names[Number(line[1])] ?? 'Sản phẩm';
  return ({
    productId: `${name} hiện không còn bán`,
    variantId: `Quy cách của ${name} không còn hợp lệ`,
    quantity: `${name} không đủ tồn kho hoặc số lượng không hợp lệ`,
    productionZoneId: `Vườn đã chọn của ${name} không còn hợp lệ`,
  } as Record<string, string>)[line[2]] ?? null;
};

/** Readable checkout error; `names` are the product names in request order. */
export function orderErrorMessage(e: unknown, names: string[]) {
  const fallback = 'Chưa thể ghi nhận đơn. Vui lòng kiểm tra thông tin và thử lại.';
  if (!(e instanceof BackendError)) return (e as { status?: number }).status === 409 ? `${(e as Error).message}. Vui lòng cập nhật giỏ hàng.` : fallback;
  if (e.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (e.status === 403) return 'Tài khoản này không có quyền đặt hàng. Vui lòng dùng tài khoản khách hàng.';
  const details = Object.keys(e.fieldErrors).map(f => fieldLabel(f, names)).filter(Boolean);
  return details.length ? details.join('. ') : fallback;
}
