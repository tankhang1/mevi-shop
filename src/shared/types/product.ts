export type ProductStatus = 'pending' | 'approved' | 'rejected';

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
