import { px } from '@/shared/lib/pexels';

const categoryPhotos: Record<string, string[]> = {
  'Trái cây tươi': [px(1132047, 1200), px(1028599, 1200), px(4750270, 1200)],
  'Rau củ': [px(1508666, 1200), px(2255935, 1200), px(1640777, 1200), px(4750270, 1200)],
  'Gạo': [px(4198170, 1200), px(4750270, 1200), px(2255935, 1200)],
  'Cà phê': [px(4750270, 1200), px(4499231, 1200), px(2255935, 1200)],
  'Trà': [px(461428, 1200), px(1417945, 1200), px(4750270, 1200)],
  'Gia vị': [px(3338497, 1200), px(4033324, 1200), px(2255935, 1200)],
  'Trái cây sấy': [px(1132047, 1200), px(4499231, 1200), px(1028599, 1200)],
  'Sữa': [px(4750270, 1200), px(4499231, 1200), px(2255935, 1200)],
};
export function galleryOf(product: { imageUrls?: string[]; category: string }): string[] {
  const own = (product.imageUrls || []).filter(Boolean);
  const extras = (categoryPhotos[product.category] || [px(2255935, 1200)]).filter(u => !own.some(o => o.split('?')[0] === u.split('?')[0]));
  return (own.length > 1 ? own : [...own, ...extras]).slice(0, 5);
}

