import { apiClient } from '@/shared/api/api-client';
import type { Page } from '@/shared/api/api.types';
import type { PublicId } from '@/features/shop/api/shop.types';
import type {
  CreateReviewInput, MyProductReviews, ProductReviewListParams, ShopReview, ShopReviewMedia, StoredPhoto,
} from './reviews.types';

export const reviewsApi = {
  /** GET /api/public/shop/products/{id}/reviews — visible only, newest first; 404 when product not on sale. */
  listByProduct: (productId: PublicId, params: ProductReviewListParams = {}, signal?: AbortSignal) =>
    apiClient.get<Page<ShopReview>>(`/api/public/shop/products/${productId}/reviews`, { skipAuth: true, params: { ...params }, signal }),

  /** POST /api/shop/customer/products/{id}/reviews — 409 when the customer cannot review any more. */
  create: (productId: PublicId, input: CreateReviewInput) =>
    apiClient.post<ShopReview>(`/api/shop/customer/products/${productId}/reviews`, input),

  /** GET /api/shop/customer/products/{id}/reviews/me */
  mine: (productId: PublicId, signal?: AbortSignal) =>
    apiClient.get<MyProductReviews>(`/api/shop/customer/products/${productId}/reviews/me`, { signal }),

  /** PUT /api/shop/customer/reviews/{id}/helpful — idempotent; 409 on own review. */
  markHelpful: (reviewId: PublicId) => apiClient.put<ShopReview>(`/api/shop/customer/reviews/${reviewId}/helpful`),

  /** DELETE /api/shop/customer/reviews/{id}/helpful — idempotent. */
  unmarkHelpful: (reviewId: PublicId) => apiClient.delete<ShopReview>(`/api/shop/customer/reviews/${reviewId}/helpful`),

  /** POST /api/storage/product-photos. ASSUMED: multipart field name is `file` (not stated in the doc). */
  uploadPhoto: async (file: File): Promise<ShopReviewMedia> => {
    const body = new FormData();
    body.append('file', file);
    const photo = await apiClient.post<StoredPhoto>('/api/storage/product-photos', body);
    return { url: photo.fileUrl, thumbnailUrl: photo.thumbnail?.fileUrl ?? null };
  },
};
