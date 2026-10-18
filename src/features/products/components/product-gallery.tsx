import { galleryOf } from '@/features/products/model/gallery';
import type { Product } from '@/shared/types';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, X } from 'lucide-react';
import { imageFallback } from '@/shared/config';

export function Lightbox({ images, index, onIndex, onClose, alt }: { images: string[]; index: number; onIndex: (i: number) => void; onClose: () => void; alt: string }) {
  const go = (d: number) => onIndex((index + d + images.length) % images.length);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowLeft') go(-1); else if (e.key === 'ArrowRight') go(1); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  });
  return <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Xem ảnh" onClick={onClose} data-testid="lightbox"><div className="flex items-center justify-between px-5 py-4 text-white"><span className="text-sm font-semibold">{index + 1} / {images.length}</span><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Đóng" data-testid="button-lightbox-close"><X size={20} /></button></div><div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20"><img key={images[index]} src={images[index]} alt={alt} onClick={e => e.stopPropagation()} className="rise max-h-full max-w-full rounded-xl object-contain shadow-2xl" />{images.length > 1 && <><button onClick={e => { e.stopPropagation(); go(-1); }} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6" aria-label="Ảnh trước"><ArrowLeft size={22} /></button><button onClick={e => { e.stopPropagation(); go(1); }} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6" aria-label="Ảnh sau"><ArrowRight size={22} /></button></>}</div>{images.length > 1 && <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4" onClick={e => e.stopPropagation()}>{images.map((src, n) => <button key={src + n} onClick={() => onIndex(n)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${n === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-90'}`} aria-label={`Ảnh ${n + 1}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div>;
}

export function ProductGallery({ product }: { product: Product }) {
  const images = galleryOf(product);
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const go = (d: number) => setI(x => (x + d + images.length) % images.length);
  return <div>{zoom && <Lightbox images={images} index={i} onIndex={setI} onClose={() => setZoom(false)} alt={product.name} />}<div className="group relative overflow-hidden rounded-3xl bg-[#e9eee4]"><button onClick={() => setZoom(true)} className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#214c3a] opacity-0 shadow transition group-hover:opacity-100" aria-label="Phóng to ảnh"><Search size={13} /> Phóng to</button><img onClick={() => setZoom(true)} key={images[i]} src={images[i] || imageFallback} onError={e => { e.currentTarget.src = imageFallback; }} alt={product.name} className="rise aspect-[4/3.4] w-full cursor-zoom-in object-cover" data-testid={`img-product-${product.id}`} />{images.length > 1 && <><button onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#214c3a] opacity-0 shadow transition group-hover:opacity-100" aria-label="Ảnh trước"><ArrowLeft size={18} /></button><button onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#214c3a] opacity-0 shadow transition group-hover:opacity-100" aria-label="Ảnh sau"><ArrowRight size={18} /></button><span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">{i + 1} / {images.length}</span></>}</div>{images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2.5">{images.map((src, n) => <button key={src} onClick={() => setI(n)} className={`overflow-hidden rounded-2xl border-2 transition ${n === i ? 'border-[#285e45]' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Ảnh ${n + 1}`} data-testid={`thumb-product-${n}`}><img src={src} alt="" className="aspect-square w-full object-cover" /></button>)}</div>}</div>;
}
