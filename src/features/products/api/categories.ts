import { useQuery } from '@tanstack/react-query';
import { categoryTiles } from '@/features/home/data';
import { shopApi } from '@/features/shop/api/shop.api';
import { shopKeys } from '@/features/shop/api/shop.queries';
import { imageFallback } from '@/shared/config';
import { USE_REAL_SHOP } from './products.api';

export interface CategoryTile { id?: number; name: string; desc: string; image: string; bg: string }

const palette = categoryTiles.map(c => c.bg);

/** Storefront category tiles: API categories, styled like the design tiles (matched by name when possible). */
export function useCategoryTiles() {
  const query = useQuery({
    queryKey: shopKeys.categories(),
    queryFn: shopApi.listCategories,
    staleTime: 5 * 60_000,
    enabled: USE_REAL_SHOP,
  });
  if (!USE_REAL_SHOP) return { tiles: categoryTiles as CategoryTile[], isLoading: false };
  const tiles: CategoryTile[] = (query.data ?? []).map((c, i) => {
    const design = categoryTiles.find(t => t.name === c.name);
    return {
      id: c.id,
      name: c.name,
      desc: c.description ?? design?.desc ?? '',
      image: c.imageUrl ?? design?.image ?? imageFallback,
      bg: design?.bg ?? palette[i % palette.length],
    };
  });
  return { tiles, isLoading: query.isLoading };
}
