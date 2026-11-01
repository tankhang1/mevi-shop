import type { Product, ProductVariant } from '@/shared/types';
import type { ShelfLifeUnit, ShopProductDetail, ShopProductSummary, StorageCondition } from '../api/shop.types';

// Maps the public shop API onto the storefront `Product` shape, so cards, cart and purchase options stay unchanged.
// UI price convention: `price` = original, `salePrice` = discounted (API: `price` + `compareAtPrice` strike-through).

const priceFields = (price: number, compareAtPrice: number | null) =>
  compareAtPrice != null && compareAtPrice > price ? { price: compareAtPrice, salePrice: price } : { price, salePrice: null };

const shelfLifeUnits: Record<ShelfLifeUnit, string> = { DAY: 'ngày', WEEK: 'tuần', MONTH: 'tháng', YEAR: 'năm' };
const storageLabels: Record<StorageCondition, string> = { AMBIENT: 'Nhiệt độ thường', CHILLED: 'Bảo quản mát', FROZEN: 'Đông lạnh' };

export function summaryToProduct(p: ShopProductSummary): Product {
  return {
    id: p.id,
    handle: p.handle,
    name: p.title,
    sku: p.code,
    category: p.category.name,
    categoryId: p.category.id,
    description: '',
    origin: '',
    packageSize: p.variantCount > 1 ? `${p.variantCount} quy cách` : '',
    shelfLife: '',
    storageInstructions: '',
    imageUrls: p.thumbnailUrl ? [p.thumbnailUrl] : [],
    ...priceFields(p.minPrice, p.compareAtPrice),
    kind: 'general',
    // Real variant ids are unknown here; one placeholder carries the total stock for "Hết hàng".
    variants: [{ id: 'summary', label: '', ...priceFields(p.minPrice, p.compareAtPrice), stock: p.totalInventory }],
    summaryOnly: true,
    variantCount: p.variantCount,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    soldCount: p.soldCount,
    status: 'approved',
    createdAt: p.createdAt,
  };
}

export function detailToProduct(p: ShopProductDetail): Product {
  const variants: ProductVariant[] = p.variants.map(v => ({
    id: String(v.id),
    label: v.title,
    ...priceFields(v.price, v.compareAtPrice),
    stock: v.inventoryQuantity,
  }));
  const cheapest = [...variants].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))[0];
  const storage = [p.storageCondition && storageLabels[p.storageCondition], p.storageInstructions].filter(Boolean).join(' · ');
  return {
    id: p.id,
    handle: p.handle,
    name: p.title,
    sku: p.code,
    category: p.category.name,
    categoryId: p.category.id,
    description: p.description ?? '',
    origin: '',
    packageSize: variants.map(v => v.label).join(', '),
    shelfLife: p.shelfLifeValue && p.shelfLifeUnit ? `${p.shelfLifeValue} ${shelfLifeUnits[p.shelfLifeUnit]}` : '',
    storageInstructions: storage,
    imageUrls: p.media.map(m => m.url),
    price: cheapest?.price ?? 0,
    salePrice: cheapest?.salePrice ?? null,
    kind: 'general',
    variants,
    variantCount: variants.length,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    soldCount: p.soldCount,
    tags: p.tags,
    certifications: p.certifications,
    status: 'approved',
    createdAt: p.createdAt,
  };
}
