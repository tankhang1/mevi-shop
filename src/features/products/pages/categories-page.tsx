import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { categoryTiles } from '@/features/home/data';
import { useProducts } from '@/features/products/api/products.queries';
import { PageFrame } from '@/shared/ui/layout';

/** All product groups; tapping one opens the catalog filtered to that group. */
export function CategoriesPage() {
  const { data: products = [] } = useProducts();
  const countOf = (name: string) => products.filter(p => p.category === name).length;
  return <PageFrame><main className="shell py-8 md:py-12">
    <p className="eyebrow">Mua theo danh mục</p>
    <h1 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Danh mục sản phẩm</h1>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categoryTiles.map(c =>
      <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group flex items-center gap-4 rounded-3xl p-3 pr-4 transition hover:-translate-y-0.5" style={{ background: c.bg }} data-testid={`link-categories-${c.name}`}>
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-sm"><img src={c.image} alt="" className="h-full w-full object-cover transition group-hover:scale-110" /></span>
        <span className="min-w-0 flex-1"><span className="block font-extrabold text-[#214c3a]">{c.name}</span><span className="mt-0.5 line-clamp-2 block text-xs text-[#52645a]">{c.desc}</span>{products.length > 0 && <span className="mt-1 block text-xs font-bold text-[#285e45]">{countOf(c.name)} sản phẩm</span>}</span>
        <ChevronRight size={18} className="shrink-0 text-[#285e45]" />
      </Link>)}</div>
  </main></PageFrame>;
}
