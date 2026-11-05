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

export type ProductStatus = "ACTIVE" | "INACTIVE";
export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type StorageCondition = "AMBIENT" | "CHILLED" | "FROZEN";

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
  /** Delivered orders containing this product, all time. Several variants in one order count once; cancelled orders don't count. */
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

export interface ShopSupplySource {
  productionZone: { id: number; code: string; name: string };
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
  /** Gardens supplying an agricultural product; null/empty when none are set. */
  supplySources?: ShopSupplySource[] | null;
  variants: ShopProductVariant[];
  ratingAverage: number | null;
  ratingCount: number;
  /** Always 5 items, 5★ → 1★. Bar width = count / ratingCount. */
  ratingDistribution: RatingBucket[];
  /** Delivered orders containing this product, all time. Several variants in one order count once; cancelled orders don't count. */
  soldCount: number;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/**
 * Product sort; ties put the newest record first. An invalid value → 400.
 * - `FEATURED` (Nổi bật): product revenue over the current + 2 previous months (VN time), highest first.
 * - `NEWEST` (Mới nhất): newest created first.
 * - `PRICE_ASC` (Giá thấp đến cao) / `PRICE_DESC` (Giá cao đến thấp): by `minPrice`.
 */
export type ShopProductSort = "FEATURED" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC";

export interface ShopProductListParams {
  categoryId?: number;
  /** Name, code, handle or variant SKU (case-insensitive). */
  keyword?: string;
  /** Defaults to `NEWEST` on the backend. The "Nổi bật" dropdown default must send `FEATURED` explicitly. */
  sort?: ShopProductSort;
  page?: number;
  size?: number;
}

export interface ShopProductDetailParams {
  /** Partner storefront the customer came from (referral tracking). */
  storefrontId?: PublicId;
}

/** Body for `POST /api/public/shop/partner-contact-requests`. */
export interface CreatePartnerContactRequestPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  province?: string;
  note?: string;
}

/** Public storefront: `GET /api/public/shop/storefronts/{id}` and items of `GET /api/public/shop/storefronts`. */
export interface PublicStorefront {
  id: PublicId;
  handle: string;
  name: string;
  slogan: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  province: string | null;
  verified: boolean;
  joinedYear: number;
  productCount: number;
  followerCount: number;
}

/**
 * Storefront sort; ties put the newest record first. An invalid value → 400.
 * - `REVENUE` (Doanh thu cao nhất): revenue from orders placed via the storefront's referral link,
 *   over the current + 2 previous months (VN time), highest first. Storefronts with no revenue come last.
 * - `NEWEST` (Mới nhất): newest created first.
 */
export type StorefrontSort = "REVENUE" | "NEWEST";

export interface StorefrontListParams {
  /** Defaults to `REVENUE` on the backend. */
  sort?: StorefrontSort;
  /** 0-based, default 0. */
  page?: number;
  /** 1–100, default 20. */
  size?: number;
}

export interface StorefrontProductListParams {
  /** Name, code, handle or variant SKU (case-insensitive). */
  keyword?: string;
  /** Omit for the partner's own order, which is the storefront page default ("Gian hàng đề xuất"). */
  sort?: ShopProductSort;
  page?: number;
  size?: number;
}
