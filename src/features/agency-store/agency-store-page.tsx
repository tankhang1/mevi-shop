import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { BadgeCheck, Phone, Search, Store } from 'lucide-react';
import { usePublicAgency } from '@/features/agency/api/agency.queries';
import { categoryTiles } from '@/features/home/data';
import { useProducts } from '@/features/products/api/products.queries';
import { ProductCard } from '@/features/products/components/product-card';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { defaultAgencyCover } from '@/shared/types';
import { PageFrame } from '@/shared/ui/layout';

/** Public storefront of an agency/CTV. Visiting it sets the referral so checkout credits the agency. */
export function AgencyStorePage() {
  const [, params] = useRoute('/dai-ly/:slug');
  const slug = params?.slug || '';
  const agency = usePublicAgency(slug);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const products = useProducts(useMemo(() => ({ q: search || undefined, category: category || undefined, sort: 'featured' as const }), [search, category]));

  const open = agency.data?.active;
  useEffect(() => { if (open) { try { localStorage.setItem('mevi-agency-ref', slug); } catch { /* storage unavailable */ } } }, [open, slug]);

  if (agency.isLoading) return <PageFrame><main className="shell py-8"><Loading /></main></PageFrame>;
  if (agency.isError || !agency.data || !open) return <PageFrame><main className="shell py-8">
    <Empty title={agency.data ? 'Gian hàng tạm ngừng hoạt động' : 'Không tìm thấy gian hàng'} detail="Bạn vẫn có thể mua sắm trực tiếp tại cửa hàng Mevi." action={<Link href="/shop" className="btn-primary">Đến cửa hàng</Link>} />
  </main></PageFrame>;

  const a = agency.data;
  const chip = (active: boolean) => `shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${active ? 'text-white' : 'border-[#e7e4d9] bg-white text-[#52645a]'}`;
  return <PageFrame><main className="shell py-6 md:py-10">
    <section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white" data-testid="agency-store-hero">
      <img src={a.coverUrl || defaultAgencyCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${a.primaryColor}f2 0%, ${a.primaryColor}d9 40%, ${a.primaryColor}40 80%, transparent 100%)` }} />
      <div className="relative px-6 py-8 md:px-12 md:py-14">
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><Link href="/" className="hover:text-white">Trang chủ</Link><span>/</span><Link href="/shops" className="hover:text-white">Gian hàng</Link><span>/</span><span className="text-white">{a.displayName}</span></nav>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white/30 bg-white" style={{ color: a.primaryColor }}>{a.logoUrl ? <img src={a.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store size={32} />}</span>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em]"><BadgeCheck size={13} /> Đại lý chính thức Mevi</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl" data-testid="text-agency-name">{a.displayName}</h1>
          <p className="mt-1 text-sm text-white/85">Sản phẩm chính hãng Mevi, đặt qua gian hàng để được đại lý tư vấn và giao hàng.</p>
        </div>
      </div>
      {a.contactPhone && <a href={`tel:${a.contactPhone}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold" style={{ color: a.primaryColor }} data-testid="link-agency-phone"><Phone size={15} /> {a.contactName ? `${a.contactName} · ` : ''}{a.contactPhone}</a>}
      </div>
    </section>

    <div className="mt-6 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={17} />
        <input className="field pl-10" placeholder="Tìm trong gian hàng..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-agency-store-search" /></label>
    </div>
    <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
      <button onClick={() => setCategory('')} className={chip(!category)} style={!category ? { background: a.primaryColor, borderColor: a.primaryColor } : undefined}>Tất cả</button>
      {categoryTiles.map(c => <button key={c.name} onClick={() => setCategory(c.name)} className={chip(category === c.name)} style={category === c.name ? { background: a.primaryColor, borderColor: a.primaryColor } : undefined} data-testid={`chip-agency-category-${c.name}`}>{c.name}</button>)}
    </div>

    <section className="mt-5">{products.isLoading ? <Loading /> : products.isError ? <ErrorState retry={() => products.refetch()} />
      : !products.data?.length ? <Empty title="Chưa có sản phẩm phù hợp" detail="Thử danh mục hoặc từ khoá khác." />
      : <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{products.data.map(p => <ProductCard key={p.id} product={p} />)}</div>}</section>
  </main></PageFrame>;
}
