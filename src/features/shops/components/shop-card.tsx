import { Link } from 'wouter';
import { BadgeCheck, Star, Store } from 'lucide-react';
import { ratingSummary, reviewsOf, shops, type Shop } from '@/lib/shops';
import { useAllProducts } from '@/features/products/product-utils';
import { compactNumber } from '@/shared/lib/format';

export function useShopStats(shop: Shop) {
  const { data } = useAllProducts();
  const ids = shop.productIds.filter(id => data?.some(p => p.id === id));
  const reviews = ids.flatMap(reviewsOf).sort((a, b) => b.date.localeCompare(a.date));
  return { productCount: ids.length, reviews, rating: ratingSummary(reviews).avg };
}

export function ShopCard({ shop, compact = false }: { shop: Shop; compact?: boolean }) {
  const { rating, productCount } = useShopStats(shop);
  if (compact) return <div className="flex items-center gap-3.5 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-4" data-testid={`card-shop-${shop.slug}`}><img src={shop.avatar} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow" /><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 font-bold text-[#214c3a]"><span className="truncate">{shop.name}</span>{shop.verified && <BadgeCheck size={16} className="shrink-0 text-[#285e45]" />}</p><p className="mt-0.5 text-xs text-muted-foreground">{shop.location} · <Star size={11} fill="currentColor" className="inline text-[#d4a24c]" /> {rating.toFixed(1)} · {productCount} sản phẩm</p></div><Link href={`/shops/${shop.slug}`} className="btn-outline min-h-9 shrink-0 px-4 py-1.5 text-xs" data-testid={`link-shop-${shop.slug}`}><Store size={14} /> Xem shop</Link></div>;
  return <Link href={`/shops/${shop.slug}`} className="group overflow-hidden rounded-3xl border border-[#e7e4d9] bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]" data-testid={`card-shop-${shop.slug}`}><div className="relative h-28 overflow-hidden"><img src={shop.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></div><div className="relative px-5 pb-5"><img src={shop.avatar} alt="" className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover shadow" /><p className="mt-2 flex items-center gap-1.5 font-extrabold text-[#214c3a]">{shop.name}{shop.verified && <BadgeCheck size={16} className="text-[#285e45]" />}</p><p className="text-xs text-muted-foreground">{shop.tagline}</p><div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#ece8de] pt-3 text-center"><div><p className="flex items-center justify-center gap-0.5 font-bold text-[#214c3a]"><Star size={12} fill="currentColor" className="text-[#d4a24c]" />{rating.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">Đánh giá</p></div><div><p className="font-bold text-[#214c3a]">{productCount}</p><p className="text-[10px] text-muted-foreground">Sản phẩm</p></div><div><p className="font-bold text-[#214c3a]">{compactNumber(shop.followers)}</p><p className="text-[10px] text-muted-foreground">Theo dõi</p></div></div></div></Link>;
}
