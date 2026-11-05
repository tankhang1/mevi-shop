import { http } from '@/shared/api/http-client';
import { queryClient } from '@/shared/api/query-client';
import { shopApi } from '@/features/shop/api/shop.api';
import { shopKeys } from '@/features/shop/api/shop.queries';
import { detailToProduct, productSortToApi, summaryToProduct } from '@/features/shop/model/shop-adapter';
import type { ListProductsParams, Product } from '@/shared/types';

/** Storefront products come from the real public shop API unless VITE_USE_MOCK_SHOP=true. */
export const USE_REAL_SHOP = import.meta.env.VITE_USE_MOCK_SHOP !== 'true';

const priceOf = (p: Product) => p.salePrice ?? p.price;

const categories = () => queryClient.fetchQuery({ queryKey: shopKeys.categories(), queryFn: shopApi.listCategories, staleTime: 5 * 60_000 });

async function listReal(params: ListProductsParams = {}): Promise<Product[]> {
  let categoryId: number | undefined;
  if (params.category) {
    categoryId = (await categories()).find(c => c.name === params.category || c.handle === params.category)?.id;
    if (categoryId === undefined) return [];
  }
  const page = await shopApi.listProducts({
    keyword: params.q,
    categoryId,
    sort: params.sort && productSortToApi[params.sort],
    size: 100,
  });
  let list = page.content.map(summaryToProduct);
  // Backend has no price filter, so it stays client-side.
  if (params.minPrice != null) list = list.filter(p => priceOf(p) >= params.minPrice!);
  if (params.maxPrice != null) list = list.filter(p => priceOf(p) <= params.maxPrice!);
  return list;
}

export const productsApi = {
  list: (params?: ListProductsParams) => USE_REAL_SHOP ? listReal(params) : http.get<Product[]>('/products', { ...params }),
  get: (id: number) => USE_REAL_SHOP ? shopApi.getProduct(id).then(detailToProduct) : http.get<Product>(`/products/${id}`),
};
