import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BackendError } from '@/shared/api/api-client';
import { shopApi } from './shop.api';
import type { PublicId, ShopProductDetailParams, ShopProductListParams } from './shop.types';

export const shopKeys = {
  all: ['shop'] as const,
  categories: () => [...shopKeys.all, 'categories'] as const,
  products: (params: ShopProductListParams = {}) => [...shopKeys.all, 'products', params] as const,
  product: (id: PublicId) => [...shopKeys.all, 'product', id] as const,
};

export const useShopCategories = () =>
  useQuery({ queryKey: shopKeys.categories(), queryFn: shopApi.listCategories, staleTime: 5 * 60_000 });

export const useShopProducts = (params: ShopProductListParams = {}) =>
  useQuery({
    queryKey: shopKeys.products(params),
    queryFn: ({ signal }) => shopApi.listProducts(params, signal),
    placeholderData: keepPreviousData,
  });

// storefrontId only affects referral tracking, not the response → not part of the cache key.
export const useShopProduct = (id: PublicId | null | undefined, params: ShopProductDetailParams = {}) =>
  useQuery({
    queryKey: shopKeys.product(id ?? 0),
    queryFn: ({ signal }) => shopApi.getProduct(id!, params, signal),
    enabled: !!id,
    retry: (count, e) => !(e instanceof BackendError && (e.status === 404 || e.status === 400)) && count < 1,
  });
