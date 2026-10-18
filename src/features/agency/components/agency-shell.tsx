import { type ReactNode } from 'react';
import { useClerk, useUser } from '@/lib/mock-auth';
import { Link } from 'wouter';
import { LogOut } from 'lucide-react';
import { basePath } from '@/shared/config';
import { Brand } from '@/shared/ui/brand';

export function AgencyShell({ title, children }: { title:string;children:ReactNode }) {
  const {user}=useUser(); const {signOut}=useClerk();
  return <div className="min-h-[100dvh] bg-[#f4f2e9]"><header className="border-b border-[#e3e0d5] bg-[#faf9f4]"><div className="shell flex h-[68px] items-center justify-between"><Brand/><nav className="flex items-center gap-5 text-sm font-semibold"><Link className="hidden sm:block" href="/agency/dashboard">Tổng quan</Link><Link className="hidden sm:block" href="/agency/settings">Cài đặt gian hàng</Link><button className="inline-flex items-center gap-2 text-xs text-[#68766d]" onClick={()=>void signOut({redirectUrl:basePath||'/'})} data-testid="button-sign-out"><LogOut size={15}/>Thoát</button></nav></div></header><main className="shell py-8 md:py-11"><p className="mb-5 text-xs text-muted-foreground">{user?.fullName||'Đại lý'} · {title}</p>{children}</main></div>;
}
