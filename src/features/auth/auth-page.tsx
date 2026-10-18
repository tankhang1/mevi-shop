import { useAuthStore } from '@/features/auth/model/auth.store';
import type { Role } from '@/features/auth/model/auth.store';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, CircleAlert, ShieldCheck, ShoppingBag, Sprout, Store, Truck } from 'lucide-react';
import { Brand } from '@/shared/ui/brand';
import { Field } from '@/shared/ui/field';

export const demoRoles: { role: Role; label: string; detail: string; icon: ReactNode }[] = [
  { role: 'agency', label: 'Đại lý', detail: 'Đơn hàng & gian hàng', icon: <Store size={18} /> },
  { role: 'customer', label: 'Khách hàng', detail: 'Mua sắm nông sản', icon: <ShoppingBag size={18} /> },
];

export const homeFor = (role?: string) => role === 'agency' ? '/agency/dashboard' : '/';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { user, signIn } = useAuthStore(); const [, setLocation] = useLocation();
  const [values, setValues] = useState({ name: '', account: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const isSignUp = mode === 'sign-up';
  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues(v => ({ ...v, [k]: e.target.value }));
  const quick = (role: Role) => { signIn(role); setLocation(homeFor(role)); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const account = values.account.trim();
    if (isSignUp && values.name.trim().length < 2) return setError('Vui lòng nhập họ tên.');
    if (!/^\S+@\S+\.\S+$/.test(account) && !/^0\d{9}$/.test(account.replace(/\s/g, ''))) return setError('Nhập email hoặc số điện thoại 10 số hợp lệ.');
    if (values.password.length < 6) return setError('Mật khẩu cần ít nhất 6 ký tự.');
    // Demo only: any valid-looking credentials sign in as a customer.
    signIn('customer', isSignUp ? values.name.trim() : account.split('@')[0]);
    setLocation('/');
  };
  return <div className="grid min-h-[100dvh] bg-[#f6f5ee] lg:grid-cols-[1.05fr_1fr]">
    <aside className="relative hidden overflow-hidden lg:block"><img src="/products/p17-4.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#214c3a] via-[#214c3a]/75 to-[#214c3a]/45" /><div className="relative flex h-full flex-col justify-between p-12 text-white"><Brand inverse /><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e0a57c]">Nông sản Việt · nguồn gốc rõ ràng</p><h1 className="mt-4 text-5xl font-extrabold leading-[1.06] tracking-tight">Từ mùa vụ<br />đến bàn ăn.</h1><p className="mt-4 max-w-md leading-7 text-white/85">Mevi đưa nông sản đáng tin cậy đến gần hơn với mỗi gia đình và đối tác địa phương.</p><div className="mt-8 grid max-w-md gap-3">{[['Truy xuất nguồn gốc từng lô hàng', <ShieldCheck key="a" size={16} />], ['Giao hàng tươi trong 24–48 giờ', <Truck key="b" size={16} />], ['Mua trực tiếp từ 6 nhà vườn đối tác', <Sprout key="c" size={16} />]].map(([t, icon]) => <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e0a57c] text-[#214c3a]">{icon}</span>{t}</div>)}</div></div><p className="text-xs text-white/60">© {new Date().getFullYear()} Mevi Commerce Hub</p></div></aside>
    <main className="flex flex-col px-5 py-6 sm:px-10"><div className="flex items-center justify-between"><div className="lg:hidden"><Brand /></div><Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#52645a] hover:text-[#285e45]" data-testid="link-back-home"><ArrowLeft size={16} /> Về trang chủ</Link></div><div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
      {user && <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[#d7e1d3] bg-[#eef1e9] p-4 text-sm"><span>Đang đăng nhập: <b className="text-[#214c3a]">{user.fullName}</b></span><Link href={homeFor(user.role)} className="font-bold text-[#285e45]">Tiếp tục →</Link></div>}
      <h2 className="text-3xl font-extrabold tracking-tight text-[#214c3a]">{isSignUp ? 'Tạo tài khoản Mevi' : 'Chào mừng trở lại'}</h2><p className="mt-2 text-sm text-muted-foreground">{isSignUp ? 'Cùng kết nối với nông sản Việt minh bạch.' : 'Đăng nhập để tiếp tục mua sắm cùng Mevi.'}</p>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#ece9df] p-1 text-sm font-bold">{(['sign-in', 'sign-up'] as const).map(m => <Link key={m} href={`/${m}`} onClick={() => setError('')} className={`rounded-lg py-2 text-center transition ${mode === m ? 'bg-white text-[#214c3a] shadow-sm' : 'text-[#718077] hover:text-[#214c3a]'}`} data-testid={`tab-${m}`}>{m === 'sign-in' ? 'Đăng nhập' : 'Đăng ký'}</Link>)}</div>
      <form onSubmit={submit} className="mt-6 grid gap-4" data-testid="form-auth">{isSignUp && <Field label="Họ và tên"><input className="field" value={values.name} onChange={set('name')} placeholder="Nguyễn Văn A" autoComplete="name" data-testid="input-auth-name" /></Field>}<Field label="Email hoặc số điện thoại"><input className="field" value={values.account} onChange={set('account')} placeholder="ban@email.com" autoComplete="username" data-testid="input-auth-account" /></Field><div className="grid gap-2 text-sm font-semibold"><div className="flex items-center justify-between"><label htmlFor="auth-password">Mật khẩu</label>{!isSignUp && <button type="button" className="text-xs font-semibold text-[#285e45] hover:underline" onClick={() => setError('Tính năng khôi phục mật khẩu chưa có trong bản demo.')}>Quên mật khẩu?</button>}</div><div className="relative"><input id="auth-password" className="field pr-16" type={showPassword ? 'text' : 'password'} value={values.password} onChange={set('password')} placeholder="Ít nhất 6 ký tự" autoComplete={isSignUp ? 'new-password' : 'current-password'} data-testid="input-auth-password" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#718077] hover:text-[#214c3a]">{showPassword ? 'Ẩn' : 'Hiện'}</button></div></div>{error && <p className="flex items-center gap-2 rounded-xl bg-[#f6e6dc] px-3.5 py-2.5 text-sm font-semibold text-[#a7473d]"><CircleAlert size={16} />{error}</p>}<button className="btn-primary w-full" data-testid="button-auth-submit">{isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'} <ArrowRight size={16} /></button>{isSignUp && <p className="text-center text-xs leading-5 text-muted-foreground">Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của Mevi.</p>}</form>
      <div className="my-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.14em] text-[#9a9e94]"><span className="h-px flex-1 bg-[#e3e0d5]" />Tài khoản demo<span className="h-px flex-1 bg-[#e3e0d5]" /></div>
      <div className="grid grid-cols-3 gap-2.5">{demoRoles.map(r => <button key={r.role} onClick={() => quick(r.role)} className="group flex flex-col items-center gap-2 rounded-2xl border border-[#e3e0d5] bg-white px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#285e45]" data-testid={`button-signin-${r.role}`}><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef1e9] text-[#285e45] transition group-hover:bg-[#285e45] group-hover:text-white">{r.icon}</span><span className="text-sm font-bold text-[#214c3a]">{r.label}</span><span className="text-[10px] leading-4 text-muted-foreground">{r.detail}</span></button>)}</div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Bản demo: dữ liệu mẫu, không cần mật khẩu thật.</p>
    </div></main>
  </div>;
}

export function SignInPage() { return <AuthPage mode="sign-in" />; }

export function SignUpPage() { return <AuthPage mode="sign-up" />; }
