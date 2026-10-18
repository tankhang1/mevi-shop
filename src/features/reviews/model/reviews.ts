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

