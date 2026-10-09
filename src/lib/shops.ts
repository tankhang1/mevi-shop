// Dummy seller shops and product reviews. Frontend-only: there is no backend,
// and generated data is seeded by id so it is stable across reloads.

const px = (id: number, w = 600) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export interface Shop {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  avatar: string;
  cover: string;
  joined: string;
  followers: number;
  responseRate: number;
  verified: boolean;
  productIds: number[];
}

export const shops: Shop[] = [
  { slug: 'nong-trai-da-lat-xanh', name: 'Nông trại Đà Lạt Xanh', tagline: 'Rau củ sạch hái mỗi sáng', description: 'Hợp tác xã gồm 40 hộ nông dân tại Đà Lạt và Đơn Dương, canh tác nhà màng theo tiêu chuẩn VietGAP. Rau được thu hoạch lúc sáng sớm và đóng gói ngay tại vườn.', location: 'Đà Lạt, Lâm Đồng', avatar: px(1199562, 200), cover: px(2733918, 1600), joined: '2021', followers: 12840, responseRate: 98, verified: true, productIds: [7, 8, 12, 13, 14, 15, 18] },
  { slug: 'ca-phe-tay-nguyen', name: 'Cà phê Tây Nguyên', tagline: 'Rang mộc từ đất đỏ bazan', description: 'Xưởng rang thủ công tại Buôn Ma Thuột, chỉ dùng hạt chín 100% từ các nông hộ quen. Ngoài cà phê, chúng tôi bán thêm bơ sáp đúng vụ từ vườn nhà.', location: 'Buôn Ma Thuột, Đắk Lắk', avatar: '/products/buon-ma-thuot-robusta.jpg', cover: '/products/buon-ma-thuot-robusta.jpg', joined: '2020', followers: 9310, responseRate: 95, verified: true, productIds: [1, 11] },
  { slug: 'dac-san-mien-tay', name: 'Đặc sản Miền Tây', tagline: 'Gạo thơm, trái cây sấy quê nhà', description: 'Mang hương vị đồng bằng sông Cửu Long đến mọi gian bếp: gạo ST25 chính gốc Sóc Trăng và trái cây sấy giòn không đường hóa học.', location: 'Sóc Trăng', avatar: px(4110251, 200), cover: px(4110251, 1600), joined: '2022', followers: 6120, responseRate: 92, verified: false, productIds: [3, 4] },
  { slug: 'vuon-trai-cay-viet', name: 'Vườn Trái Cây Việt', tagline: 'Đặc sản trái cây ba miền', description: 'Kết nối trực tiếp với nhà vườn Ninh Thuận và Ninh Bình, đưa nho, dứa chín cây đến tay khách trong 48 giờ sau thu hoạch.', location: 'Phan Rang, Ninh Thuận', avatar: px(760281, 200), cover: px(1132047, 1600), joined: '2022', followers: 7480, responseRate: 97, verified: true, productIds: [9, 10] },
  { slug: 'tra-gia-vi-viet', name: 'Trà & Gia vị Việt', tagline: 'Hương vị Việt trong từng gói', description: 'Tuyển chọn trà Thái Nguyên, Ô long Bảo Lộc và các loại gia vị đặc sản như tiêu Phú Quốc, ớt Quảng Ngãi.', location: 'Thái Nguyên', avatar: px(1417945, 200), cover: px(461428, 1600), joined: '2021', followers: 5230, responseRate: 94, verified: false, productIds: [2, 6, 16, 17] },
  { slug: 'moc-chau-farm', name: 'Mộc Châu Farm', tagline: 'Sữa tươi từ cao nguyên', description: 'Trang trại bò sữa trên cao nguyên Mộc Châu, sữa được thanh trùng và giao lạnh trong ngày.', location: 'Mộc Châu, Sơn La', avatar: px(5946720, 200), cover: px(5946720, 1600), joined: '2023', followers: 3870, responseRate: 99, verified: true, productIds: [5] },
];

export const shopOfProduct = (productId: number) => shops.find(s => s.productIds.includes(productId)) ?? null;
export const shopBySlug = (slug: string) => shops.find(s => s.slug === slug) ?? null;

export interface Review { id: string; productId: number; author: string; rating: number; date: string; content: string; tags: string[]; helpful: number; images?: string[]; mine?: boolean }

const authors = ['Nguyễn Thu Hà', 'Trần Minh Khoa', 'Lê Bảo Ngọc', 'Phạm Gia Huy', 'Võ Thị Mai', 'Đỗ Quang Vinh', 'Huỳnh Anh Thư', 'Bùi Đức Long', 'Ngô Phương Linh', 'Đặng Hữu Tài'];
const praise = [
  { content: 'Hàng tươi, đóng gói cẩn thận, giao nhanh hơn mình nghĩ. Sẽ ủng hộ shop dài dài.', tags: ['Giao nhanh', 'Đóng gói kỹ'] },
  { content: 'Chất lượng đúng như mô tả, có ghi rõ vùng trồng nên mua rất yên tâm.', tags: ['Đúng mô tả', 'Rõ nguồn gốc'] },
  { content: 'Lần thứ ba mua rồi, chất lượng vẫn ổn định. Cả nhà đều thích.', tags: ['Mua lại', 'Chất lượng ổn định'] },
  { content: 'Giá hợp lý so với chất lượng. Shop tư vấn nhiệt tình qua điện thoại.', tags: ['Giá tốt', 'Shop nhiệt tình'] },
  { content: 'Mua làm quà biếu, người nhận khen ngon. Bao bì đẹp, sạch sẽ.', tags: ['Làm quà', 'Bao bì đẹp'] },
  { content: 'Ngon, thơm tự nhiên. Đặt buổi sáng chiều đã nhận được hàng.', tags: ['Giao nhanh', 'Ngon'] },
];
const mixed = [
  { content: 'Sản phẩm ổn, nhưng giao hàng hơi trễ một ngày so với hẹn.', tags: ['Giao hơi chậm'] },
  { content: 'Chất lượng tốt, có vài phần hơi dập do vận chuyển. Shop đã hỗ trợ đổi.', tags: ['Shop hỗ trợ đổi'] },
];

// Small deterministic PRNG so every product always gets the same reviews.
function seeded(seed: number) {
  let x = seed * 9301 + 49297;
  return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
}

// Reviews written in this browser, newest first. Kept in localStorage since there is no backend.
const USER_REVIEWS_KEY = 'mevi-user-reviews';
function readUserReviews(): Review[] {
  try { return JSON.parse(localStorage.getItem(USER_REVIEWS_KEY) || '[]'); } catch { return []; }
}
export function addUserReview(review: Omit<Review, 'id' | 'date' | 'helpful' | 'mine'>): Review {
  const full: Review = { ...review, id: `u-${Date.now()}`, date: new Date().toISOString(), helpful: 0, mine: true };
  try { localStorage.setItem(USER_REVIEWS_KEY, JSON.stringify([full, ...readUserReviews()])); } catch { /* storage full or blocked */ }
  return full;
}
export const reviewTagOptions = ['Giao nhanh', 'Đóng gói kỹ', 'Đúng mô tả', 'Tươi ngon', 'Giá tốt', 'Shop nhiệt tình', 'Rõ nguồn gốc'];

export function reviewsOf(productId: number): Review[] {
  return [...readUserReviews().filter(r => r.productId === productId), ...generatedReviews(productId)];
}

const reviewCache = new Map<number, Review[]>();
function generatedReviews(productId: number): Review[] {
  const cached = reviewCache.get(productId);
  if (cached) return cached;
  const rand = seeded(productId);
  const count = 4 + (productId % 5);
  const list: Review[] = Array.from({ length: count }, (_, i) => {
    // Rotate by index so reviews within a product never repeat text or author.
    const low = (productId + i) % 6 === 5;
    const pick = low ? mixed[(productId + i) % mixed.length] : praise[(productId * 2 + i) % praise.length];
    const date = new Date(Date.now() - Math.floor(rand() * 60 + i * 3) * 86_400_000).toISOString();
    return { id: `${productId}-${i}`, productId, author: authors[(productId * 3 + i) % authors.length], rating: low ? 3 + ((productId + i) % 2) : (productId + i) % 4 === 0 ? 4 : 5, date, content: pick.content, tags: pick.tags, helpful: Math.floor(rand() * 24) };
  }).sort((a, b) => b.date.localeCompare(a.date));
  reviewCache.set(productId, list);
  return list;
}

export function ratingSummary(reviews: Review[]) {
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));
  return { total, avg, counts };
}

// Extra gallery photos per category; every product only ships with one image.
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
