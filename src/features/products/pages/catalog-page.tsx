import { useProducts } from '@/features/products/api/products.queries';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search, Store, X } from 'lucide-react';
import { shopRef } from '@/app/providers/agency-brand-provider';
import { categoryTiles } from '@/features/home/data';
import { ProductCard } from '@/features/products/components/product-card';
import { AppSelect } from '@/shared/ui/app-select';
import { Loading, ErrorState, Empty } from '@/shared/ui/feedback';
import { PageFrame } from '@/shared/ui/layout';

export const sortOptions = [
  { value: 'featured', label: 'Nổi bật' }, { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' }, { value: 'price-desc', label: 'Giá cao đến thấp' },
] as const;

export type SortKey = typeof sortOptions[number]['value'];

export function CatalogPage() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [sort, setSort] = useState<SortKey>('featured');
  useEffect(() => {
    const next = new URLSearchParams(window.location.search);
    if (category) next.set('category', category); else next.delete('category');
    const qs = next.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [category]);
  const queryParams = useMemo(() => ({ q: search || undefined, category: category || undefined, sort }), [search, category, sort]);
  const { data, isLoading, isError, refetch } = useProducts(queryParams);
  const active = categoryTiles.find(c => c.name === category);
  const ref = shopRef();
  return <PageFrame><main className="shell py-6 md:py-10">
    <section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white">{active ? <img key={active.name} src={active.image.replace('w=300', 'w=1400')} alt="" className="rise absolute inset-0 h-full w-full object-cover" /> : <img src="https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="" className="absolute inset-0 h-full w-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-r from-[#214c3a] via-[#214c3a]/85 to-[#214c3a]/20" /><div className="relative px-7 py-9 md:px-12 md:py-12"><nav className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><Link href="/" className="hover:text-white">Trang chủ</Link><span>/</span><button onClick={() => setCategory('')} className="hover:text-white">Cửa hàng</button>{active && <><span>/</span><span className="text-white">{active.name}</span></>}</nav><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{active?.name || 'Nông sản chọn lọc'}</h1><p className="mt-2 max-w-md text-sm leading-6 text-white/85">{active?.desc || 'Tìm sản phẩm phù hợp cho bữa ăn và nhu cầu kinh doanh — rõ nguồn gốc, giao tận nhà.'}</p>{!isLoading && data && <span className="mt-5 inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur" data-testid="text-product-count">{data.length} sản phẩm</span>}{ref && <span className="ml-2 mt-5 inline-flex rounded-full bg-[#e0a57c] px-3.5 py-1.5 text-xs font-bold text-[#214c3a]" data-testid="text-agency-ref">Gian hàng đối tác · {ref}</span>}</div></section>
    <div className="-mx-1 mt-6 flex gap-2.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"><button onClick={() => setCategory('')} className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-bold transition ${!category ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e7e4d9] bg-white text-[#52645a] hover:border-[#285e45]'}`} data-testid="chip-category-all"><span className={`grid h-8 w-8 place-items-center rounded-full ${!category ? 'bg-white/20' : 'bg-[#eef1e9] text-[#285e45]'}`}><Store size={15} /></span>Tất cả</button>{categoryTiles.map(c => <button key={c.name} onClick={() => setCategory(c.name)} className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-bold transition ${category === c.name ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e7e4d9] bg-white text-[#52645a] hover:border-[#285e45]'}`} data-testid={`chip-category-${c.name}`}><img src={c.image} alt="" className="h-8 w-8 rounded-full object-cover" />{c.name}</button>)}</div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder={active ? `Tìm trong ${active.name.toLowerCase()}...` : 'Tìm theo tên, vùng trồng...'} value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-products" />{search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718077]" aria-label="Xóa tìm kiếm"><X size={16} /></button>}</label><div className="flex items-center gap-2"><span className="whitespace-nowrap text-sm text-muted-foreground">Sắp xếp</span><AppSelect<SortKey> className="w-[190px]" value={sort} onChange={setSort} options={[...sortOptions]} testId="select-sort" /></div></div>
    <div className="mt-6">{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : data?.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">{data.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Chưa tìm thấy sản phẩm" detail="Thử điều chỉnh từ khóa hoặc chọn danh mục khác." action={<button className="btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>Xem tất cả sản phẩm</button>} />}</div>
  </main></PageFrame>;
}
