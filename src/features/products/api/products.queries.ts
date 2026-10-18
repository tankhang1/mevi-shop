import { useQuery } from '@tanstack/react-query';
import type { ListProductsParams } from '@/shared/types';
import { productsApi } from './products.api';

export const productKeys = {
  all: ['products'] as const,
  list: (params: ListProductsParams = {}) => [...productKeys.all, 'list', params] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

export const useProducts = (params: ListProductsParams = {}) =>
  useQuery({ queryKey: productKeys.list(params), queryFn: () => productsApi.list(params) });

export const useProduct = (id: number) =>
  useQuery({ queryKey: productKeys.detail(id), queryFn: () => productsApi.get(id), enabled: !!id });
