import { Link } from 'wouter';
import { BadgeCheck } from 'lucide-react';
import type { PublicStorefront } from '@/features/shop/api/shop.types';
import { storefrontPath } from '@/features/shop/model/storefront-url';
import { imageFallback } from '@/shared/config';
import { compactNumber } from '@/shared/lib/format';

const defaultCover = 'https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?auto=compress&cs=tinysrgb&w=800';

/** Card of a real storefront from the public API. Follower count is hidden at 0, like the storefront page. */
export function StorefrontCard({ storefront: s, className = '' }: { storefront: PublicStorefront; className?: string }) {
  return (
    <Link href={storefrontPath(s)} className={`group overflow-hidden rounded-3xl border border-[#e7e4d9] bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${className}`} data-testid={`card-storefront-${s.id}`}>
      <div className="relative h-28 overflow-hidden">
        <img src={s.coverImageUrl || defaultCover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="relative px-5 pb-5">
        <img src={s.logoUrl || imageFallback} alt="" className="relative -mt-8 h-16 w-16 rounded-full border-4 border-white object-cover shadow" />
        <p className="mt-2 flex items-center gap-1.5 font-extrabold text-[#214c3a]"><span className="truncate">{s.name}</span>{s.verified && <BadgeCheck size={16} className="shrink-0 text-[#285e45]" />}</p>
        <p className="truncate text-xs text-muted-foreground">{s.slogan || s.province || 'Toàn quốc'}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#ece8de] pt-3 text-center">
          <div><p className="font-bold text-[#214c3a]">{s.productCount}</p><p className="text-[10px] text-muted-foreground">Sản phẩm</p></div>
          {s.followerCount > 0
            ? <div><p className="font-bold text-[#214c3a]">{compactNumber(s.followerCount)}</p><p className="text-[10px] text-muted-foreground">Theo dõi</p></div>
            : <div><p className="font-bold text-[#214c3a]">{s.joinedYear}</p><p className="text-[10px] text-muted-foreground">Tham gia</p></div>}
        </div>
      </div>
    </Link>
  );
}
