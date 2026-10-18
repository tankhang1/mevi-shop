import { useState } from 'react';
import type { Product } from '@/lib/api';
import { Star } from 'lucide-react';
import { ratingSummary, type Review } from '@/lib/shops';
import { ReviewItem } from '@/features/reviews/review-item';
import { Empty } from '@/shared/ui/feedback';
import { Stars } from '@/shared/ui/stars';

export function ReviewsBlock({ reviews, products }: { reviews: Review[]; products?: Product[] }) {
  const [star, setStar] = useState(0);
  const [limit, setLimit] = useState(5);
  const { total, avg, counts } = ratingSummary(reviews);
  const list = star ? reviews.filter(r => r.rating === star) : reviews;
  if (!total) return <Empty title="Chưa có đánh giá" detail="Hãy là người đầu tiên đánh giá sản phẩm này." />;
  return <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]"><div className="surface h-fit p-6 lg:sticky lg:top-24"><div className="flex items-end gap-2"><span className="text-5xl font-extrabold text-[#214c3a]">{avg.toFixed(1)}</span><span className="pb-1.5 text-sm text-muted-foreground">/ 5</span></div><Stars value={avg} size={18} /><p className="mt-1 text-xs text-muted-foreground">{total} đánh giá</p><div className="mt-5 grid gap-2">{counts.map(c => <button key={c.star} onClick={() => { setStar(star === c.star ? 0 : c.star); setLimit(5); }} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition ${star === c.star ? 'bg-[#eef1e9]' : 'hover:bg-[#f6f5ee]'}`}><span className="flex w-7 items-center gap-0.5 font-bold text-[#52645a]">{c.star}<Star size={11} fill="currentColor" className="text-[#d4a24c]" /></span><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#ece8de]"><span className="block h-full rounded-full bg-[#d4a24c]" style={{ width: `${total ? (c.count / total) * 100 : 0}%` }} /></span><span className="w-5 text-right text-muted-foreground">{c.count}</span></button>)}</div></div><div className="surface px-5 md:px-6">{list.length ? list.slice(0, limit).map(r => <ReviewItem key={r.id} review={r} product={products?.find(p => p.id === r.productId)} />) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có đánh giá {star} sao.</p>}{list.length > limit && <div className="pb-5"><button className="btn-outline w-full" onClick={() => setLimit(limit + 5)}>Xem thêm đánh giá ({list.length - limit})</button></div>}</div></div>;
}
