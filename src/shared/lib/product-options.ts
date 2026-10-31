import type { Product, ProductFarm, ProductKind, ProductVariant } from '@/shared/types';

// Products saved before variants/farms existed are normalised here, so both the
// storefront and the mock backend see the same options and stock.
const FARM_CATEGORIES = ['Trái cây tươi', 'Rau củ', 'Gạo', 'Cà phê', 'Trà', 'Gia vị'];
export const DEFAULT_VARIANT = 'std';

export const kindOf = (p: Product): ProductKind => p.kind ?? (FARM_CATEGORIES.includes(p.category) ? 'farm' : 'general');

export function variantsOf(p: Product): ProductVariant[] {
  if (p.variants?.length) return p.variants;
  return [{ id: DEFAULT_VARIANT, label: p.packageSize || 'Tiêu chuẩn', price: p.price, salePrice: p.salePrice ?? null, stock: 20 + (p.id * 37) % 80 }];
}

export function farmsOf(p: Product): ProductFarm[] {
  if (kindOf(p) !== 'farm') return [];
  if (p.farms?.length) return p.farms;
  const stock = Object.fromEntries(variantsOf(p).map(v => [v.id, 15 + (p.id * 23) % 60]));
  return [{ id: 'farm-1', name: `Vườn đối tác ${p.origin.split(',')[0] || 'Mevi'}`, owner: 'Hộ nông dân đối tác Mevi', location: p.origin, certification: 'VietGAP', stock }];
}

export const variantOf = (p: Product, variantId?: string) => variantsOf(p).find(v => v.id === variantId) ?? variantsOf(p)[0];
export const farmOf = (p: Product, farmId?: string | null) => farmsOf(p).find(f => f.id === farmId) ?? null;

export const variantPrice = (v: Pick<ProductVariant, 'price' | 'salePrice'>) => v.salePrice ?? v.price;

/** Units available for a variant (from a specific farm for farm products; summed when no farm chosen). */
export function stockOf(p: Product, variantId: string, farmId?: string | null) {
  if (kindOf(p) === 'general') return variantOf(p, variantId).stock;
  const farms = farmId ? farmsOf(p).filter(f => f.id === farmId) : farmsOf(p);
  return farms.reduce((n, f) => n + (f.stock[variantId] ?? 0), 0);
}

export const totalStock = (p: Product) => variantsOf(p).reduce((n, v) => n + stockOf(p, v.id), 0);

/** Whether a one-tap "add to cart" is unambiguous (single option, no farm choice). */
export const needsOptions = (p: Product) => variantsOf(p).length > 1 || farmsOf(p).length > 1;
