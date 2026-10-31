export type OrderStatus = 'new' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  farmId?: string | null;
  farmName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  code: string;
  customerName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  note: string | null;
  total: number;
  status: OrderStatus;
  agencySlug: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderInput {
  customerName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  note?: string | null;
  agencySlug?: string | null;
  items: { productId: number; quantity: number; variantId?: string; farmId?: string | null }[];
}
