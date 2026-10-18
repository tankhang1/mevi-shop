import { useEffect, useState } from 'react';
import type { Product } from '@/lib/api';
import { Zap } from 'lucide-react';
import { ProductCard } from '@/features/products/components/product-card';

export function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => { const tick = () => { const end = new Date(); end.setHours(24, 0, 0, 0); setLeft(Math.max(0, end.getTime() - Date.now())); }; tick(); const t = setInterval(tick, 1000); return () => clearInterval(t); }, []);
  const s = Math.floor(left / 1000);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0'));
}

export function FlashSale({ products }: { products: Product[] }) {
  const [h, m, sec] = useCountdown();
  if (!products.length) return null;
  return <section className="shell mt-14"><div className="rounded-[28px] bg-gradient-to-br from-[#214c3a] via-[#285e45] to-[#5f8f6e] p-5 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><Zap fill="currentColor" /></span><div><h2 className="text-2xl font-extrabold">Flash Sale hôm nay</h2><p className="text-xs text-white/85">Giá sốc, số lượng có hạn</p></div></div><div className="flex items-center gap-1.5 font-mono text-lg font-bold" aria-label="Thời gian còn lại"><span className="text-xs font-sans font-semibold text-white/85">Kết thúc sau</span>{[h, m, sec].map((v, n) => <span key={n} className="rounded-lg bg-[#214c3a] px-2 py-1">{v}</span>)}</div></div><div className="flex snap-x gap-4 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">{products.slice(0, 5).map(p => <div key={p.id} className="w-[170px] shrink-0 snap-start lg:w-auto"><ProductCard product={p} compact /></div>)}</div></div></section>;
}
