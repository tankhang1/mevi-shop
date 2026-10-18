import { useProducts } from '@/features/products/api/products.queries';
import { shops, shopBySlug } from '@/features/shops/model/shops';
import { sortOptions } from '@/features/products/pages/catalog-page';
import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { BadgeCheck, Check, Plus, Star } from 'lucide-react';
import { ProductCard } from '@/features/products/components/product-card';
import { SortKey } from '@/features/products/pages/catalog-page';
import { ReviewsBlock } from '@/features/reviews/reviews-block';
import { useShopStats } from '@/features/shops/components/shop-card';
import { imageFallback } from '@/shared/config';
import { compactNumber } from '@/shared/lib/format';
import { AppSelect } from '@/shared/ui/app-select';
import { Loading, ErrorState, Empty } from '@/shared/ui/feedback';
import { Detail } from '@/shared/ui/field';
import { PageFrame } from '@/shared/ui/layout';

export function ShopPage() {
  const [, params] = useRoute('/shops/:slug');
  const shop = shopBySlug(params?.slug || '');
  const [tab, setTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [following, setFollowing] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');
  const { data, isLoading, isError, refetch } = useProducts({ sort });
  const stats = useShopStats(shop ?? shops[0]);
  if (!shop) return <PageFrame><main className="shell py-12"><Empty title="Không tìm thấy gian hàng" detail="Gian hàng có thể đã ngừng hoạt động." action={<Link href="/shops" className="btn-outline">Xem các gian hàng</Link>} /></main></PageFrame>;
  const products = (data || []).filter(p => shop.productIds.includes(p.id));
  const { reviews, rating } = stats;
  const tabs = [{ key: 'products', label: `Sản phẩm (${products.length})` }, { key: 'reviews', label: `Đánh giá (${reviews.length})` }, { key: 'about', label: 'Giới thiệu' }] as const;
  return <PageFrame><main className="shell py-6 md:py-10">
    <section className="overflow-hidden rounded-[28px] border border-[#e7e4d9] bg-white"><div className="relative h-44 md:h-60"><img src={shop.cover} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35" /><nav className="absolute left-6 top-5 flex items-center gap-1.5 text-xs font-semibold text-white/85 md:left-10"><Link href="/" className="hover:text-white">Trang chủ</Link><span>/</span><Link href="/shops" className="hover:text-white">Gian hàng</Link><span>/</span><span className="text-white">{shop.name}</span></nav></div><div className="flex flex-col gap-5 px-6 pb-7 md:flex-row md:items-end md:justify-between md:px-10"><div className="flex items-end gap-5"><img src={shop.avatar} alt="" className="relative z-10 -mt-12 h-24 w-24 shrink-0 rounded-3xl border-4 border-white object-cover shadow-lg md:-mt-14 md:h-28 md:w-28" /><div className="pb-1 pt-4"><h1 className="flex items-center gap-2 text-2xl font-extrabold leading-tight text-[#214c3a] md:text-3xl" data-testid="text-shop-name">{shop.name}{shop.verified && <BadgeCheck className="text-[#285e45]" />}</h1><p className="mt-1.5 text-sm text-muted-foreground">{shop.tagline} · {shop.location}</p></div></div><div className="flex gap-2"><button className={following ? 'btn-outline' : 'btn-primary'} onClick={() => setFollowing(!following)} data-testid="button-follow-shop">{following ? <><Check size={16} /> Đang theo dõi</> : <><Plus size={16} /> Theo dõi</>}</button></div></div><div className="grid grid-cols-2 border-t border-[#ece8de] md:grid-cols-4">{[{ label: 'Đánh giá', value: <span className="inline-flex items-center gap-1"><Star size={15} fill="currentColor" className="text-[#d4a24c]" />{rating.toFixed(1)}</span> }, { label: 'Sản phẩm', value: products.length }, { label: 'Người theo dõi', value: compactNumber(shop.followers + (following ? 1 : 0)) }, { label: 'Phản hồi chat', value: `${shop.responseRate}%` }].map((st, n) => <div key={st.label} className={`px-6 py-4 md:px-10 ${n % 2 ? 'border-l' : ''} ${n === 2 ? 'md:border-l' : ''} border-[#ece8de] ${n > 1 ? 'border-t md:border-t-0' : ''}`}><p className="text-lg font-extrabold text-[#214c3a]">{st.value}</p><p className="text-xs text-muted-foreground">{st.label}</p></div>)}</div></section>
    <div className="sticky top-[74px] z-30 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[#e6e2d7] bg-background/95 px-1 backdrop-blur [scrollbar-width:none]">{tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${tab === t.key ? 'border-[#285e45] text-[#285e45]' : 'border-transparent text-[#718077] hover:text-[#214c3a]'}`} data-testid={`tab-shop-${t.key}`}>{t.label}</button>)}</div>
    {tab === 'products' && <div className="mt-6"><div className="mb-5 flex items-center justify-end gap-2"><span className="text-sm text-muted-foreground">Sắp xếp</span><AppSelect<SortKey> className="w-[190px]" value={sort} onChange={setSort} options={[...sortOptions]} testId="select-shop-sort" /></div>{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : products.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Gian hàng chưa có sản phẩm" detail="Sản phẩm mới đang được cập nhật." />}</div>}
    {tab === 'reviews' && <ReviewsBlock reviews={reviews} products={data} />}
    {tab === 'about' && <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="surface p-6"><h2 className="text-lg font-extrabold text-[#214c3a]">Về {shop.name}</h2><p className="mt-3 text-sm leading-7 text-[#3d4a42]">{shop.description}</p><div className="mt-5 grid grid-cols-3 gap-2">{products.slice(0, 3).map(p => <img key={p.id} src={p.imageUrls?.[0] || imageFallback} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />)}</div></div><div className="surface h-fit p-6"><dl className="grid gap-4 text-sm"><Detail label="Địa chỉ" value={shop.location} /><Detail label="Tham gia Mevi" value={`Từ năm ${shop.joined}`} /><Detail label="Tỉ lệ phản hồi" value={`${shop.responseRate}% · thường trong vài giờ`} /><Detail label="Xác minh" value={shop.verified ? 'Đã xác minh nguồn gốc bởi Mevi' : 'Đang xác minh'} /></dl></div></div>}
  </main></PageFrame>;
}
