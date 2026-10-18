import { http } from '@/shared/api/http-client';
import type { ListProductsParams, Product } from '@/shared/types';

export const productsApi = {
  list: (params?: ListProductsParams) => http.get<Product[]>('/products', { ...params }),
  get: (id: number) => http.get<Product>(`/products/${id}`),
};
