import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/features/products/api/products.queries';
import type { PublicId } from '@/features/shop/api/shop.types';
import { reviewsApi } from './reviews.api';
import type { CreateReviewInput } from './reviews.types';

const PAGE_SIZE = 10;

export const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: PublicId) => [...reviewKeys.all, 'product', productId] as const,
  productList: (productId: PublicId, rating?: number) => [...reviewKeys.product(productId), 'list', rating ?? 'all'] as const,
  mine: (productId: PublicId) => [...reviewKeys.product(productId), 'me'] as const,
};

export const useProductReviews = (productId: PublicId, rating?: number) =>
  useInfiniteQuery({
    queryKey: reviewKeys.productList(productId, rating),
    queryFn: ({ pageParam, signal }) => reviewsApi.listByProduct(productId, { rating, page: pageParam, size: PAGE_SIZE }, signal),
    initialPageParam: 0,
    getNextPageParam: last => (last.last ? undefined : last.page + 1),
  });

export const useMyProductReviews = (productId: PublicId, enabled: boolean) =>
  useQuery({
    queryKey: reviewKeys.mine(productId),
    queryFn: ({ signal }) => reviewsApi.mine(productId, signal),
    enabled,
    retry: false,
  });

export const useCreateReview = (productId: PublicId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewsApi.create(productId, input),
    // Summary (average / distribution) lives on the product, so refresh it too.
    onSuccess: () => Promise.all([
      qc.invalidateQueries({ queryKey: reviewKeys.product(productId) }),
      qc.invalidateQueries({ queryKey: productKeys.all }),
    ]),
  });
};

export const useToggleHelpful = (productId: PublicId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, helpful }: { reviewId: PublicId; helpful: boolean }) =>
      helpful ? reviewsApi.markHelpful(reviewId) : reviewsApi.unmarkHelpful(reviewId),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.product(productId) }),
  });
};
