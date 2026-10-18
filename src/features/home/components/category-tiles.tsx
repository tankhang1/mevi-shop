import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { categoryTiles } from '@/features/home/data';

export function CategoryTiles() {
  return <section className="shell mt-14"><div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Mua theo danh mục</p><h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Hôm nay ăn gì?</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex">Tất cả <ArrowRight size={16} /></Link></div><div className="grid grid-cols-4 gap-3 md:grid-cols-8">{categoryTiles.map(c => <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center gap-2 rounded-3xl p-3 text-center transition hover:-translate-y-1" style={{ background: c.bg }} data-testid={`link-category-${c.name}`}><span className="h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm md:h-20 md:w-20"><img src={c.image} alt="" className="h-full w-full object-cover transition group-hover:scale-110" /></span><span className="text-xs font-bold text-[#214c3a] md:text-sm">{c.name}</span></Link>)}</div></section>;
}
