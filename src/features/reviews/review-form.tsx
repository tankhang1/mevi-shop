import { useState, type FormEvent } from 'react';
import { useUser } from '@/lib/mock-auth';
import type { Product } from '@/lib/api';
import { Star, X, Upload, Pencil } from 'lucide-react';
import { addUserReview, galleryOf, reviewTagOptions } from '@/lib/shops';
import { imageFallback } from '@/shared/config';
import { readAsDataUrl } from '@/shared/lib/file';

export const ratingWords = ['', 'Rất tệ', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];

export function ReviewForm({ product, onSubmitted }: { product: Product; onSubmitted: () => void }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const author = user?.fullName || name.trim();
  const addImages = async (files: FileList | null) => {
    const picked = Array.from(files || []).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024).slice(0, 3 - images.length);
    const urls = await Promise.all(picked.map(readAsDataUrl));
    setImages(old => [...old, ...urls].slice(0, 3));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!author) return setError('Vui lòng nhập tên của bạn.');
    if (content.trim().length < 10) return setError('Nội dung đánh giá cần ít nhất 10 ký tự.');
    addUserReview({ productId: product.id, author, rating, content: content.trim(), tags, images });
    setContent(''); setTags([]); setImages([]); setRating(5); setError(''); setOpen(false); setDone(true);
    onSubmitted();
  };
  if (!open) return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-[#c9cbbd] bg-[#fbfaf5] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-[#214c3a]">{done ? 'Cảm ơn bạn đã đánh giá!' : 'Bạn đã dùng sản phẩm này?'}</p><p className="mt-0.5 text-sm text-muted-foreground">{done ? 'Đánh giá của bạn đã được đăng bên dưới.' : 'Chia sẻ cảm nhận để giúp người mua khác lựa chọn tốt hơn.'}</p></div><button className="btn-primary shrink-0" onClick={() => { setOpen(true); setDone(false); }} data-testid="button-write-review"><Pencil size={16} /> Viết đánh giá</button></div>;
  const shown = hover || rating;
  return <form onSubmit={submit} className="surface mt-5 p-5 md:p-6" data-testid="form-review"><div className="flex items-center gap-3"><img src={galleryOf(product)[0] || imageFallback} alt="" className="h-12 w-12 rounded-xl object-cover" /><div><p className="text-xs text-muted-foreground">Đánh giá sản phẩm</p><p className="font-bold text-[#214c3a]">{product.name}</p></div></div><div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex" onMouseLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5 text-[#d4a24c] transition hover:scale-110" aria-label={`${n} sao`} data-testid={`button-rate-${n}`}><Star size={30} fill={n <= shown ? 'currentColor' : 'none'} strokeWidth={1.6} /></button>)}</div><span className="text-sm font-bold text-[#bd6e46]">{ratingWords[shown]}</span></div><div className="mt-4 flex flex-wrap gap-2">{reviewTagOptions.map(t => { const on = tags.includes(t); return <button type="button" key={t} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e3e0d5] bg-white text-[#52645a] hover:border-[#285e45]'}`}>{t}</button>; })}</div>{!user && <input className="field mt-4" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} data-testid="input-review-name" />}<textarea className="field mt-3 min-h-28 resize-y" placeholder="Sản phẩm có tươi ngon, đúng mô tả không? Giao hàng thế nào?" value={content} onChange={e => setContent(e.target.value)} maxLength={500} data-testid="input-review-content" /><div className="mt-1 text-right text-[11px] text-muted-foreground">{content.length}/500</div><div className="mt-2 flex flex-wrap gap-2">{images.map((src, n) => <div key={n} className="relative"><img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => setImages(images.filter((_, k) => k !== n))} className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#214c3a] text-white" aria-label="Xóa ảnh"><X size={13} /></button></div>)}{images.length < 3 && <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-[#c9cbbd] text-[#718077] hover:border-[#285e45] hover:text-[#285e45]"><span className="grid justify-items-center gap-1 text-[10px] font-semibold"><Upload size={18} />Thêm ảnh</span><input type="file" accept="image/*" multiple className="hidden" onChange={e => { addImages(e.target.files); e.target.value = ''; }} data-testid="input-review-images" /></label>}</div>{error && <p className="mt-3 text-sm font-semibold text-[#a7473d]">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => { setOpen(false); setError(''); }}>Hủy</button><button className="btn-primary" data-testid="button-submit-review">Gửi đánh giá</button></div></form>;
}
