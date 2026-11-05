import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Phone, Store } from 'lucide-react';
import { usePublicAgencies } from '@/features/agency/api/agency.queries';
import { useStorefronts } from '@/features/shop/api/shop.queries';
import type { StorefrontSort } from '@/features/shop/api/shop.types';
import { agencyStoreHref, defaultAgencyCover } from '@/shared/types';
import { StorefrontCard } from '@/features/shops/components/storefront-card';
import { AppSelect } from '@/shared/ui/app-select';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { PageFrame } from '@/shared/ui/layout';

const sortOptions: { value: StorefrontSort; label: string }[] = [
  { value: 'REVENUE', label: 'Doanh thu cao nhất' },
  { value: 'NEWEST', label: 'Mới nhất' },
];

export function ShopsPage() {
  const [sort, setSort] = useState<StorefrontSort>('REVENUE');
  const [page, setPage] = useState(0);
  const changeSort = (next: StorefrontSort) => { setSort(next); setPage(0); };
  const { data, isLoading, isError, isPlaceholderData, refetch } = useStorefronts({ sort, page, size: 12 });
  const { data: agencies = [] } = usePublicAgencies();
  return <PageFrame><main className="shell py-6 md:py-10"><section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white"><img src="https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#214c3a] via-[#214c3a]/85 to-[#214c3a]/25" /><div className="relative px-7 py-10 md:px-12 md:py-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e0a57c]">Gian hàng trên Mevi</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Mua trực tiếp từ nhà vườn</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/85">Mỗi gian hàng là một nông trại, hợp tác xã hay xưởng chế biến đã được Mevi xác minh nguồn gốc.</p></div></section><div className="mt-6 flex items-center justify-end gap-2"><span className="whitespace-nowrap text-sm text-muted-foreground">Sắp xếp</span><AppSelect<StorefrontSort> className="w-[190px]" value={sort} onChange={changeSort} options={sortOptions} testId="select-storefront-sort" /></div><div className="mt-5">{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : data?.content.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.content.map(s => <StorefrontCard key={s.id} storefront={s} />)}</div> : <Empty title="Chưa có gian hàng" detail="Các gian hàng đang được cập nhật." />}</div>{data && data.totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Phân trang gian hàng"><button type="button" className="btn-outline min-h-9 px-3 py-1.5 text-sm" disabled={data.first || isPlaceholderData} onClick={() => setPage(data.page - 1)} data-testid="button-storefronts-prev"><ChevronLeft size={16} /> Trước</button><span className="text-sm font-semibold text-muted-foreground" data-testid="text-storefronts-page">Trang {data.page + 1} / {data.totalPages}</span><button type="button" className="btn-outline min-h-9 px-3 py-1.5 text-sm" disabled={data.last || isPlaceholderData} onClick={() => setPage(data.page + 1)} data-testid="button-storefronts-next">Sau <ChevronRight size={16} /></button></nav>}{agencies.length > 0 && <section className="mt-12"><p className="eyebrow">Mua gần bạn</p><h2 className="mt-2 text-2xl font-extrabold text-[#214c3a]">Gian hàng Đại lý/CTV</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{agencies.map(a => <Link key={a.slug} href={agencyStoreHref(a.slug)} className="surface group overflow-hidden transition hover:-translate-y-0.5" data-testid={`card-agency-store-${a.slug}`}><span className="block h-28 overflow-hidden"><img src={a.coverUrl || defaultAgencyCover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></span><span className="flex items-center gap-3 p-4"><span className="-mt-10 grid h-14 w-14 border-4 border-white shrink-0 place-items-center overflow-hidden rounded-xl text-white" style={{ backgroundColor: a.primaryColor }}>{a.logoUrl ? <img src={a.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store size={21} />}</span><span className="min-w-0 flex-1"><span className="block font-bold">{a.displayName}</span>{a.contactPhone && <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Phone size={12} />{a.contactPhone}</span>}</span><ChevronRight size={18} className="text-[#285e45]" /></span></Link>)}</div></section>}</main></PageFrame>;
}
