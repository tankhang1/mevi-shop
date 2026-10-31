import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBanners } from '@/features/banners/api/banners.queries';
import { bannerHref } from '@/shared/types';

export function HeroCarousel() {
  const { data: slides = [], isLoading } = useBanners();
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => { if (n < 2) return; const t = setInterval(() => setI(x => (x + 1) % n), 5500); return () => clearInterval(t); }, [n]);
  if (!isLoading && !n) return null;
  const cur = n ? i % n : 0;
  return <section><div className="relative h-[460px] overflow-hidden bg-[#214c3a] md:h-[540px]">{slides.map((sl, k) => <div key={sl.id} className={`absolute inset-0 transition-opacity duration-700 ${k === cur ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={k !== cur}><img src={sl.imageUrl} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${sl.fromColor}f2 0%, ${sl.fromColor}cc 38%, ${sl.toColor}33 75%, transparent 100%)` }} /><div className="shell absolute inset-0 flex flex-col justify-center text-white md:px-14">{sl.tag && <span className="w-fit rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.14em] backdrop-blur">{sl.tag}</span>}<h1 className="mt-4 max-w-xl whitespace-pre-line text-[38px] font-extrabold leading-[1.05] tracking-tight md:text-[58px]">{sl.title}</h1>{sl.description && <p className="mt-4 max-w-md text-[15px] leading-7 text-white/90">{sl.description}</p>}<Link href={bannerHref(sl)} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#214c3a] shadow-lg transition hover:scale-105" data-testid={`link-banner-${sl.id}`}>{sl.ctaLabel} <ArrowRight size={17} /></Link></div></div>)}{n > 1 && <><button className="absolute left-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid" onClick={() => setI((cur + n - 1) % n)} aria-label="Slide trước"><ArrowLeft size={18} /></button><button className="absolute right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid" onClick={() => setI((cur + 1) % n)} aria-label="Slide sau"><ArrowRight size={18} /></button><div className="shell absolute inset-x-0 bottom-6 flex gap-2 md:px-14">{slides.map((sl, k) => <button key={sl.id} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === cur ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Slide ${k + 1}`} />)}</div></>}</div></section>;
}
