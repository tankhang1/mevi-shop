/** IDs of products / variants / storefronts are public IDs (~15–16 digits, ≤ 2^53−1, safe as number). Never compute on them. */
export type PublicId = number;

/** ISO-8601 UTC (`Z`). */
export type IsoDateTime = string;

export interface ShopCategory {
  id: number;
  name: string;
  handle: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ShopCategoryRef {
  id: number;
  name: string;
  handle: string;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE';
export type ShelfLifeUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
export type StorageCondition = 'AMBIENT' | 'CHILLED' | 'FROZEN';

/** Item of `GET /api/public/shop/products`. */
export interface ShopProductSummary {
  id: PublicId;
  code: string;
  title: string;
  handle: string;
  status: ProductStatus;
  category: ShopCategoryRef;
  agricultural: boolean;
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  /** Strike-through price of the cheapest variant; null = no discount. */
  compareAtPrice: number | null;
  variantCount: number;
  /** 0 → show "Hết hàng". */
  totalInventory: number;
  /** 1–5, null when no reviews. */
  ratingAverage: number | null;
  ratingCount: number;
  soldCount: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ShopProductMedia {
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
}

export interface ShopProductVariant {
  id: PublicId;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  /** 0 → variant not selectable. */
  inventoryQuantity: number;
}

export interface RatingBucket {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
}

/** `GET /api/public/shop/products/{id}`. `media[0]` is the cover. */
export interface ShopProductDetail {
  id: PublicId;
  code: string;
  title: string;
  handle: string;
  description: string | null;
  category: ShopCategoryRef;
  agricultural: boolean;
  status: ProductStatus;
  tags: string[];
  certifications: string[];
  media: ShopProductMedia[];
  shelfLifeValue: number | null;
  shelfLifeUnit: ShelfLifeUnit | null;
  storageCondition: StorageCondition | null;
  storageInstructions: string | null;
  variants: ShopProductVariant[];
  ratingAverage: number | null;
  ratingCount: number;
  /** Always 5 items, 5★ → 1★. Bar width = count / ratingCount. */
  ratingDistribution: RatingBucket[];
  soldCount: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface ShopProductListParams {
  categoryId?: number;
  /** Name, code, handle or variant SKU (case-insensitive). */
  keyword?: string;
  page?: number;
  size?: number;
}

export interface ShopProductDetailParams {
  /** Partner storefront the customer came from (referral tracking). */
  storefrontId?: PublicId;
}
