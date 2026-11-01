import { http } from '@/shared/api/http-client';
import { queryClient } from '@/shared/api/query-client';
import { shopApi } from '@/features/shop/api/shop.api';
import { shopKeys } from '@/features/shop/api/shop.queries';
import { detailToProduct, summaryToProduct } from '@/features/shop/model/shop-adapter';
import type { ListProductsParams, Product } from '@/shared/types';

/** Storefront products come from the real public shop API unless VITE_USE_MOCK_SHOP=true. */
export const USE_REAL_SHOP = import.meta.env.VITE_USE_MOCK_SHOP !== 'true';

const priceOf = (p: Product) => p.salePrice ?? p.price;

const categories = () => queryClient.fetchQuery({ queryKey: shopKeys.categories(), queryFn: shopApi.listCategories, staleTime: 5 * 60_000 });

// Backend has no sort / price filter: newest first only, so the rest is done client-side.
function sortProducts(list: Product[], sort: ListProductsParams['sort']) {
  const by = {
    'price-asc': (a: Product, b: Product) => priceOf(a) - priceOf(b),
    'price-desc': (a: Product, b: Product) => priceOf(b) - priceOf(a),
    featured: (a: Product, b: Product) => (b.soldCount ?? 0) - (a.soldCount ?? 0),
  } as const;
  return sort && sort !== 'newest' ? [...list].sort(by[sort]) : list;
}

async function listReal(params: ListProductsParams = {}): Promise<Product[]> {
  let categoryId: number | undefined;
  if (params.category) {
    categoryId = (await categories()).find(c => c.name === params.category || c.handle === params.category)?.id;
    if (categoryId === undefined) return [];
  }
  const page = await shopApi.listProducts({ keyword: params.q, categoryId, size: 100 });
  let list = page.content.map(summaryToProduct);
  if (params.minPrice != null) list = list.filter(p => priceOf(p) >= params.minPrice!);
  if (params.maxPrice != null) list = list.filter(p => priceOf(p) <= params.maxPrice!);
  return sortProducts(list, params.sort);
}

export const productsApi = {
  list: (params?: ListProductsParams) => USE_REAL_SHOP ? listReal(params) : http.get<Product[]>('/products', { ...params }),
  get: (id: number) => USE_REAL_SHOP ? shopApi.getProduct(id).then(detailToProduct) : http.get<Product>(`/products/${id}`),
};
