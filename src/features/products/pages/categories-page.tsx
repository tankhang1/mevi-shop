import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Search, X } from 'lucide-react';
import { useCategoryTiles } from '@/features/products/api/categories';
import { useProducts } from '@/features/products/api/products.queries';
import { Empty } from '@/shared/ui/feedback';
import { PageFrame } from '@/shared/ui/layout';

/** Lowercases and strips Vietnamese diacritics so "trai cay" matches "Trái cây". */
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

/** All product groups; tapping one opens the catalog filtered to that group. */
export function CategoriesPage() {
  const { tiles: categoryTiles } = useCategoryTiles();
  const { data: products = [] } = useProducts();
  const countOf = (name: string) => products.filter(p => p.category === name).length;
  const [search, setSearch] = useState('');
  const keyword = normalize(search);
  const visibleTiles = categoryTiles.filter(c => normalize(`${c.name} ${c.desc}`).includes(keyword));
  return <PageFrame><main className="shell py-8 md:py-12">
    <p className="eyebrow">Mua theo danh mục</p>
    <h1 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Danh mục sản phẩm</h1>
    <label className="relative mt-5 block"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder="Tìm danh mục..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-categories" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718077]" aria-label="Xóa tìm kiếm"><X size={16} /></button>}</label>
    {categoryTiles.length > 0 && !visibleTiles.length ? <div className="mt-6"><Empty title="Không tìm thấy danh mục" detail="Thử từ khóa khác hoặc tìm trực tiếp theo tên sản phẩm." action={<Link href={`/shop?q=${encodeURIComponent(search.trim())}`} className="btn-outline">Tìm sản phẩm "{search.trim()}"</Link>} /></div> : <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{visibleTiles.map(c =>
      <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group flex items-center gap-4 rounded-3xl p-3 pr-4 transition hover:-translate-y-0.5" style={{ background: c.bg }} data-testid={`link-categories-${c.name}`}>
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-sm"><img src={c.image} alt="" className="h-full w-full object-cover transition group-hover:scale-110" /></span>
        <span className="min-w-0 flex-1"><span className="block font-extrabold text-[#214c3a]">{c.name}</span><span className="mt-0.5 line-clamp-2 block text-xs text-[#52645a]">{c.desc}</span>{products.length > 0 && <span className="mt-1 block text-xs font-bold text-[#285e45]">{countOf(c.name)} sản phẩm</span>}</span>
        <ChevronRight size={18} className="shrink-0 text-[#285e45]" />
      </Link>)}</div>}
  </main></PageFrame>;
}
