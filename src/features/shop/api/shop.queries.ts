import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BackendError } from "@/shared/api/api-client";
import { shopApi } from "./shop.api";
import type {
  PublicId,
  ShopProductDetailParams,
  ShopProductListParams,
  StorefrontListParams,
  StorefrontProductListParams,
} from "./shop.types";

export const shopKeys = {
  all: ["shop"] as const,
  categories: () => [...shopKeys.all, "categories"] as const,
  products: (params: ShopProductListParams = {}) =>
    [...shopKeys.all, "products", params] as const,
  product: (id: PublicId) => [...shopKeys.all, "product", id] as const,
  storefronts: (params: StorefrontListParams = {}) =>
    [...shopKeys.all, "storefronts", params] as const,
  storefront: (id: PublicId) => [...shopKeys.all, "storefront", id] as const,
  storefrontProducts: (
    id: PublicId,
    params: StorefrontProductListParams = {},
  ) => [...shopKeys.all, "storefront", id, "products", params] as const,
};

export const useShopCategories = () =>
  useQuery({
    queryKey: shopKeys.categories(),
    queryFn: shopApi.listCategories,
    staleTime: 5 * 60_000,
  });

export const useShopProducts = (params: ShopProductListParams = {}) =>
  useQuery({
    queryKey: shopKeys.products(params),
    queryFn: ({ signal }) => shopApi.listProducts(params, signal),
    placeholderData: keepPreviousData,
  });

// storefrontId only affects referral tracking, not the response → not part of the cache key.
export const useShopProduct = (
  id: PublicId | null | undefined,
  params: ShopProductDetailParams = {},
) =>
  useQuery({
    queryKey: shopKeys.product(id ?? 0),
    queryFn: ({ signal }) => shopApi.getProduct(id!, params, signal),
    enabled: !!id,
    retry: (count, e) =>
      !(e instanceof BackendError && (e.status === 404 || e.status === 400)) &&
      count < 1,
  });

export const useStorefronts = (params: StorefrontListParams = {}) =>
  useQuery({
    queryKey: shopKeys.storefronts(params),
    queryFn: ({ signal }) => shopApi.listStorefronts(params, signal),
    placeholderData: keepPreviousData,
  });

export const useStorefront = (id: PublicId | null | undefined) =>
  useQuery({
    queryKey: shopKeys.storefront(id ?? 0),
    queryFn: ({ signal }) => shopApi.getStorefront(id!, signal),
    enabled: !!id,
    retry: (count, e) =>
      !(e instanceof BackendError && (e.status === 404 || e.status === 400)) &&
      count < 1,
  });

export const useStorefrontProducts = (
  id: PublicId | null | undefined,
  params: StorefrontProductListParams = {},
) =>
  useQuery({
    queryKey: shopKeys.storefrontProducts(id ?? 0, params),
    queryFn: ({ signal }) =>
      shopApi.listStorefrontProducts(id!, params, signal),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
