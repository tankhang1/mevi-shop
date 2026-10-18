import { useState } from 'react';
import { Search } from 'lucide-react';
import { shops } from '@/lib/shops';
import { ShopCard } from '@/features/shops/components/shop-card';
import { Empty } from '@/shared/ui/feedback';
import { PageFrame } from '@/shared/ui/layout';

export function ShopsPage() {
  const [q, setQ] = useState('');
  const list = shops.filter(s => `${s.name} ${s.location} ${s.tagline}`.toLowerCase().includes(q.toLowerCase()));
  return <PageFrame><main className="shell py-6 md:py-10"><section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white"><img src="https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#214c3a] via-[#214c3a]/85 to-[#214c3a]/25" /><div className="relative px-7 py-10 md:px-12 md:py-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e0a57c]">Gian hàng trên Mevi</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Mua trực tiếp từ nhà vườn</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/85">Mỗi gian hàng là một nông trại, hợp tác xã hay xưởng chế biến đã được Mevi xác minh nguồn gốc.</p><label className="relative mt-6 block max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder="Tìm gian hàng, vùng miền..." value={q} onChange={e => setQ(e.target.value)} data-testid="input-search-shops" /></label></div></section>{list.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => <ShopCard key={s.slug} shop={s} />)}</div> : <Empty title="Không tìm thấy gian hàng" detail="Thử từ khóa khác như tên vùng miền." />}</main></PageFrame>;
}
