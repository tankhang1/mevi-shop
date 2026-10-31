import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, BadgeCheck, ClipboardList, Image, LogOut, Menu, Package, ShoppingBag, Store, UserRound } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { basePath } from '@/shared/config';
import { Brand } from '@/shared/ui/brand';

const adminNav = [
  { href: '/admin/dashboard', label: 'Tổng quan', icon: ClipboardList },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/products/approval', label: 'Duyệt sản phẩm', icon: BadgeCheck },
  { href: '/admin/orders', label: 'Đơn đặt hàng', icon: ShoppingBag },
  { href: '/admin/agencies', label: 'Đại lý', icon: Store },
  { href: '/admin/banners', label: 'Banner', icon: Image },
];

// Longest matching prefix wins so /admin/products/approval doesn't also light up /admin/products.
const activeHref = (path: string) =>
  adminNav.map(i => i.href).filter(h => path === h || path.startsWith(`${h}/`)).sort((a, b) => b.length - a.length)[0];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, signOut } = useAuthStore();
  const current = activeHref(location);
  return <div className="min-h-[100dvh] bg-[#f4f2e9] md:flex">
    {open && <button className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu" />}
    <aside className={`${open ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-[260px] bg-[#214c3a] px-5 py-6 text-[#f5f1e5] md:sticky md:top-0 md:block md:h-[100dvh] md:shrink-0`}>
      <Brand inverse />
      <p className="mb-4 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a9c1ae]">Quản trị Mevi</p>
      <nav className="space-y-1">{adminNav.map(({ href, label, icon: Icon }) =>
        <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-white/10 ${current === href ? 'bg-white/10 text-white' : 'text-[#d4dfd4]'}`}><Icon size={17} />{label}</Link>)}
      </nav>
      <Link href="/" className="absolute bottom-6 left-8 flex items-center gap-2 text-xs text-[#c3d0c5]"><ArrowLeft size={14} /> Về cửa hàng</Link>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e3e0d5] bg-[#faf9f4]/95 px-5 backdrop-blur md:px-9">
        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Mở menu" data-testid="button-admin-menu"><Menu /></button>
        <div className="hidden text-sm font-bold md:block">{title}</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:block">{user?.fullName}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef1e9] text-[#285e45]"><UserRound size={17} /></span>
          <button className="inline-flex items-center gap-1.5 text-xs text-[#68766d]" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-admin-sign-out"><LogOut size={15} />Thoát</button>
        </div>
      </header>
      <main className="px-5 py-7 md:px-9 md:py-9">{children}</main>
    </div>
  </div>;
}
