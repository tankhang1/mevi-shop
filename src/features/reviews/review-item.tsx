import type { Product } from '@/shared/types';
import type { Review } from '@/features/reviews/model/reviews';
import { useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import { BadgeCheck, EyeOff } from 'lucide-react';
import { Lightbox } from '@/features/products/components/product-gallery';
import { imageFallback } from '@/shared/config';
import { dateFmt } from '@/shared/lib/format';
import { MockBadge } from '@/shared/ui/mock-badge';
import { Stars } from '@/shared/ui/stars';

export const avatarColors = ['#285e45', '#bd6e46', '#5f8f6e', '#8a4a2c', '#4f7f6a', '#a0623f'];

/** `actions` replaces the default helpful count (e.g. with the helpful button). */
export function ReviewItem({ review, product, actions }: { review: Review; product?: Product; actions?: ReactNode }) {
  const [zoomAt, setZoomAt] = useState<number | null>(null);
  const initials = review.author.split(' ').slice(-2).map(w => w[0]).join('');
  // Mock reviews have no `verified` flag: they keep showing the purchase badge unless written here.
  const verified = review.verified ?? !review.mine;
  return <article className="border-b border-[#ece8de] py-5 last:border-0" data-testid={`review-${review.id}`}>
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: avatarColors[review.author.length % avatarColors.length] }}>{initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-bold text-[#214c3a]">{review.author}</p>
          {review.authorMissing && <MockBadge detail="API chưa trả tên người đánh giá" />}
          {review.mine && <span className="rounded-full bg-[#f6e6dc] px-2 py-0.5 text-[10px] font-bold text-[#bd6e46]">Đánh giá của bạn</span>}
          {verified && <span className="inline-flex items-center gap-1 rounded-full bg-[#eef1e9] px-2 py-0.5 text-[10px] font-bold text-[#285e45]"><BadgeCheck size={11} /> Đã mua hàng</span>}
          {review.hidden && <span className="inline-flex items-center gap-1 rounded-full bg-[#efede6] px-2 py-0.5 text-[10px] font-bold text-[#7a8279]"><EyeOff size={11} /> Đang bị ẩn</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Stars value={review.rating} size={12} />{review.date && <span>{dateFmt(review.date)}</span>}</div>
        {review.content && <p className="mt-2.5 whitespace-pre-line text-sm leading-6 text-[#3d4a42]">{review.content}</p>}
        {!!review.images?.length && <div className="mt-3 flex flex-wrap gap-2">{review.images.map((src, n) => <button key={n} onClick={() => setZoomAt(n)} className="overflow-hidden rounded-xl" aria-label={`Xem ảnh ${n + 1}`}><img src={review.thumbnails?.[n] || src} alt="" className="h-20 w-20 cursor-zoom-in object-cover transition hover:scale-105" /></button>)}</div>}
        {zoomAt !== null && review.images && <Lightbox images={review.images} index={zoomAt} onIndex={setZoomAt} onClose={() => setZoomAt(null)} alt={`Ảnh đánh giá của ${review.author}`} />}
        {!!review.tags.length && <div className="mt-2.5 flex flex-wrap gap-1.5">{review.tags.map(t => <span key={t} className="rounded-full border border-[#e3e0d5] px-2.5 py-0.5 text-[11px] font-semibold text-[#52645a]">{t}</span>)}</div>}
        {review.reply && <div className="mt-3 rounded-xl bg-[#f6f5ee] p-3 text-sm"><p className="text-xs font-bold text-[#214c3a]">Phản hồi từ Mevi</p><p className="mt-1 whitespace-pre-line leading-6 text-[#3d4a42]">{review.reply}</p></div>}
        {product && <Link href={`/product/${product.id}`} className="mt-3 flex w-fit items-center gap-2.5 rounded-xl bg-[#f6f5ee] p-2 pr-4 hover:bg-[#eef1e9]"><img src={product.imageUrls?.[0] || imageFallback} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="text-xs font-semibold text-[#214c3a]">{product.name}</span></Link>}
        {actions ?? <p className="mt-3 text-xs text-muted-foreground">{review.helpful} người thấy hữu ích</p>}
      </div>
    </div>
  </article>;
}
