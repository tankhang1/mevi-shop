/** Mirrors `ShopOrderRequest` / `ShopOrderResponse` of `/api/shop/customer/orders`. */
export type ShopOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";
export type ShopOrderPaymentStatus = "UNPAID" | "PAID";

export interface ShopOrderItemRequest {
  productId: number;
  /** Omit to buy by base unit. */
  variantId?: number;
  quantity: number;
  /** A `supplySources[].productionZone.id` of the product. Traceability only: no effect on price or stock. */
  productionZoneId?: number;
}

export interface ShopOrderRequest {
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  addressLine: string;
  note?: string;
  storefrontId?: number;
  items: ShopOrderItemRequest[];
}

export interface ShopOrderItem {
  id: number;
  product: { id: number; code: string; title: string; imageUrl: string | null };
  /** null = bought by base unit; `id` is null when the variant was deleted later. */
  variant: { id: number | null; title: string } | null;
  sku: string;
  baseUnit: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Garden chosen at order time; null when none was chosen. */
  productionZone: { id: number; code: string; name: string | null } | null;
}

export interface ShopOrder {
  id: number;
  code: string;
  status: ShopOrderStatus;
  paymentStatus?: ShopOrderPaymentStatus | null;
  paidAt?: string | null;
  recipient: {
    name: string;
    phone: string;
    province: string;
    district: string;
    addressLine: string;
  };
  note: string | null;
  items: ShopOrderItem[];
  total: number;
  storefront: { id: number; name?: string } | null;
  shippingCarrier: string | null;
  trackingCode: string | null;
  confirmedAt: string | null;
  shippingAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
}

export interface ShopOrderListParams {
  status?: ShopOrderStatus;
  keyword?: string;
  page?: number;
  size?: number;
}
