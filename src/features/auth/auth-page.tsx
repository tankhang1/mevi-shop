import { Link, Redirect, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, LogIn, ShieldCheck, Sprout, Truck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Brand } from '@/shared/ui/brand';

export const homeFor = (role?: string) => role === 'agency' ? '/agency/dashboard' : '/';

/** Single sign-on entry: Mevi accounts are managed centrally, so there is no local sign-in/sign-up form. */
export function SignInPage() {
  const { user, signIn } = useAuthStore();
  const [, setLocation] = useLocation();
  // TODO: replace with the real Mevi SSO redirect once the backend is wired up; mock signs in a demo customer.
  const loginWithMevi = () => { signIn('customer', 'Khách hàng Mevi'); setLocation('/'); };
  return <div className="grid min-h-[100dvh] bg-[#f6f5ee] lg:grid-cols-[1.05fr_1fr]">
    <aside className="relative hidden overflow-hidden lg:block"><img src="/products/p17-4.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#214c3a] via-[#214c3a]/75 to-[#214c3a]/45" /><div className="relative flex h-full flex-col justify-between p-12 text-white"><Brand inverse /><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e0a57c]">Nông sản Việt · nguồn gốc rõ ràng</p><h1 className="mt-4 text-5xl font-extrabold leading-[1.06] tracking-tight">Từ mùa vụ<br />đến bàn ăn.</h1><p className="mt-4 max-w-md leading-7 text-white/85">Mevi đưa nông sản đáng tin cậy đến gần hơn với mỗi gia đình và đối tác địa phương.</p><div className="mt-8 grid max-w-md gap-3">{[['Truy xuất nguồn gốc từng lô hàng', <ShieldCheck key="a" size={16} />], ['Giao hàng tươi trong 24–48 giờ', <Truck key="b" size={16} />], ['Mua trực tiếp từ 6 nhà vườn đối tác', <Sprout key="c" size={16} />]].map(([t, icon]) => <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e0a57c] text-[#214c3a]">{icon}</span>{t}</div>)}</div></div><p className="text-xs text-white/60">© {new Date().getFullYear()} Mevi Commerce Hub</p></div></aside>
    <main className="flex flex-col px-5 py-6 sm:px-10">
      <div className="flex items-center justify-between"><div className="lg:hidden"><Brand /></div><Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#52645a] hover:text-[#285e45]" data-testid="link-back-home"><ArrowLeft size={16} /> Về trang chủ</Link></div>
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
        {user && <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[#d7e1d3] bg-[#eef1e9] p-4 text-sm"><span>Đang đăng nhập: <b className="text-[#214c3a]">{user.fullName}</b></span><Link href={homeFor(user.role)} className="font-bold text-[#285e45]">Tiếp tục →</Link></div>}
        <h2 className="text-3xl font-extrabold tracking-tight text-[#214c3a]">Đăng nhập</h2>
        <p className="mt-2 text-sm text-muted-foreground">Dùng tài khoản Mevi để mua sắm, theo dõi đơn hàng và truy cập trang quản trị.</p>
        <button onClick={loginWithMevi} className="btn-primary mt-8 h-12 w-full text-[15px]" data-testid="button-login-mevi"><LogIn size={18} /> Đăng nhập với Mevi <ArrowRight size={16} /></button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Một tài khoản Mevi dùng chung cho cửa hàng và trang quản trị.</p>
      </div>
    </main>
  </div>;
}

/** Accounts are created through Mevi SSO, so the old sign-up URL just points to sign-in. */
export function SignUpPage() { return <Redirect to="/sign-in" replace />; }
