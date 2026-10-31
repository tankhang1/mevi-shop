export type ProductStatus = 'pending' | 'approved' | 'rejected';

/** 'farm' = nông sản: buyer also picks which garden it comes from. */
export type ProductKind = 'general' | 'farm';

export interface ProductVariant {
  id: string;
  /** Quy cách / đơn vị, e.g. "Túi 500g". */
  label: string;
  price: number;
  salePrice?: number | null;
  /** Stock for general products; farm products keep stock per farm instead. */
  stock: number;
}

export interface ProductFarm {
  id: string;
  name: string;
  owner: string;
  location: string;
  certification?: string;
  /** Stock per variant id. */
  stock: Record<string, number>;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  description: string;
  origin: string;
  packageSize: string;
  shelfLife: string;
  storageInstructions: string;
  imageUrls: string[];
  price: number;
  salePrice?: number | null;
  kind?: ProductKind;
  /** Rich (WYSIWYG) product details; `description` stays the short summary. */
  descriptionHtml?: string;
  variants?: ProductVariant[];
  farms?: ProductFarm[];
  status: ProductStatus;
  rejectionReason?: string | null;
  createdAt: string;
}

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export interface ListProductsParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

export type ProductInput = Omit<Product, 'id' | 'status' | 'rejectionReason' | 'createdAt'>;

export interface ProductModeration {
  status: 'approved' | 'rejected';
  rejectionReason?: string | null;
}
