import { useState } from 'react';
import { Pencil, ThumbsUp } from 'lucide-react';
import { authStorage } from '@/features/auth/api/auth.storage';
import { login, useAuthStore } from '@/features/auth/model/auth.store';
import { useMyProductReviews, useProductReviews, useToggleHelpful, type ShopReview } from '@/features/reviews/api';
import { ApiReviewForm } from '@/features/reviews/api-review-form';
import type { Review } from '@/features/reviews/model/reviews';
import { ReviewItem } from '@/features/reviews/review-item';
import { RatingSummaryCard } from '@/features/reviews/reviews-block';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/shared/types';
import { ErrorState, Loading } from '@/shared/ui/feedback';

export function toReviewView(r: ShopReview, productId: number, mine = false): Review {
  return {
    id: String(r.id),
    productId,
    author: r.customerName?.trim() || 'Khách hàng',
    authorMissing: !r.customerName?.trim(),
    rating: r.rating,
    date: r.createdAt ?? '',
    content: r.content ?? '',
    tags: r.tags ?? [],
    helpful: r.helpfulCount ?? 0,
    images: r.media?.map(m => m.url),
    thumbnails: r.media?.map(m => m.thumbnailUrl ?? m.url),
    verified: r.verifiedPurchase,
    hidden: r.hidden,
    reply: r.reply?.content,
    mine,
  };
}

/** Review section of an API product: summary from the product, list / form / helpful from the review APIs. */
export function ProductReviews({ product }: { product: Product }) {
  const user = useAuthStore(s => s.user);
  // Demo sessions have no token and cannot call customer APIs: treat them as guests.
  const hasSession = !!user && !!authStorage.getToken();
  const [star, setStar] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const list = useProductReviews(product.id, star || undefined);
  const me = useMyProductReviews(product.id, hasSession);
  const helpful = useToggleHelpful(product.id);

  const total = product.ratingCount ?? 0;
  const counts = [5, 4, 3, 2, 1].map(s => ({ star: s, count: product.ratingDistribution?.find(b => b.stars === s)?.count ?? 0 }));
  const mine = me.data?.reviews ?? [];
  const mineIds = new Set(mine.map(r => r.id));
  const helpfulIds = new Set(me.data?.helpfulReviewIds ?? []);
  const reviews = (list.data?.pages.flatMap(p => p.content) ?? []).filter(r => !mineIds.has(r.id));

  const toggleHelpful = (r: ShopReview) => {
    if (!hasSession) return login();
    helpful.mutate({ reviewId: r.id, helpful: !helpfulIds.has(r.id) }, {
      onError: e => toast({ title: 'Không thể cập nhật', description: e.message }),
    });
  };

  const helpfulAction = (r: ShopReview) => {
    const count = r.helpfulCount ?? 0;
    const on = helpfulIds.has(r.id);
    return <button type="button" onClick={() => toggleHelpful(r)} disabled={helpful.isPending} aria-pressed={on} className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${on ? 'border-[#285e45] bg-[#eef1e9] text-[#285e45]' : 'border-[#e3e0d5] text-[#52645a] hover:border-[#285e45]'}`} data-testid={`button-helpful-${r.id}`}><ThumbsUp size={13} fill={on ? 'currentColor' : 'none'} /> Hữu ích ({count})</button>;
  };

  return <>
    {!hasSession && <WriteCta title="Bạn đã dùng sản phẩm này?" detail="Đăng nhập để chia sẻ cảm nhận với người mua khác." label="Đăng nhập để đánh giá" onClick={login} />}
    {me.data?.canReview && (formOpen
      ? <ApiReviewForm key={mine.length} product={product} onDone={() => setFormOpen(false)} />
      : <WriteCta title="Bạn đã dùng sản phẩm này?" detail="Chia sẻ cảm nhận để giúp người mua khác lựa chọn tốt hơn." label="Viết đánh giá" onClick={() => setFormOpen(true)} />)}

    <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]">
      <RatingSummaryCard avg={product.ratingAverage ?? 0} total={total} counts={counts} star={star} onStar={setStar} />
      <div className="surface px-5 md:px-6">
        {mine.map(r => <ReviewItem key={r.id} review={toReviewView(r, product.id, true)} />)}
        {list.isLoading ? <Loading label="Đang tải đánh giá" />
          : list.isError ? <ErrorState retry={() => list.refetch()} />
          : reviews.map(r => <ReviewItem key={r.id} review={toReviewView(r, product.id)} actions={helpfulAction(r)} />)}
        {list.isSuccess && !reviews.length && !mine.length && <p className="py-10 text-center text-sm text-muted-foreground">{star ? `Chưa có đánh giá ${star} sao.` : 'Chưa có đánh giá nào cho sản phẩm này.'}</p>}
        {list.hasNextPage && <div className="py-5"><button className="btn-outline w-full" disabled={list.isFetchingNextPage} onClick={() => list.fetchNextPage()} data-testid="button-more-reviews">{list.isFetchingNextPage ? 'Đang tải...' : 'Xem thêm đánh giá'}</button></div>}
      </div>
    </div>
  </>;
}

function WriteCta({ title, detail, label, onClick }: { title: string; detail: string; label: string; onClick: () => void }) {
  return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-[#c9cbbd] bg-[#fbfaf5] p-5 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="font-bold text-[#214c3a]">{title}</p><p className="mt-0.5 text-sm text-muted-foreground">{detail}</p></div>
    <button className="btn-primary shrink-0" onClick={onClick} data-testid="button-write-review"><Pencil size={16} /> {label}</button>
  </div>;
}
