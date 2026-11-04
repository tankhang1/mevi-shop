import type { PageParams } from '@/shared/api/api.types';
import type { IsoDateTime, PublicId } from '@/features/shop/api/shop.types';

export interface ShopReviewMedia {
  url: string;
  thumbnailUrl: string | null;
}

/**
 * Review item. Documented in 9.2–9.4: id, rating, content, tags, media, verifiedPurchase, helpfulCount, hidden.
 * ASSUMED (section 9.1 not received): customerName, createdAt, reply. All optional so the UI degrades safely.
 */
export interface ShopReview {
  id: PublicId;
  rating: number;
  content?: string | null;
  tags?: string[];
  media?: ShopReviewMedia[];
  verifiedPurchase: boolean;
  helpfulCount?: number;
  /** Only in customer responses. */
  hidden?: boolean;
  customerName?: string | null;
  createdAt?: IsoDateTime;
  reply?: { content: string; repliedAt?: IsoDateTime } | null;
}

export interface ProductReviewListParams extends PageParams {
  /** 1–5; omit = all. */
  rating?: number;
}

export interface CreateReviewInput {
  /** 1–5 */
  rating: number;
  /** ≤ 500 chars */
  content?: string;
  /** ≤ 10 tags, each ≤ 50 chars */
  tags?: string[];
  /** ≤ 6 photos uploaded through `POST /api/storage/product-photos` */
  media?: ShopReviewMedia[];
}

export interface MyProductReviews {
  /** Newest first, including hidden ones. */
  reviews: ShopReview[];
  canReview: boolean;
  helpfulReviewIds: PublicId[];
}

/** `POST /api/storage/product-photos` response (only the fields FE uses). */
export interface StoredPhoto {
  fileUrl: string;
  thumbnail?: { fileUrl: string } | null;
}
