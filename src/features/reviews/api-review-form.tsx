import { useState, type FormEvent } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { reviewTagOptions } from '@/features/reviews/model/reviews';
import { ratingWords } from '@/features/reviews/review-form';
import { reviewsApi, useCreateReview, type ShopReviewMedia } from '@/features/reviews/api';
import { BackendError } from '@/shared/api/api-client';
import type { Product } from '@/shared/types';

const MAX_PHOTOS = 6;
const MAX_CONTENT = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Sends to the real API. Only rendered when `/reviews/me` says `canReview`. */
export function ApiReviewForm({ product, onDone }: { product: Product; onDone: () => void }) {
  const create = useCreateReview(product.id);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<ShopReviewMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const shown = hover || rating;

  const addPhotos = async (files: FileList | null) => {
    const all = Array.from(files ?? []);
    const valid = all.filter(f => f.type.startsWith('image/') && f.size <= MAX_FILE_SIZE);
    const picked = valid.slice(0, MAX_PHOTOS - media.length);
    if (picked.length < all.length) setError(`Một số ảnh bị bỏ qua: tối đa ${MAX_PHOTOS} ảnh, mỗi ảnh không quá 5MB.`);
    else setError('');
    if (!picked.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(picked.map(reviewsApi.uploadPhoto));
      setMedia(old => [...old, ...uploaded].slice(0, MAX_PHOTOS));
    } catch {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    create.mutate(
      { rating, content: content.trim() || undefined, tags: tags.length ? tags : undefined, media: media.length ? media : undefined },
      {
        onSuccess: onDone,
        onError: err => setError(err instanceof BackendError && err.status === 409
          ? 'Bạn không thể gửi thêm đánh giá cho sản phẩm này.'
          : err.message || 'Không thể gửi đánh giá.'),
      },
    );
  };

  return <form onSubmit={submit} className="surface mt-5 p-5 md:p-6" data-testid="form-review">
    <p className="text-xs text-muted-foreground">Đánh giá sản phẩm</p>
    <p className="font-bold text-[#214c3a]">{product.name}</p>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="flex" onMouseLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5 text-[#d4a24c] transition hover:scale-110" aria-label={`${n} sao`} data-testid={`button-rate-${n}`}><Star size={30} fill={n <= shown ? 'currentColor' : 'none'} strokeWidth={1.6} /></button>)}</div>
      <span className="text-sm font-bold text-[#bd6e46]">{ratingWords[shown]}</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{reviewTagOptions.map(t => { const on = tags.includes(t); return <button type="button" key={t} aria-pressed={on} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e3e0d5] bg-white text-[#52645a] hover:border-[#285e45]'}`}>{t}</button>; })}</div>
    <textarea className="field mt-3 min-h-28 resize-y" placeholder="Sản phẩm có tươi ngon, đúng mô tả không? Giao hàng thế nào?" value={content} onChange={e => setContent(e.target.value)} maxLength={MAX_CONTENT} data-testid="input-review-content" />
    <div className="mt-1 text-right text-[11px] text-muted-foreground">{content.length}/{MAX_CONTENT}</div>
    <div className="mt-2 flex flex-wrap gap-2">
      {media.map((m, n) => <div key={m.url} className="relative"><img src={m.thumbnailUrl || m.url} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => setMedia(media.filter((_, k) => k !== n))} className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#214c3a] text-white" aria-label="Xóa ảnh"><X size={13} /></button></div>)}
      {media.length < MAX_PHOTOS && <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-[#c9cbbd] text-[#718077] hover:border-[#285e45] hover:text-[#285e45]"><span className="grid justify-items-center gap-1 text-[10px] font-semibold"><Upload size={18} />{uploading ? 'Đang tải' : 'Thêm ảnh'}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={uploading} onChange={e => { void addPhotos(e.target.files); e.target.value = ''; }} data-testid="input-review-images" /></label>}
    </div>
    {error && <p className="mt-3 text-sm font-semibold text-[#a7473d]" role="alert">{error}</p>}
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" className="btn-outline" onClick={onDone}>Hủy</button>
      <button className="btn-primary" disabled={uploading || create.isPending} data-testid="button-submit-review">{create.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
    </div>
  </form>;
}
