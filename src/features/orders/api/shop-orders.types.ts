/** Mirrors `ShopOrderRequest` / `ShopOrderResponse` of `/api/shop/customer/orders`. */
export type ShopOrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

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
  variant: { id: number; title: string } | null;
  sku: string;
  baseUnit: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Garden chosen at order time; null when none was chosen. */
  productionZone: { id: number; code: string; name: string } | null;
}

export interface ShopOrder {
  id: number;
  code: string;
  status: ShopOrderStatus;
  recipient: { name: string; phone: string; province: string; district: string; addressLine: string };
  note: string | null;
  items: ShopOrderItem[];
  total: number;
  storefront: { id: number } | null;
  createdAt: string;
}

export interface ShopOrderListParams {
  status?: ShopOrderStatus;
  page?: number;
  size?: number;
}
