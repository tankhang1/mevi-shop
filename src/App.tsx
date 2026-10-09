import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { MockAuthProvider, useClerk, useUser, type MockRole } from '@/lib/mock-auth';
import { Route, Switch, Link, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  useListProducts, getListProductsQueryKey, useGetProduct, getGetProductQueryKey, useCreateOrder,
  useGetAdminSummary, getGetAdminSummaryQueryKey, useListAdminProducts, getListAdminProductsQueryKey,
  useCreateProduct, useUpdateProduct, useDeleteProduct, useModerateProduct,
  useListAdminOrders, getListAdminOrdersQueryKey, useUpdateOrderStatus,
  useListAgencies, getListAgenciesQueryKey, useCreateAgency, useUpdateAgency,
  useGetAgencySummary, getGetAgencySummaryQueryKey, useGetAgencySettings, getGetAgencySettingsQueryKey,
  useUpdateMyAgency, useGetPublicAgency, getGetPublicAgencyQueryKey,
} from '@/lib/api';
import type { Product, Order, Agency, PublicAgency, ProductInput, OrderStatusInput } from '@/lib/api';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Banknote, Check, CircleAlert,
  ClipboardList, Clock3, Filter, Leaf, LogOut, Menu, Package, PackageCheck, Plus, Search,
  ShieldCheck, ShoppingBag, Star, Tag, Zap, ShoppingCart, Sprout, Store, Truck, UserRound, X, Upload, Trash2, Pencil,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addUserReview, galleryOf, ratingSummary, reviewTagOptions, reviewsOf, shopBySlug, shopOfProduct, shops, type Review, type Shop } from '@/lib/shops';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const fmt = (amount = 0) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
const dateFmt = (date?: string) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const imageFallback = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1000';
// No storage backend: uploaded images are kept inline as data URLs.
const readAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});
const shopRef = () => new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('mevi-agency-ref') || '';
const agencyBrandContext = createContext<PublicAgency | null>(null);

function useCart() {
  const [items, setItems] = useState<{ productId: number; quantity: number; product: Product }[]>(() => {
    try { return JSON.parse(localStorage.getItem('mevi-cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('mevi-cart', JSON.stringify(items)); }, [items]);
  const add = (product: Product, quantity = 1) => setItems(old => {
    const found = old.find(item => item.productId === product.id);
    return found ? old.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...old, { productId: product.id, quantity, product }];
  });
  const update = (productId: number, quantity: number) => setItems(old => quantity < 1 ? old.filter(x => x.productId !== productId) : old.map(x => x.productId === productId ? { ...x, quantity } : x));
  const clear = () => setItems([]);
  return { items, add, update, clear, count: items.reduce((n, item) => n + item.quantity, 0), total: items.reduce((n, item) => n + (item.product.salePrice ?? item.product.price) * item.quantity, 0) };
}
type OrderStatus = OrderStatusInput['status'];
let cartStore: ReturnType<typeof useCart>;

function App() {
  cartStore = useCart();
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><AgencyBrandProvider><ClerkRouteProvider /></AgencyBrandProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
function AgencyBrandProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const ref = useMemo(() => shopRef(), [location]);
  const query = useGetPublicAgency(ref, { query: { enabled: !!ref, queryKey: getGetPublicAgencyQueryKey(ref) } });
  const agency = query.data?.active ? query.data : null;
  useEffect(() => {
    document.documentElement.style.setProperty('--agency-accent', agency?.primaryColor ?? '#285e45');
  }, [agency?.primaryColor]);
  return <agencyBrandContext.Provider value={agency}>{children}</agencyBrandContext.Provider>;
}
function ClerkRouteProvider() {
  return <MockAuthProvider><AuthQueryInvalidator /><Router /></MockAuthProvider>;
}
function AuthQueryInvalidator() {
  const { user } = useUser(); const client = useQueryClient(); const priorUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const nextId = user?.id ?? null;
    if (priorUser.current !== undefined && priorUser.current !== nextId) client.clear();
    priorUser.current = nextId;
  }, [user?.id, client]);
  return null;
}

function Router() {
  const [location] = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('mevi-agency-ref', ref);
  }, [location]);
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomeRoute} /><Route path="/shop" component={CatalogPage} /><Route path="/product/:id" component={ProductPage} /><Route path="/shops" component={ShopsPage} /><Route path="/shops/:slug" component={ShopPage} />
    <Route path="/cart" component={CartPage} /><Route path="/checkout/confirm" component={CheckoutPage} /><Route path="/checkout/success" component={SuccessPage} />
    <Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/admin/dashboard" component={() => <Gate role="admin"><AdminDashboard /></Gate>} />
    <Route path="/admin/products" component={() => <Gate role="admin"><AdminProducts /></Gate>} />
    <Route path="/admin/products/new" component={() => <Gate role="admin"><ProductEditor /></Gate>} />
    <Route path="/admin/products/:id/edit" component={() => <Gate role="admin"><ProductEditor /></Gate>} />
    <Route path="/admin/products/approval" component={() => <Gate role="admin"><ApprovalPage /></Gate>} />
    <Route path="/admin/orders" component={() => <Gate role="admin"><OrdersPage /></Gate>} />
    <Route path="/admin/agencies" component={() => <Gate role="admin"><AgenciesPage /></Gate>} />
    <Route path="/agency/dashboard" component={() => <Gate role="agency"><AgencyDashboard /></Gate>} />
    <Route path="/agency/settings" component={() => <Gate role="agency"><AgencySettings /></Gate>} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}
function HomeRoute() { return <HomePage />; }
function SignInPage() {
  const { signIn } = useClerk(); const [, setLocation] = useLocation();
  const choose = (role: MockRole) => { signIn(role); setLocation(role === 'admin' ? '/admin/dashboard' : role === 'agency' ? '/agency/dashboard' : '/'); };
  const roles: { role: MockRole; label: string; detail: string }[] = [
    { role: 'admin', label: 'Quản trị viên', detail: 'Quản lý sản phẩm, đơn hàng và đại lý' },
    { role: 'agency', label: 'Đại lý', detail: 'Theo dõi đơn hàng và cài đặt gian hàng' },
    { role: 'customer', label: 'Khách hàng', detail: 'Mua sắm nông sản' },
  ];
  return <AuthFrame><div className="surface w-full max-w-md p-8"><h1 className="text-2xl font-bold">Đăng nhập demo</h1><p className="mt-2 text-sm text-muted-foreground">Dữ liệu mẫu, chọn một vai trò để tiếp tục.</p><div className="mt-6 grid gap-3">{roles.map(r => <button key={r.role} className="rounded-xl border border-[#e3e0d5] p-4 text-left hover:border-[#285e45]" onClick={() => choose(r.role)} data-testid={`button-signin-${r.role}`}><span className="font-bold">{r.label}</span><span className="mt-1 block text-xs text-muted-foreground">{r.detail}</span></button>)}</div></div></AuthFrame>;
}
const SignUpPage = SignInPage;
function AuthFrame({ children }: { children: ReactNode }) { return <div className="min-h-[100dvh] bg-[#f1efe5] px-5 py-12"><div className="shell grid min-h-[calc(100dvh-6rem)] items-center justify-center gap-10 lg:grid-cols-[1fr_480px]"><div className="hidden max-w-xl lg:block"><Brand /><p className="mt-12 text-sm font-semibold uppercase tracking-[.2em] text-[#bd6e46]">Nông sản Việt · nguồn gốc rõ ràng</p><h1 className="mt-4 text-5xl font-bold leading-[1.08] tracking-tight">Từ mùa vụ<br />đến bàn ăn.</h1><p className="mt-5 max-w-md leading-7 text-[#617168]">Mevi đưa nông sản đáng tin cậy đến gần hơn với mỗi gia đình và đối tác địa phương.</p></div><div className="flex justify-center">{children}</div></div></div>; }
function Gate({ role, children }: { role: string; children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return <Loading label="Đang kiểm tra tài khoản" />;
  if (!isSignedIn) return <div className="grid min-h-[100dvh] place-items-center p-6"><div className="surface max-w-md p-8 text-center"><Brand /><h1 className="mt-6 text-2xl font-bold">Vui lòng đăng nhập</h1><p className="mt-2 text-muted-foreground">Khu vực này dành cho tài khoản nhân sự Mevi.</p><Link className="btn-primary mt-6" href="/sign-in">Đăng nhập</Link></div></div>;
  if ((user.publicMetadata as { role?: string }).role !== role) return <div className="grid min-h-[100dvh] place-items-center"><div className="surface p-8 text-center"><CircleAlert className="mx-auto text-[#bd6e46]" /><h2 className="mt-3 text-xl font-bold">Bạn chưa được cấp quyền</h2><Link className="btn-outline mt-5" href="/">Về trang chủ</Link></div></div>;
  return <>{children}</>;
}

const brandLetters = [['M', '#bd6e46'], ['E', '#285e45'], ['V', '#5f8f6e'], ['I', '#7fa36b']] as const;
function Brand({ inverse = false }: { inverse?: boolean }) { const agency=useContext(agencyBrandContext); const color=agency?.primaryColor||'#285e45'; return <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${inverse ? 'text-[#f5f1e5]' : ''}`} style={!inverse?{color}:undefined} data-testid="link-brand" aria-label={agency?.displayName||'Mevi'}>{agency?.logoUrl?<span className="grid h-9 min-w-9 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src={agency.logoUrl} alt="" className="h-full max-w-32 object-contain" /></span>:<img src={`${basePath}/mevi-mark.png`} alt="" className="h-10 w-auto" />}<span className="text-[21px]">{agency?.displayName||<>mevi<span className="font-medium text-[#bd6e46]">.</span></>}</span></Link>; }
function Header() {
  const [menu, setMenu] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-[#e6e2d7] bg-[#faf9f4]/95 backdrop-blur-md"><div className="shell flex h-[74px] items-center justify-between gap-5"><Brand /><nav className="hidden items-center gap-8 text-sm font-semibold text-[#52645a] md:flex"><Link href="/shop" className="hover:text-[#285e45]">Cửa hàng</Link><Link href="/shops" className="hover:text-[#285e45]">Gian hàng</Link><a href="/#trace" className="hover:text-[#285e45]">Truy xuất nguồn gốc</a><a href="/#wholesale" className="hover:text-[#285e45]">Khách sỉ & đại lý</a></nav><div className="flex items-center gap-2.5"><Link href="/sign-in" className="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-[#52645a] sm:flex" data-testid="link-sign-in"><UserRound size={17} /> Đăng nhập</Link><Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full bg-[#eef1e9]" style={{color:'var(--agency-accent)'}} aria-label="Giỏ hàng" data-testid="link-cart"><ShoppingCart size={19} />{cartStore.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#bd6e46] px-1 text-[10px] font-bold text-white">{cartStore.count}</span>}</Link><button className="grid h-10 w-10 place-items-center rounded-lg md:hidden" onClick={() => setMenu(!menu)} aria-label="Mở menu" data-testid="button-menu">{menu ? <X /> : <Menu />}</button></div></div>{menu && <nav className="grid gap-3 border-t border-[#e6e2d7] px-6 py-4 text-sm md:hidden"><Link href="/shop">Cửa hàng</Link><Link href="/shops">Gian hàng</Link><a href="/#trace">Truy xuất nguồn gốc</a><a href="/#wholesale">Khách sỉ & đại lý</a><Link href="/sign-in">Đăng nhập</Link></nav>}</header>;
}
function Footer() { return <footer className="mt-20 bg-[#214c3a] py-12 text-[#f5f1e5]"><div className="shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]"><div><Brand inverse /><p className="mt-4 max-w-sm text-sm leading-6 text-[#c3d0c5]">Nông sản Việt có nguồn gốc minh bạch, kết nối người trồng với người tiêu dùng và đại lý địa phương.</p></div><div><p className="font-bold">Mevi Commerce Hub</p><p className="mt-3 text-sm text-[#c3d0c5]">Mua sắm nông sản an tâm</p><p className="mt-2 text-sm text-[#c3d0c5]">Đặt hàng · nhận hàng · thanh toán khi nhận</p></div><div><p className="font-bold">Dành cho đối tác</p><Link className="mt-3 block text-sm text-[#c3d0c5] hover:text-white" href="/sign-in">Cổng đại lý</Link><a className="mt-2 block text-sm text-[#c3d0c5]" href="/#wholesale">Hợp tác cùng Mevi</a></div></div><div className="shell mt-9 border-t border-white/15 pt-5 text-xs text-[#aebeb2]">© {new Date().getFullYear()} Mevi. Nông sản Việt, hành trình rõ ràng.</div></footer>; }
function Loading({ label = 'Đang tải dữ liệu' }: { label?: string }) { return <div className="space-y-4 py-8" role="status" data-testid="state-loading"><div className="h-8 w-48 animate-pulse rounded-lg bg-[#e7e5dc]" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x => <div key={x} className="h-56 animate-pulse rounded-2xl bg-[#e9e7df]" />)}</div><p className="text-sm text-muted-foreground">{label}</p></div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="surface my-8 flex flex-col items-center p-10 text-center" data-testid="state-error"><CircleAlert className="text-[#bd6e46]" /><h3 className="mt-3 font-bold">Chưa thể tải dữ liệu</h3><p className="mt-1 text-sm text-muted-foreground">Vui lòng thử lại sau ít phút.</p><button className="btn-outline mt-5" onClick={retry} data-testid="button-retry">Thử lại</button></div>; }
function Empty({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) { return <div className="surface my-7 grid justify-items-center p-12 text-center" data-testid="state-empty"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1e9] text-[#285e45]"><Package size={25} /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>; }
function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) { return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.19em] text-[#bd6e46]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-[38px]">{title}</h1>{desc && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{desc}</p>}</div>; }
function priceOf(p: Product) { return p.salePrice ?? p.price; }
// Dummy social proof derived from the id so it stays stable between renders.
const ratingOf = (p: Product) => ratingSummary(reviewsOf(p.id)).avg.toFixed(1);
const soldOf = (p: Product) => 80 + (p.id * 137) % 900;
function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  const off = product.salePrice != null ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const quickAdd = (e: React.MouseEvent) => { e.preventDefault(); cartStore.add(product); setAdded(true); setTimeout(() => setAdded(false), 1200); };
  const sold = soldOf(product);
  return <article className={`group relative overflow-hidden border border-[#e7e4d9] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#b2c3ad] hover:shadow-[var(--shadow-soft)] ${compact ? 'rounded-2xl' : 'rounded-3xl'}`} data-testid={`card-product-${product.id}`}><Link href={`/product/${product.id}`} className="block"><div className={`relative overflow-hidden bg-[#eef1e9] aspect-[4/3]`}><img src={product.imageUrls?.[0] || imageFallback} onError={e => { e.currentTarget.src = imageFallback; }} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />{off > 0 && <span className="absolute left-2.5 top-2.5 rounded-full bg-[#bd6e46] px-2.5 py-1 text-[11px] font-extrabold text-white shadow">-{off}%</span>}{!compact && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#bd6e46] backdrop-blur">{product.category}</span>}<button onClick={quickAdd} className={`absolute grid place-items-center rounded-full text-white shadow-lg transition ${compact ? 'bottom-2 right-2 h-9 w-9' : 'bottom-3 right-3 h-11 w-11'} ${added ? 'bg-[#5f8f6e]' : 'bg-[#285e45] hover:scale-110'}`} aria-label={`Thêm ${product.name} vào giỏ`} data-testid={`button-quick-add-${product.id}`}>{added ? <Check size={compact ? 16 : 19} /> : <Plus size={compact ? 17 : 20} />}</button></div>{compact ? <div className="p-3"><h3 className="truncate text-sm font-bold text-[#214c3a]">{product.name}</h3><div className="mt-1 flex items-baseline gap-2"><p className="font-extrabold text-[#bd6e46]">{fmt(priceOf(product))}</p>{product.salePrice != null && <p className="text-[11px] text-[#8a938d] line-through">{fmt(product.price)}</p>}</div><div className="relative mt-2 h-4 overflow-hidden rounded-full bg-[#f6e6dc]"><div className="h-full rounded-full bg-gradient-to-r from-[#f3cfb4] to-[#e0a57c]" style={{ width: `${Math.min(92, 25 + sold % 70)}%` }} /><span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-[#6b3a22]">Đã bán {sold}</span></div></div> : <div className="p-3.5"><p className="truncate text-xs text-[#758179]">{product.origin || 'Nông sản Việt'}</p><h3 className="mt-0.5 truncate font-bold text-[#214c3a]" title={product.name}>{product.name}</h3><div className="mt-1 flex items-center gap-2 text-[11px] text-[#758179]"><span className="inline-flex items-center gap-0.5 font-bold text-[#d4a24c]"><Star size={12} fill="currentColor" /> {ratingOf(product)}</span><span>·</span><span>Đã bán {sold}</span></div><div className="mt-2 flex items-end justify-between gap-3"><div><p className="text-lg font-extrabold text-[#285e45]">{fmt(priceOf(product))}</p>{product.salePrice != null && <p className="text-xs text-[#8a938d] line-through">{fmt(product.price)}</p>}</div><span className="pb-1 text-xs text-[#758179]">{product.packageSize}</span></div></div>}</Link></article>;
}
function AppSelect<T extends string>({ value, onChange, options, className = '', disabled, testId }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string; disabled?: boolean; testId?: string }) {
  return <Select value={value} onValueChange={v => onChange(v as T)} disabled={disabled}><SelectTrigger className={`h-11 rounded-xl border-[#deddd2] bg-[#fffefa] px-3.5 text-sm font-semibold text-[#24392e] shadow-none focus:ring-2 focus:ring-[#285e45]/15 ${className}`} data-testid={testId}><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-[#e7e4d9] bg-[#fffefa] p-1 shadow-[var(--shadow-soft)]">{options.map(o => <SelectItem key={o.value} value={o.value} className="cursor-pointer rounded-lg py-2 text-sm font-medium text-[#24392e] focus:bg-[#eef1e9] focus:text-[#285e45] data-[state=checked]:font-bold data-[state=checked]:text-[#285e45]">{o.label}</SelectItem>)}</SelectContent></Select>;
}
function PageFrame({ children }: { children: ReactNode }) { return <><Header />{children}<Footer /></>; }
const categoryTiles = [
  { name: 'Trái cây tươi', desc: 'Đặc sản ba miền, hái chín tại vườn và giao trong ngày.', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=300', bg: '#f6ebe2' },
  { name: 'Rau củ', desc: 'Rau củ sạch từ Đà Lạt và các vùng trồng đạt chuẩn.', image: 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=300', bg: '#e8eee3' },
  { name: 'Gạo', desc: 'Gạo đặc sản dẻo thơm, canh tác theo hướng hữu cơ.', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=300', bg: '#f5f0dd' },
  { name: 'Cà phê', desc: 'Cà phê rang mộc từ vùng đất đỏ bazan Tây Nguyên.', image: '/products/buon-ma-thuot-robusta.jpg', bg: '#efe6dc' },
  { name: 'Trà', desc: 'Trà Thái Nguyên, Ô long Bảo Lộc — hương vị Việt.', image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300', bg: '#e4eedb' },
  { name: 'Gia vị', desc: 'Tiêu, ớt và gia vị đặc sản cho bữa cơm đậm đà.', image: '/products/phu-quoc-pepper.jpg', bg: '#f6e6dc' },
  { name: 'Trái cây sấy', desc: 'Trái cây sấy giòn tự nhiên, không đường hóa học.', image: '/products/dried-jackfruit.jpg', bg: '#f6efdc' },
  { name: 'Sữa', desc: 'Sữa tươi nguyên chất từ cao nguyên Mộc Châu.', image: 'https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg?auto=compress&cs=tinysrgb&w=300', bg: '#e3ece6' },
];
const heroSlides = [
  { tag: 'Mùa vụ mới · Đà Lạt', title: <>Rau củ sạch<br />giao trong ngày</>, desc: 'Hái sáng sớm, giao tận nhà trước bữa tối. Combo rau củ gia đình chỉ từ 159.000 ₫.', cta: 'Mua combo ngay', href: '/product/15', image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1600', from: '#214c3a', to: '#5f8f6e' },
  { tag: 'Siêu sale trái cây', title: <>Giảm đến 20%<br />trái cây tươi</>, desc: 'Nho Ninh Thuận, bơ sáp Đắk Lắk, chuối Laba — đặc sản ba miền, giá tốt mỗi tuần.', cta: 'Săn deal trái cây', href: '/shop?category=Trái cây tươi', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1600', from: '#8a4a2c', to: '#bd6e46' },
  { tag: 'Từ nông trại Việt', title: <>Biết rõ nguồn gốc<br />từng sản phẩm</>, desc: 'Mỗi sản phẩm Mevi đều có vùng trồng, quy cách và hướng dẫn bảo quản rõ ràng.', cta: 'Khám phá cửa hàng', href: '/shop', image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=1600', from: '#285e45', to: '#7fa36b' },
];
function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(x => (x + 1) % heroSlides.length), 5500); return () => clearInterval(t); }, []);
  return <section className="shell pt-5"><div className="relative h-[440px] overflow-hidden rounded-[28px] md:h-[460px]">{heroSlides.map((sl, n) => <div key={n} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={n !== i}><img src={sl.image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${sl.from}f2 0%, ${sl.from}cc 38%, ${sl.to}33 75%, transparent 100%)` }} /><div className="absolute inset-0 flex flex-col justify-center px-7 text-white md:px-14"><span className="w-fit rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.14em] backdrop-blur">{sl.tag}</span><h1 className="mt-4 max-w-xl text-[38px] font-extrabold leading-[1.05] tracking-tight md:text-[58px]">{sl.title}</h1><p className="mt-4 max-w-md text-[15px] leading-7 text-white/90">{sl.desc}</p><Link href={sl.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#214c3a] shadow-lg transition hover:scale-105">{sl.cta} <ArrowRight size={17} /></Link></div></div>)}<button className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid" onClick={() => setI((i + heroSlides.length - 1) % heroSlides.length)} aria-label="Slide trước"><ArrowLeft size={18} /></button><button className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid" onClick={() => setI((i + 1) % heroSlides.length)} aria-label="Slide sau"><ArrowRight size={18} /></button><div className="absolute bottom-5 left-7 flex gap-2 md:left-14">{heroSlides.map((_, n) => <button key={n} onClick={() => setI(n)} className={`h-2 rounded-full transition-all ${n === i ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} aria-label={`Slide ${n + 1}`} />)}</div></div></section>;
}
function PromoStrip() {
  const promos = [
    { icon: <Truck />, title: 'Freeship đơn từ 300K', desc: 'Nội thành TP.HCM & Hà Nội', color: '#7fa36b', bg: '#e3ece6' },
    { icon: <Tag />, title: 'Giảm 30K đơn đầu tiên', desc: 'Nhập mã MEVIMOI khi đặt hàng', color: '#bd6e46', bg: '#f6e6dc' },
    { icon: <ShieldCheck />, title: 'Đổi trả trong 24h', desc: 'Nếu sản phẩm không đạt chất lượng', color: '#5f8f6e', bg: '#e8eee3' },
  ];
  return <section className="shell mt-5 grid gap-3 md:grid-cols-3">{promos.map(p => <div key={p.title} className="flex items-center gap-4 rounded-2xl p-4" style={{ background: p.bg }}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white" style={{ color: p.color }}>{p.icon}</span><div><p className="font-extrabold text-[#214c3a]">{p.title}</p><p className="text-xs text-[#5c6c60]">{p.desc}</p></div></div>)}</section>;
}
function CategoryTiles() {
  return <section className="shell mt-14"><div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Mua theo danh mục</p><h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Hôm nay ăn gì?</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex">Tất cả <ArrowRight size={16} /></Link></div><div className="grid grid-cols-4 gap-3 md:grid-cols-8">{categoryTiles.map(c => <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`} className="group flex flex-col items-center gap-2 rounded-3xl p-3 text-center transition hover:-translate-y-1" style={{ background: c.bg }} data-testid={`link-category-${c.name}`}><span className="h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm md:h-20 md:w-20"><img src={c.image} alt="" className="h-full w-full object-cover transition group-hover:scale-110" /></span><span className="text-xs font-bold text-[#214c3a] md:text-sm">{c.name}</span></Link>)}</div></section>;
}
function useCountdown() {
  const [left, setLeft] = useState(0);
  useEffect(() => { const tick = () => { const end = new Date(); end.setHours(24, 0, 0, 0); setLeft(Math.max(0, end.getTime() - Date.now())); }; tick(); const t = setInterval(tick, 1000); return () => clearInterval(t); }, []);
  const s = Math.floor(left / 1000);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(n => String(n).padStart(2, '0'));
}
function FlashSale({ products }: { products: Product[] }) {
  const [h, m, sec] = useCountdown();
  if (!products.length) return null;
  return <section className="shell mt-14"><div className="rounded-[28px] bg-gradient-to-br from-[#214c3a] via-[#285e45] to-[#5f8f6e] p-5 md:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-white"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20"><Zap fill="currentColor" /></span><div><h2 className="text-2xl font-extrabold">Flash Sale hôm nay</h2><p className="text-xs text-white/85">Giá sốc, số lượng có hạn</p></div></div><div className="flex items-center gap-1.5 font-mono text-lg font-bold" aria-label="Thời gian còn lại"><span className="text-xs font-sans font-semibold text-white/85">Kết thúc sau</span>{[h, m, sec].map((v, n) => <span key={n} className="rounded-lg bg-[#214c3a] px-2 py-1">{v}</span>)}</div></div><div className="flex snap-x gap-4 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">{products.slice(0, 5).map(p => <div key={p.id} className="w-[170px] shrink-0 snap-start lg:w-auto"><ProductCard product={p} compact /></div>)}</div></div></section>;
}
function HomePage() {
  const { data, isLoading, isError, refetch } = useListProducts({ sort: 'featured' }, { query: { queryKey: getListProductsQueryKey({ sort: 'featured' }) } });
  const products = data || [];
  const onSale = products.filter(p => p.salePrice != null);
  const bestSellers = [...products].sort((a, b) => soldOf(b) - soldOf(a)).slice(0, 8);
  return <PageFrame><main>
    <HeroCarousel />
    <PromoStrip />
    <CategoryTiles />
    {!isLoading && !isError && <FlashSale products={onSale} />}
    <section className="shell mt-14"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="eyebrow">Được yêu thích nhất</p><h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Bán chạy tuần này</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex">Xem tất cả <ArrowRight size={16} /></Link></div>{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : bestSellers.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{bestSellers.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Sắp có mùa mới" detail="Danh mục sản phẩm đang được cập nhật." />}<Link href="/shop" className="btn-outline mt-6 w-full sm:hidden">Xem tất cả</Link></section>
    <section className="shell mt-14"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="eyebrow">Mua tận gốc</p><h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">Gian hàng nổi bật</h2></div><Link href="/shops" className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex">Tất cả gian hàng <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shops.slice(0, 3).map(sh => <ShopCard key={sh.slug} shop={sh} />)}</div></section>
    <section className="shell mt-14 grid gap-4 md:grid-cols-2"><Link href="/shop?category=Cà phê" className="group relative h-56 overflow-hidden rounded-[28px]"><img src="/products/buon-ma-thuot-robusta.jpg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#214c3a]/90 to-transparent" /><div className="absolute inset-0 flex flex-col justify-center p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e0a57c]">Đặc sản Tây Nguyên</p><h3 className="mt-2 max-w-[260px] text-2xl font-extrabold leading-tight">Cà phê rang mộc giảm 13%</h3><span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">Mua ngay <ArrowRight size={15} /></span></div></Link><Link href="/shop?category=Trà" className="group relative h-56 overflow-hidden rounded-[28px]"><img src="https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-[#5f8f6e]/90 to-transparent" /><div className="absolute inset-0 flex flex-col justify-center p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#eef1e9]">Trà Việt</p><h3 className="mt-2 max-w-[260px] text-2xl font-extrabold leading-tight">Trà xanh Thái Nguyên & Ô long Bảo Lộc</h3><span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold">Khám phá <ArrowRight size={15} /></span></div></Link></section>
    <section id="trace" className="shell grid gap-8 py-16 md:grid-cols-[.85fr_1.15fr] md:py-24"><div><p className="eyebrow">Mỗi sản phẩm có câu chuyện</p><h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight text-[#214c3a]">Biết rõ điều gì<br />đang có trên bàn ăn.</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Mevi kết nối những sản phẩm nông nghiệp có thông tin vùng trồng, quy cách và cách bảo quản rõ ràng. Chọn thực phẩm bằng sự an tâm.</p><Link href="/shop" className="inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#285e45]">Xem sản phẩm <ArrowRight size={16} /></Link></div><div className="grid gap-3 sm:grid-cols-2"><Feature icon={<ShieldCheck />} number="01" title="Nguồn gốc rõ ràng" desc="Thông tin vùng trồng được hiển thị cùng từng sản phẩm." /><Feature icon={<PackageCheck />} number="02" title="Thông tin đầy đủ" desc="Quy cách đóng gói, hạn dùng và hướng dẫn bảo quản." /><Feature icon={<Truck />} number="03" title="Đặt hàng linh hoạt" desc="Đặt trước, thanh toán khi nhận hoặc chuyển khoản trực tiếp." /><Feature icon={<Store />} number="04" title="Đại lý địa phương" desc="Mua qua những cửa hàng được xây dựng bởi đối tác Mevi." /></div></section>
    <section id="wholesale" className="shell pb-4"><div className="relative grid overflow-hidden rounded-[28px] bg-[#214c3a] text-[#f5f1e5] md:grid-cols-[1.05fr_1fr]"><div className="relative z-10 px-7 py-10 md:px-12 md:py-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e0a57c]">Cùng tạo giá trị tại địa phương</p><h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">Đưa nông sản tốt đến gần hơn với cộng đồng của bạn.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#c3d0c5]">Đại lý Mevi sở hữu gian hàng thương hiệu riêng, dễ dàng chia sẻ sản phẩm và theo dõi đơn đặt hàng.</p><ul className="mt-5 grid gap-2 text-sm text-[#e8eee3]">{['Gian hàng mang thương hiệu riêng', 'Chiết khấu hấp dẫn theo sản lượng', 'Theo dõi đơn hàng theo thời gian thực'].map(t => <li key={t} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#e0a57c] text-[#214c3a]"><Check size={13} strokeWidth={3} /></span>{t}</li>)}</ul><Link href="/sign-in" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e0a57c] px-6 py-3 text-sm font-extrabold text-[#214c3a] transition hover:scale-105">Trở thành đại lý <ArrowRight size={16} /></Link></div><div className="relative grid min-h-[260px] grid-cols-2 gap-3 p-3 md:p-4"><img src="https://images.pexels.com/photos/4499231/pexels-photo-4499231.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Cửa hàng đại lý Mevi" className="row-span-2 h-full w-full rounded-2xl object-cover" /><img src="https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Kệ rau củ tươi" className="h-full w-full rounded-2xl object-cover" /><div className="relative overflow-hidden rounded-2xl"><img src="https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Nông sản tại quầy" className="h-full w-full object-cover" /><div className="absolute inset-0 grid place-items-center bg-[#214c3a]/70 text-center"><div><p className="text-3xl font-extrabold">120+</p><p className="text-xs font-semibold text-[#e8eee3]">đại lý trên toàn quốc</p></div></div></div></div></div></section>
  </main></PageFrame>;
}
function Feature({ icon, number, title, desc }: { icon: ReactNode; number: string; title: string; desc: string }) { return <div className="rounded-2xl border border-[#e5e1d5] bg-[#fbfaf5] p-5"><div className="flex items-center justify-between"><span className="text-[#285e45]">{icon}</span><span className="font-mono text-xs text-[#a6a99b]">{number}</span></div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p></div>; }

const sortOptions = [
  { value: 'featured', label: 'Nổi bật' }, { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' }, { value: 'price-desc', label: 'Giá cao đến thấp' },
] as const;
type SortKey = typeof sortOptions[number]['value'];
function CatalogPage() {
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
  const { data, isLoading, isError, refetch } = useListProducts(queryParams, { query: { queryKey: getListProductsQueryKey(queryParams) } });
  const active = categoryTiles.find(c => c.name === category);
  const ref = shopRef();
  return <PageFrame><main className="shell py-6 md:py-10">
    <section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white">{active ? <img key={active.name} src={active.image.replace('w=300', 'w=1400')} alt="" className="rise absolute inset-0 h-full w-full object-cover" /> : <img src="https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="" className="absolute inset-0 h-full w-full object-cover" />}<div className="absolute inset-0 bg-gradient-to-r from-[#214c3a] via-[#214c3a]/85 to-[#214c3a]/20" /><div className="relative px-7 py-9 md:px-12 md:py-12"><nav className="flex items-center gap-1.5 text-xs font-semibold text-white/75"><Link href="/" className="hover:text-white">Trang chủ</Link><span>/</span><button onClick={() => setCategory('')} className="hover:text-white">Cửa hàng</button>{active && <><span>/</span><span className="text-white">{active.name}</span></>}</nav><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{active?.name || 'Nông sản chọn lọc'}</h1><p className="mt-2 max-w-md text-sm leading-6 text-white/85">{active?.desc || 'Tìm sản phẩm phù hợp cho bữa ăn và nhu cầu kinh doanh — rõ nguồn gốc, giao tận nhà.'}</p>{!isLoading && data && <span className="mt-5 inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur" data-testid="text-product-count">{data.length} sản phẩm</span>}{ref && <span className="ml-2 mt-5 inline-flex rounded-full bg-[#e0a57c] px-3.5 py-1.5 text-xs font-bold text-[#214c3a]" data-testid="text-agency-ref">Gian hàng đối tác · {ref}</span>}</div></section>
    <div className="-mx-1 mt-6 flex gap-2.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"><button onClick={() => setCategory('')} className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-bold transition ${!category ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e7e4d9] bg-white text-[#52645a] hover:border-[#285e45]'}`} data-testid="chip-category-all"><span className={`grid h-8 w-8 place-items-center rounded-full ${!category ? 'bg-white/20' : 'bg-[#eef1e9] text-[#285e45]'}`}><Store size={15} /></span>Tất cả</button>{categoryTiles.map(c => <button key={c.name} onClick={() => setCategory(c.name)} className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-bold transition ${category === c.name ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e7e4d9] bg-white text-[#52645a] hover:border-[#285e45]'}`} data-testid={`chip-category-${c.name}`}><img src={c.image} alt="" className="h-8 w-8 rounded-full object-cover" />{c.name}</button>)}</div>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder={active ? `Tìm trong ${active.name.toLowerCase()}...` : 'Tìm theo tên, vùng trồng...'} value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-products" />{search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718077]" aria-label="Xóa tìm kiếm"><X size={16} /></button>}</label><div className="flex items-center gap-2"><span className="whitespace-nowrap text-sm text-muted-foreground">Sắp xếp</span><AppSelect<SortKey> className="w-[190px]" value={sort} onChange={setSort} options={[...sortOptions]} testId="select-sort" /></div></div>
    <div className="mt-6">{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : data?.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">{data.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Chưa tìm thấy sản phẩm" detail="Thử điều chỉnh từ khóa hoặc chọn danh mục khác." action={<button className="btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>Xem tất cả sản phẩm</button>} />}</div>
  </main></PageFrame>;
}
function ProductPage() {
  const [, params] = useRoute('/product/:id'); const id = Number(params?.id || 0);
  const { data: product, isLoading, isError, refetch } = useGetProduct(id, { query: { queryKey: getGetProductQueryKey(id), enabled: !!id } });
  const [added, setAdded] = useState(false);
  const [reviewVersion, setReviewVersion] = useState(0);
  if (isLoading) return <PageFrame><main className="shell"><Loading /></main></PageFrame>;
  if (isError || !product) return <PageFrame><main className="shell"><ErrorState retry={() => refetch()} /></main></PageFrame>;
  const shop = shopOfProduct(product.id);
  const reviews = reviewsOf(product.id);
  const add = () => { cartStore.add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <PageFrame><main className="shell py-8 md:py-12"><Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#65756c]" href="/shop"><ArrowLeft size={16} /> Quay lại cửa hàng</Link><div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr]"><ProductGallery product={product} /><div className="py-1"><p className="eyebrow">{product.category} · {product.origin}</p><h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl" data-testid="text-product-name">{product.name}</h1><a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground"><Stars value={Number(ratingOf(product))} /><span className="font-bold text-[#214c3a]">{ratingOf(product)}</span><span>· {reviewsOf(product.id).length} đánh giá · Đã bán {soldOf(product)}</span></a><p className="mt-4 text-sm leading-7 text-muted-foreground">{product.description}</p><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-bold text-[#285e45]">{fmt(priceOf(product))}</span>{product.salePrice != null && <span className="pb-1 text-sm text-muted-foreground line-through">{fmt(product.price)}</span>}</div><p className="mt-2 text-sm text-muted-foreground">Quy cách: {product.packageSize}</p><button className="btn-primary mt-6 w-full sm:w-auto" onClick={add} data-testid="button-add-cart"><ShoppingBag size={18} />{added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}</button>{shop && <div className="mt-6"><ShopCard shop={shop} compact /></div>}<div className="mt-6 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5"><div className="flex items-center gap-2 font-bold"><ShieldCheck size={19} className="text-[#285e45]" /> Thông tin truy xuất</div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Vùng trồng" value={product.origin} /><Detail label="Quy cách đóng gói" value={product.packageSize} /><Detail label="Hạn sử dụng" value={product.shelfLife} /><Detail label="Bảo quản" value={product.storageInstructions} /><Detail label="Mã sản phẩm" value={product.sku} /></dl></div><p className="mt-4 flex items-start gap-2 rounded-xl bg-[#eef1e9] p-4 text-xs leading-5 text-[#506557]"><Banknote size={16} className="mt-0.5 shrink-0" />Mevi ghi nhận đơn đặt trước, không thu tiền trực tuyến. Bạn thanh toán COD hoặc chuyển khoản trực tiếp theo hướng dẫn của nhân viên.</p></div></div><section id="reviews" className="mt-14 scroll-mt-24"><h2 className="text-2xl font-extrabold text-[#214c3a]">Đánh giá sản phẩm</h2><ReviewForm product={product} onSubmitted={() => setReviewVersion(v => v + 1)} /><ReviewsBlock key={reviewVersion} reviews={reviews} /></section>{shop && <MoreFromShop shop={shop} excludeId={product.id} />}</main></PageFrame>;
}
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return <span className="inline-flex text-[#d4a24c]" aria-label={`${value} trên 5 sao`}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} fill={i <= Math.round(value) ? 'currentColor' : 'none'} strokeWidth={1.8} />)}</span>;
}
const avatarColors = ['#285e45', '#bd6e46', '#5f8f6e', '#8a4a2c', '#4f7f6a', '#a0623f'];
function ReviewItem({ review, product }: { review: Review; product?: Product }) {
  const initials = review.author.split(' ').slice(-2).map(w => w[0]).join('');
  return <article className="border-b border-[#ece8de] py-5 last:border-0" data-testid={`review-${review.id}`}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ background: avatarColors[review.author.length % avatarColors.length] }}>{initials}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-bold text-[#214c3a]">{review.author}</p>{review.mine ? <span className="rounded-full bg-[#f6e6dc] px-2 py-0.5 text-[10px] font-bold text-[#bd6e46]">Đánh giá của bạn</span> : <span className="inline-flex items-center gap-1 rounded-full bg-[#eef1e9] px-2 py-0.5 text-[10px] font-bold text-[#285e45]"><BadgeCheck size={11} /> Đã mua hàng</span>}</div><div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Stars value={review.rating} size={12} /><span>{dateFmt(review.date)}</span></div><p className="mt-2.5 text-sm leading-6 text-[#3d4a42]">{review.content}</p>{!!review.images?.length && <div className="mt-3 flex gap-2">{review.images.map((src, n) => <img key={n} src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />)}</div>}<div className="mt-2.5 flex flex-wrap gap-1.5">{review.tags.map(t => <span key={t} className="rounded-full border border-[#e3e0d5] px-2.5 py-0.5 text-[11px] font-semibold text-[#52645a]">{t}</span>)}</div>{product && <Link href={`/product/${product.id}`} className="mt-3 flex w-fit items-center gap-2.5 rounded-xl bg-[#f6f5ee] p-2 pr-4 hover:bg-[#eef1e9]"><img src={product.imageUrls?.[0] || imageFallback} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="text-xs font-semibold text-[#214c3a]">{product.name}</span></Link>}<p className="mt-3 text-xs text-muted-foreground">{review.helpful} người thấy hữu ích</p></div></div></article>;
}
function ReviewsBlock({ reviews, products }: { reviews: Review[]; products?: Product[] }) {
  const [star, setStar] = useState(0);
  const [limit, setLimit] = useState(5);
  const { total, avg, counts } = ratingSummary(reviews);
  const list = star ? reviews.filter(r => r.rating === star) : reviews;
  if (!total) return <Empty title="Chưa có đánh giá" detail="Hãy là người đầu tiên đánh giá sản phẩm này." />;
  return <div className="mt-5 grid gap-6 lg:grid-cols-[300px_1fr]"><div className="surface h-fit p-6 lg:sticky lg:top-24"><div className="flex items-end gap-2"><span className="text-5xl font-extrabold text-[#214c3a]">{avg.toFixed(1)}</span><span className="pb-1.5 text-sm text-muted-foreground">/ 5</span></div><Stars value={avg} size={18} /><p className="mt-1 text-xs text-muted-foreground">{total} đánh giá</p><div className="mt-5 grid gap-2">{counts.map(c => <button key={c.star} onClick={() => { setStar(star === c.star ? 0 : c.star); setLimit(5); }} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition ${star === c.star ? 'bg-[#eef1e9]' : 'hover:bg-[#f6f5ee]'}`}><span className="flex w-7 items-center gap-0.5 font-bold text-[#52645a]">{c.star}<Star size={11} fill="currentColor" className="text-[#d4a24c]" /></span><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#ece8de]"><span className="block h-full rounded-full bg-[#d4a24c]" style={{ width: `${total ? (c.count / total) * 100 : 0}%` }} /></span><span className="w-5 text-right text-muted-foreground">{c.count}</span></button>)}</div></div><div className="surface px-5 md:px-6">{list.length ? list.slice(0, limit).map(r => <ReviewItem key={r.id} review={r} product={products?.find(p => p.id === r.productId)} />) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có đánh giá {star} sao.</p>}{list.length > limit && <div className="pb-5"><button className="btn-outline w-full" onClick={() => setLimit(limit + 5)}>Xem thêm đánh giá ({list.length - limit})</button></div>}</div></div>;
}
const compactNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n);
// Only approved (publicly listed) products count toward a shop's stats.
function useShopStats(shop: Shop) {
  const { data } = useAllProducts();
  const ids = shop.productIds.filter(id => data?.some(p => p.id === id));
  const reviews = ids.flatMap(reviewsOf).sort((a, b) => b.date.localeCompare(a.date));
  return { productCount: ids.length, reviews, rating: ratingSummary(reviews).avg };
}
function ShopCard({ shop, compact = false }: { shop: Shop; compact?: boolean }) {
  const { rating, productCount } = useShopStats(shop);
  if (compact) return <div className="flex items-center gap-3.5 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-4" data-testid={`card-shop-${shop.slug}`}><img src={shop.avatar} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-white object-cover shadow" /><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 font-bold text-[#214c3a]"><span className="truncate">{shop.name}</span>{shop.verified && <BadgeCheck size={16} className="shrink-0 text-[#285e45]" />}</p><p className="mt-0.5 text-xs text-muted-foreground">{shop.location} · <Star size={11} fill="currentColor" className="inline text-[#d4a24c]" /> {rating.toFixed(1)} · {productCount} sản phẩm</p></div><Link href={`/shops/${shop.slug}`} className="btn-outline min-h-9 shrink-0 px-4 py-1.5 text-xs" data-testid={`link-shop-${shop.slug}`}><Store size={14} /> Xem shop</Link></div>;
  return <Link href={`/shops/${shop.slug}`} className="group overflow-hidden rounded-3xl border border-[#e7e4d9] bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]" data-testid={`card-shop-${shop.slug}`}><div className="relative h-28 overflow-hidden"><img src={shop.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></div><div className="relative px-5 pb-5"><img src={shop.avatar} alt="" className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover shadow" /><p className="mt-2 flex items-center gap-1.5 font-extrabold text-[#214c3a]">{shop.name}{shop.verified && <BadgeCheck size={16} className="text-[#285e45]" />}</p><p className="text-xs text-muted-foreground">{shop.tagline}</p><div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#ece8de] pt-3 text-center"><div><p className="flex items-center justify-center gap-0.5 font-bold text-[#214c3a]"><Star size={12} fill="currentColor" className="text-[#d4a24c]" />{rating.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">Đánh giá</p></div><div><p className="font-bold text-[#214c3a]">{productCount}</p><p className="text-[10px] text-muted-foreground">Sản phẩm</p></div><div><p className="font-bold text-[#214c3a]">{compactNumber(shop.followers)}</p><p className="text-[10px] text-muted-foreground">Theo dõi</p></div></div></div></Link>;
}
function useAllProducts() {
  return useListProducts({ sort: 'featured' }, { query: { queryKey: getListProductsQueryKey({ sort: 'featured' }) } });
}
function MoreFromShop({ shop, excludeId }: { shop: Shop; excludeId: number }) {
  const { data } = useAllProducts();
  const items = (data || []).filter(p => shop.productIds.includes(p.id) && p.id !== excludeId).slice(0, 4);
  if (!items.length) return null;
  return <section className="mt-14"><div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-extrabold text-[#214c3a]">Sản phẩm khác của {shop.name}</h2><Link href={`/shops/${shop.slug}`} className="hidden items-center gap-1.5 text-sm font-bold text-[#285e45] sm:flex">Xem shop <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{items.map(p => <ProductCard key={p.id} product={p} />)}</div></section>;
}
function ShopsPage() {
  const [q, setQ] = useState('');
  const list = shops.filter(s => `${s.name} ${s.location} ${s.tagline}`.toLowerCase().includes(q.toLowerCase()));
  return <PageFrame><main className="shell py-6 md:py-10"><section className="relative overflow-hidden rounded-[28px] bg-[#214c3a] text-white"><img src="https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#214c3a] via-[#214c3a]/85 to-[#214c3a]/25" /><div className="relative px-7 py-10 md:px-12 md:py-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e0a57c]">Gian hàng trên Mevi</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Mua trực tiếp từ nhà vườn</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/85">Mỗi gian hàng là một nông trại, hợp tác xã hay xưởng chế biến đã được Mevi xác minh nguồn gốc.</p><label className="relative mt-6 block max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder="Tìm gian hàng, vùng miền..." value={q} onChange={e => setQ(e.target.value)} data-testid="input-search-shops" /></label></div></section>{list.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => <ShopCard key={s.slug} shop={s} />)}</div> : <Empty title="Không tìm thấy gian hàng" detail="Thử từ khóa khác như tên vùng miền." />}</main></PageFrame>;
}
function ShopPage() {
  const [, params] = useRoute('/shops/:slug');
  const shop = shopBySlug(params?.slug || '');
  const [tab, setTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [following, setFollowing] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');
  const { data, isLoading, isError, refetch } = useListProducts({ sort }, { query: { queryKey: getListProductsQueryKey({ sort }) } });
  const stats = useShopStats(shop ?? shops[0]);
  if (!shop) return <PageFrame><main className="shell py-12"><Empty title="Không tìm thấy gian hàng" detail="Gian hàng có thể đã ngừng hoạt động." action={<Link href="/shops" className="btn-outline">Xem các gian hàng</Link>} /></main></PageFrame>;
  const products = (data || []).filter(p => shop.productIds.includes(p.id));
  const { reviews, rating } = stats;
  const tabs = [{ key: 'products', label: `Sản phẩm (${products.length})` }, { key: 'reviews', label: `Đánh giá (${reviews.length})` }, { key: 'about', label: 'Giới thiệu' }] as const;
  return <PageFrame><main className="shell py-6 md:py-10">
    <section className="overflow-hidden rounded-[28px] border border-[#e7e4d9] bg-white"><div className="relative h-44 md:h-60"><img src={shop.cover} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35" /><nav className="absolute left-6 top-5 flex items-center gap-1.5 text-xs font-semibold text-white/85 md:left-10"><Link href="/" className="hover:text-white">Trang chủ</Link><span>/</span><Link href="/shops" className="hover:text-white">Gian hàng</Link><span>/</span><span className="text-white">{shop.name}</span></nav></div><div className="flex flex-col gap-5 px-6 pb-6 md:flex-row md:items-end md:justify-between md:px-10"><div className="flex items-end gap-4"><img src={shop.avatar} alt="" className="relative z-10 -mt-12 h-24 w-24 shrink-0 rounded-3xl border-4 border-white object-cover shadow-lg md:-mt-14 md:h-28 md:w-28" /><div className="pb-1"><h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#214c3a] md:text-3xl" data-testid="text-shop-name">{shop.name}{shop.verified && <BadgeCheck className="text-[#285e45]" />}</h1><p className="mt-1 text-sm text-muted-foreground">{shop.tagline} · {shop.location}</p></div></div><div className="flex gap-2"><button className={following ? 'btn-outline' : 'btn-primary'} onClick={() => setFollowing(!following)} data-testid="button-follow-shop">{following ? <><Check size={16} /> Đang theo dõi</> : <><Plus size={16} /> Theo dõi</>}</button></div></div><div className="grid grid-cols-2 border-t border-[#ece8de] md:grid-cols-4">{[{ label: 'Đánh giá', value: <span className="inline-flex items-center gap-1"><Star size={15} fill="currentColor" className="text-[#d4a24c]" />{rating.toFixed(1)}</span> }, { label: 'Sản phẩm', value: products.length }, { label: 'Người theo dõi', value: compactNumber(shop.followers + (following ? 1 : 0)) }, { label: 'Phản hồi chat', value: `${shop.responseRate}%` }].map((st, n) => <div key={st.label} className={`px-6 py-4 md:px-10 ${n % 2 ? 'border-l' : ''} ${n === 2 ? 'md:border-l' : ''} border-[#ece8de] ${n > 1 ? 'border-t md:border-t-0' : ''}`}><p className="text-lg font-extrabold text-[#214c3a]">{st.value}</p><p className="text-xs text-muted-foreground">{st.label}</p></div>)}</div></section>
    <div className="sticky top-[74px] z-30 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[#e6e2d7] bg-background/95 px-1 backdrop-blur [scrollbar-width:none]">{tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${tab === t.key ? 'border-[#285e45] text-[#285e45]' : 'border-transparent text-[#718077] hover:text-[#214c3a]'}`} data-testid={`tab-shop-${t.key}`}>{t.label}</button>)}</div>
    {tab === 'products' && <div className="mt-6"><div className="mb-5 flex items-center justify-end gap-2"><span className="text-sm text-muted-foreground">Sắp xếp</span><AppSelect<SortKey> className="w-[190px]" value={sort} onChange={setSort} options={[...sortOptions]} testId="select-shop-sort" /></div>{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : products.length ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Gian hàng chưa có sản phẩm" detail="Sản phẩm mới đang được cập nhật." />}</div>}
    {tab === 'reviews' && <ReviewsBlock reviews={reviews} products={data} />}
    {tab === 'about' && <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><div className="surface p-6"><h2 className="text-lg font-extrabold text-[#214c3a]">Về {shop.name}</h2><p className="mt-3 text-sm leading-7 text-[#3d4a42]">{shop.description}</p><div className="mt-5 grid grid-cols-3 gap-2">{products.slice(0, 3).map(p => <img key={p.id} src={p.imageUrls?.[0] || imageFallback} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />)}</div></div><div className="surface h-fit p-6"><dl className="grid gap-4 text-sm"><Detail label="Địa chỉ" value={shop.location} /><Detail label="Tham gia Mevi" value={`Từ năm ${shop.joined}`} /><Detail label="Tỉ lệ phản hồi" value={`${shop.responseRate}% · thường trong vài giờ`} /><Detail label="Xác minh" value={shop.verified ? 'Đã xác minh nguồn gốc bởi Mevi' : 'Đang xác minh'} /></dl></div></div>}
  </main></PageFrame>;
}
function ProductGallery({ product }: { product: Product }) {
  const images = galleryOf(product);
  const [i, setI] = useState(0);
  const go = (d: number) => setI(x => (x + d + images.length) % images.length);
  return <div><div className="group relative overflow-hidden rounded-3xl bg-[#e9eee4]"><img key={images[i]} src={images[i] || imageFallback} onError={e => { e.currentTarget.src = imageFallback; }} alt={product.name} className="rise aspect-[4/3.4] w-full object-cover" data-testid={`img-product-${product.id}`} />{images.length > 1 && <><button onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#214c3a] opacity-0 shadow transition group-hover:opacity-100" aria-label="Ảnh trước"><ArrowLeft size={18} /></button><button onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#214c3a] opacity-0 shadow transition group-hover:opacity-100" aria-label="Ảnh sau"><ArrowRight size={18} /></button><span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">{i + 1} / {images.length}</span></>}</div>{images.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2.5">{images.map((src, n) => <button key={src} onClick={() => setI(n)} className={`overflow-hidden rounded-2xl border-2 transition ${n === i ? 'border-[#285e45]' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Ảnh ${n + 1}`} data-testid={`thumb-product-${n}`}><img src={src} alt="" className="aspect-square w-full object-cover" /></button>)}</div>}</div>;
}
const ratingWords = ['', 'Rất tệ', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];
function ReviewForm({ product, onSubmitted }: { product: Product; onSubmitted: () => void }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const author = user?.fullName || name.trim();
  const addImages = async (files: FileList | null) => {
    const picked = Array.from(files || []).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024).slice(0, 3 - images.length);
    const urls = await Promise.all(picked.map(readAsDataUrl));
    setImages(old => [...old, ...urls].slice(0, 3));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!author) return setError('Vui lòng nhập tên của bạn.');
    if (content.trim().length < 10) return setError('Nội dung đánh giá cần ít nhất 10 ký tự.');
    addUserReview({ productId: product.id, author, rating, content: content.trim(), tags, images });
    setContent(''); setTags([]); setImages([]); setRating(5); setError(''); setOpen(false); setDone(true);
    onSubmitted();
  };
  if (!open) return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-[#c9cbbd] bg-[#fbfaf5] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-[#214c3a]">{done ? 'Cảm ơn bạn đã đánh giá!' : 'Bạn đã dùng sản phẩm này?'}</p><p className="mt-0.5 text-sm text-muted-foreground">{done ? 'Đánh giá của bạn đã được đăng bên dưới.' : 'Chia sẻ cảm nhận để giúp người mua khác lựa chọn tốt hơn.'}</p></div><button className="btn-primary shrink-0" onClick={() => { setOpen(true); setDone(false); }} data-testid="button-write-review"><Pencil size={16} /> Viết đánh giá</button></div>;
  const shown = hover || rating;
  return <form onSubmit={submit} className="surface mt-5 p-5 md:p-6" data-testid="form-review"><div className="flex items-center gap-3"><img src={galleryOf(product)[0] || imageFallback} alt="" className="h-12 w-12 rounded-xl object-cover" /><div><p className="text-xs text-muted-foreground">Đánh giá sản phẩm</p><p className="font-bold text-[#214c3a]">{product.name}</p></div></div><div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex" onMouseLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5 text-[#d4a24c] transition hover:scale-110" aria-label={`${n} sao`} data-testid={`button-rate-${n}`}><Star size={30} fill={n <= shown ? 'currentColor' : 'none'} strokeWidth={1.6} /></button>)}</div><span className="text-sm font-bold text-[#bd6e46]">{ratingWords[shown]}</span></div><div className="mt-4 flex flex-wrap gap-2">{reviewTagOptions.map(t => { const on = tags.includes(t); return <button type="button" key={t} onClick={() => setTags(on ? tags.filter(x => x !== t) : [...tags, t])} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-[#285e45] bg-[#285e45] text-white' : 'border-[#e3e0d5] bg-white text-[#52645a] hover:border-[#285e45]'}`}>{t}</button>; })}</div>{!user && <input className="field mt-4" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} data-testid="input-review-name" />}<textarea className="field mt-3 min-h-28 resize-y" placeholder="Sản phẩm có tươi ngon, đúng mô tả không? Giao hàng thế nào?" value={content} onChange={e => setContent(e.target.value)} maxLength={500} data-testid="input-review-content" /><div className="mt-1 text-right text-[11px] text-muted-foreground">{content.length}/500</div><div className="mt-2 flex flex-wrap gap-2">{images.map((src, n) => <div key={n} className="relative"><img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => setImages(images.filter((_, k) => k !== n))} className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#214c3a] text-white" aria-label="Xóa ảnh"><X size={13} /></button></div>)}{images.length < 3 && <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-[#c9cbbd] text-[#718077] hover:border-[#285e45] hover:text-[#285e45]"><span className="grid justify-items-center gap-1 text-[10px] font-semibold"><Upload size={18} />Thêm ảnh</span><input type="file" accept="image/*" multiple className="hidden" onChange={e => { addImages(e.target.files); e.target.value = ''; }} data-testid="input-review-images" /></label>}</div>{error && <p className="mt-3 text-sm font-semibold text-[#a7473d]">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => { setOpen(false); setError(''); }}>Hủy</button><button className="btn-primary" data-testid="button-submit-review">Gửi đánh giá</button></div></form>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value || 'Đang cập nhật'}</dd></div>; }
function CartPage() {
  const cart = cartStore;
  return <PageFrame><main className="shell py-10 md:py-14"><SectionTitle eyebrow="Đơn đặt hàng" title="Giỏ hàng" desc="Kiểm tra sản phẩm và số lượng trước khi xác nhận thông tin nhận hàng." />{!cart.items.length ? <Empty title="Giỏ hàng đang trống" detail="Chọn nông sản từ cửa hàng để bắt đầu đặt hàng." action={<Link href="/shop" className="btn-primary">Khám phá cửa hàng <ArrowRight size={16} /></Link>} /> : <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"><div className="surface divide-y divide-[#ece8de]">{cart.items.map(item => <div key={item.productId} className="flex gap-4 p-4 sm:p-5" data-testid={`row-cart-${item.productId}`}><img className="h-20 w-20 rounded-xl object-cover" src={item.product.imageUrls?.[0] || imageFallback} alt={item.product.name} /><div className="min-w-0 flex-1"><Link href={`/product/${item.productId}`} className="font-bold hover:text-[#285e45]">{item.product.name}</Link><p className="mt-1 text-xs text-muted-foreground">{item.product.packageSize}</p><p className="mt-2 font-bold text-[#285e45]">{fmt(priceOf(item.product))}</p></div><div className="flex flex-col items-end justify-between"><button onClick={() => cart.update(item.productId, 0)} className="text-[#1e4d38]" aria-label="Xóa sản phẩm" data-testid={`button-remove-${item.productId}`}><Trash2 size={17} /></button><div className="flex items-center rounded-lg border border-[#deddd2]"><button className="px-2.5 py-1" onClick={() => cart.update(item.productId, item.quantity - 1)} data-testid={`button-qty-minus-${item.productId}`}>−</button><span className="min-w-7 text-center text-sm">{item.quantity}</span><button className="px-2.5 py-1" onClick={() => cart.update(item.productId, item.quantity + 1)} data-testid={`button-qty-plus-${item.productId}`}>+</button></div></div></div>)}</div><aside className="surface p-5"><h2 className="font-bold">Tóm tắt đơn hàng</h2><div className="mt-4 flex justify-between text-sm"><span>Tạm tính · {cart.count} sản phẩm</span><span>{fmt(cart.total)}</span></div><div className="mt-4 border-t border-[#e9e5db] pt-4"><div className="flex justify-between font-bold"><span>Tổng cộng</span><span className="text-[#285e45]">{fmt(cart.total)}</span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Phí giao hàng (nếu có) sẽ được xác nhận khi liên hệ đơn hàng.</p></div><Link href="/checkout/confirm" className="btn-primary mt-5 w-full">Tiếp tục đặt hàng <ArrowRight size={16} /></Link><Link href="/shop" className="mt-4 block text-center text-xs font-semibold text-[#607368]">Tiếp tục mua sắm</Link></aside></div>}</main></PageFrame>;
}
function CheckoutPage() {
  const cart = cartStore; const [, setLocation] = useLocation(); const createOrder = useCreateOrder();
  const [values, setValues] = useState({ customerName: '', phone: '', province: '', district: '', address: '', note: '' });
  const [message, setMessage] = useState('');
  const set = (key: keyof typeof values, value: string) => setValues(old => ({ ...old, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!cart.items.length) { setMessage('Giỏ hàng đang trống.'); return; }
    createOrder.mutate({ data: { ...values, note: values.note || null, agencySlug: shopRef() || null, items: cart.items.map(item => ({ productId: item.productId, quantity: item.quantity })) } }, {
      onSuccess: order => { localStorage.setItem('mevi-last-order', JSON.stringify(order)); cart.clear(); setLocation('/checkout/success'); },
      onError: () => setMessage('Chưa thể ghi nhận đơn. Vui lòng kiểm tra thông tin và thử lại.'),
    });
  };
  if (!cart.items.length) return <PageFrame><main className="shell py-12"><Empty title="Chưa có sản phẩm để đặt" detail="Thêm nông sản vào giỏ trước khi xác nhận đơn." action={<Link href="/shop" className="btn-primary">Về cửa hàng</Link>} /></main></PageFrame>;
  return <PageFrame><main className="shell py-9 md:py-12"><Link href="/cart" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={16} /> Giỏ hàng</Link><SectionTitle eyebrow="Bước cuối" title="Xác nhận đơn đặt hàng" desc="Nhân viên Mevi sẽ liên hệ để xác nhận giao hàng và phương thức thanh toán." /><form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_370px]"><section className="surface p-5 sm:p-7"><h2 className="text-lg font-bold">Thông tin người nhận</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Họ và tên" required><input className="field" required value={values.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Nguyễn Văn An" data-testid="input-customer-name" /></Field><Field label="Số điện thoại" required><input className="field" required minLength={6} value={values.phone} onChange={e => set('phone', e.target.value)} placeholder="090 123 4567" data-testid="input-customer-phone" /></Field><Field label="Tỉnh / thành phố" required><input className="field" required value={values.province} onChange={e => set('province', e.target.value)} placeholder="Tỉnh hoặc thành phố" data-testid="input-province" /></Field><Field label="Quận / huyện" required><input className="field" required value={values.district} onChange={e => set('district', e.target.value)} placeholder="Quận hoặc huyện" data-testid="input-district" /></Field><Field label="Địa chỉ nhận hàng" required wide><input className="field" required value={values.address} onChange={e => set('address', e.target.value)} placeholder="Số nhà, tên đường, phường / xã" data-testid="input-address" /></Field><Field label="Ghi chú cho đơn hàng" wide><textarea className="field min-h-24 resize-y" value={values.note} onChange={e => set('note', e.target.value)} placeholder="Khung giờ nhận, lưu ý giao hàng..." data-testid="input-order-note" /></Field></div></section><aside className="surface p-5 sm:p-6"><h2 className="font-bold">Đơn hàng của bạn</h2><div className="mt-4 space-y-3">{cart.items.map(item => <div key={item.productId} className="flex justify-between gap-3 text-sm"><span className="min-w-0">{item.product.name} <span className="text-muted-foreground">× {item.quantity}</span></span><strong className="shrink-0">{fmt(priceOf(item.product) * item.quantity)}</strong></div>)}</div><div className="mt-4 border-t border-[#e9e5db] pt-4"><div className="flex justify-between font-bold"><span>Tổng cộng</span><span className="text-[#285e45]">{fmt(cart.total)}</span></div></div><div className="mt-5 rounded-xl border border-[#e6d9c8] bg-[#f6f0e4] p-4" data-testid="notice-payment"><p className="flex items-center gap-2 font-bold text-[#805a35]"><Banknote size={17} /> Thanh toán ngoài hệ thống</p><p className="mt-2 text-xs leading-5 text-[#6f6658]">Không thanh toán trực tuyến. Bạn thanh toán khi nhận hàng (COD) hoặc chuyển khoản trực tiếp sau khi nhân viên Mevi xác nhận đơn.</p></div>{message && <p className="mt-4 text-sm text-[#a43e36]" role="alert" data-testid="status-order-error">{message}</p>}<button className="btn-primary mt-5 w-full" disabled={createOrder.isPending} data-testid="button-place-order">{createOrder.isPending ? 'Đang gửi đơn...' : 'Đặt hàng'}</button><p className="mt-3 text-center text-[11px] text-muted-foreground">Đặt hàng không đồng nghĩa với thanh toán</p></aside></form></main></PageFrame>;
}
function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: ReactNode }) { return <label className={`grid gap-2 text-sm font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}{required && <span className="sr-only"> (bắt buộc)</span>}{children}</label>; }
function SuccessPage() {
  let order: Order | null = null; try { order = JSON.parse(localStorage.getItem('mevi-last-order') || 'null'); } catch { order = null; }
  return <PageFrame><main className="shell grid min-h-[68vh] place-items-center py-12"><div className="surface w-full max-w-2xl p-6 text-center sm:p-10"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5efe5] text-[#285e45]"><Check size={30} /></span><p className="eyebrow mt-5">Mevi đã nhận được thông tin</p><h1 className="mt-2 text-3xl font-bold">Đơn đặt hàng đã được ghi nhận</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Đội ngũ Mevi sẽ liên hệ để xác nhận đơn hàng và hướng dẫn nhận hàng, thanh toán.</p>{order && <div className="mt-7 rounded-2xl bg-[#f3f1e8] p-5 text-left" data-testid="panel-order-recap"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0ddd2] pb-4"><div><p className="text-xs text-muted-foreground">Mã đơn đặt hàng</p><p className="mt-1 font-mono text-lg font-bold" data-testid="text-order-code">{order.code}</p></div><span className="rounded-full bg-[#e3eee2] px-3 py-1 text-xs font-bold text-[#285e45]">{statusLabel(order.status)}</span></div><div className="mt-4 flex justify-between text-sm"><span>{order.items?.length || 0} mặt hàng</span><strong>{fmt(order.total)}</strong></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Thanh toán COD hoặc chuyển khoản trực tiếp sau khi nhân viên xác nhận. Không có thanh toán online.</p></div>}<div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/shop" className="btn-primary">Tiếp tục mua sắm</Link><Link href="/" className="btn-outline">Về trang chủ</Link></div></div></main></PageFrame>;
}
function statusLabel(status: string) { const labels: Record<string,string> = { new:'Mới', confirmed:'Đã xác nhận', processing:'Đang xử lý', shipped:'Đang giao', completed:'Hoàn tất', cancelled:'Đã hủy', pending:'Chờ duyệt', approved:'Đã duyệt', rejected:'Từ chối' }; return labels[status] || status; }

const adminNav = [{ href:'/admin/dashboard', label:'Tổng quan', icon:ClipboardList },{ href:'/admin/products',label:'Sản phẩm',icon:Package },{ href:'/admin/products/approval',label:'Duyệt sản phẩm',icon:BadgeCheck },{ href:'/admin/orders',label:'Đơn đặt hàng',icon:ShoppingBag },{ href:'/admin/agencies',label:'Đại lý',icon:Store }];
function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-[#f4f2e9] md:flex"><aside className={`${open ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-[260px] bg-[#214c3a] px-5 py-6 text-[#f5f1e5] md:sticky md:block md:h-[100dvh] md:shrink-0`}><Brand inverse /><p className="mb-4 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a9c1ae]">Quản trị Mevi</p><nav className="space-y-1">{adminNav.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-white/10 ${window.location.pathname === item.href ? 'bg-white/10 text-white' : 'text-[#d4dfd4]'}`}><Icon size={17} />{item.label}</Link>; })}</nav><Link href="/" className="absolute bottom-6 left-8 flex items-center gap-2 text-xs text-[#c3d0c5]"><ArrowLeft size={14} /> Về cửa hàng</Link></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e3e0d5] bg-[#faf9f4]/95 px-5 backdrop-blur md:px-9"><button className="md:hidden" onClick={() => setOpen(!open)} data-testid="button-admin-menu"><Menu /></button><div className="hidden text-sm font-bold md:block">{title}</div><div className="flex items-center gap-3 text-sm"><span className="hidden text-muted-foreground sm:block">Mevi Commerce Hub</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#eef1e9] text-[#285e45]"><UserRound size={17} /></span></div></header><main className="mx-auto max-w-[1320px] p-5 md:p-9">{children}</main></div></div>;
}
function AdminDashboard() {
  const q = useGetAdminSummary({ query: { queryKey: getGetAdminSummaryQueryKey() } });
  return <AdminShell title="Tổng quan"><SectionTitle eyebrow="Bảng điều khiển" title="Chào bạn, đội ngũ Mevi" desc="Theo dõi hoạt động mới nhất của cửa hàng và các đối tác." />{q.isLoading ? <Loading /> : q.isError || !q.data ? <ErrorState retry={() => q.refetch()} /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Sản phẩm" value={q.data.productCount} note="Đang có trong danh mục" icon={<Package />} /><Metric label="Chờ duyệt" value={q.data.pendingProducts} note="Cần xem xét" icon={<Clock3 />} /><Metric label="Đơn đặt hàng" value={q.data.orderCount} note={`${q.data.newOrders} đơn mới`} icon={<ShoppingBag />} /><Metric label="Doanh thu" value={fmt(q.data.totalRevenue)} note="Tổng giá trị đơn hoàn tất" icon={<Banknote />} /></div><div className="mt-7 surface overflow-hidden"><div className="flex items-center justify-between p-5"><div><h2 className="font-bold">Đơn hàng gần đây</h2><p className="mt-1 text-xs text-muted-foreground">Những đơn đặt hàng mới nhất trên Mevi</p></div><Link href="/admin/orders" className="text-xs font-bold text-[#285e45]">Tất cả đơn hàng <ArrowRight className="ml-1 inline" size={14} /></Link></div><OrderTable orders={q.data.recentOrders || []} /></div></>}</AdminShell>;
}
function Metric({ label, value, note, icon }: { label: string; value: ReactNode; note: string; icon: ReactNode }) { return <div className="surface p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-muted-foreground">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">{icon}</span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
function OrderTable({ orders }: { orders: Order[] }) { return !orders.length ? <div className="px-5 pb-5"><Empty title="Chưa có đơn hàng" detail="Đơn đặt hàng mới sẽ xuất hiện tại đây." /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Mã đơn','Khách hàng','Ngày đặt','Tổng tiền','Trạng thái'].map(t => <th key={t} className="px-5 py-3 font-semibold">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#ece8de]">{orders.map(order => <tr key={order.id} data-testid={`row-order-${order.id}`}><td className="px-5 py-4 font-mono text-xs font-bold">{order.code}</td><td className="px-5 py-4"><p className="font-semibold">{order.customerName}</p><p className="text-xs text-muted-foreground">{order.phone}</p></td><td className="px-5 py-4 text-muted-foreground">{dateFmt(order.createdAt)}</td><td className="px-5 py-4 font-semibold">{fmt(order.total)}</td><td className="px-5 py-4"><StatusPill status={order.status} /></td></tr>)}</tbody></table></div>; }
function StatusPill({ status }: { status: string }) { return <span className="inline-flex rounded-full bg-[#eef1e9] px-2.5 py-1 text-[11px] font-bold text-[#315d43]" data-testid={`status-${status}`}>{statusLabel(status)}</span>; }
function AdminProducts() {
  const q = useListAdminProducts({ status: 'all' }, { query: { queryKey: getListAdminProductsQueryKey({ status: 'all' }) } });
  const del = useDeleteProduct();
  const qc = useQueryClient();
  const remove = (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm “${product.name}”?`)) return;
    del.mutate({ id: product.id }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminProductsQueryKey({ status: 'all' }) });
        qc.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
      },
    });
  };
  return <AdminShell title="Sản phẩm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionTitle eyebrow="Danh mục" title="Quản lý sản phẩm" desc="Tạo mới, rà soát và cập nhật danh mục nông sản Mevi." />
      <Link className="btn-primary" href="/admin/products/new"><Plus size={17} /> Thêm sản phẩm</Link>
    </div>
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} /> : !q.data?.length
      ? <Empty title="Danh mục đang trống" detail="Thêm sản phẩm đầu tiên để bắt đầu xây dựng cửa hàng." action={<Link href="/admin/products/new" className="btn-primary"><Plus size={16} /> Thêm sản phẩm</Link>} />
      : <div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Sản phẩm', 'Mã SKU', 'Danh mục', 'Giá bán', 'Trạng thái', 'Thao tác'].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#ece8de]">{q.data.map(product => <tr key={product.id} data-testid={`row-product-${product.id}`}>
          <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={product.imageUrls?.[0] || imageFallback} className="h-11 w-12 rounded-lg object-cover" alt="" /><span className="font-semibold">{product.name}</span></div></td>
          <td className="px-4 py-3 font-mono text-xs">{product.sku}</td><td className="px-4 py-3">{product.category}</td><td className="px-4 py-3 font-semibold">{fmt(priceOf(product))}</td><td className="px-4 py-3"><StatusPill status={product.status} /></td>
          <td className="px-4 py-3"><div className="flex gap-1">
            <Link className="rounded-lg p-2 text-[#285e45] hover:bg-[#eef1e9]" href={`/admin/products/${product.id}/edit`} aria-label="Chỉnh sửa sản phẩm" data-testid={`button-edit-product-${product.id}`}><Pencil size={16} /></Link>
            <button className="rounded-lg p-2 text-[#1e4d38] hover:bg-[#f7e8e4]" onClick={() => remove(product)} disabled={del.isPending} aria-label="Xóa sản phẩm" data-testid={`button-delete-product-${product.id}`}><Trash2 size={16} /></button>
          </div></td>
        </tr>)}</tbody>
      </table></div></div>}
  </AdminShell>;
}
function ProductEditor() {
  const [editMatch, editParams] = useRoute('/admin/products/:id/edit');
  const productId = editMatch ? Number(editParams?.id) : null;
  const productQuery = useListAdminProducts(
    { status: 'all' },
    { query: { enabled: productId !== null, queryKey: getListAdminProductsQueryKey({ status: 'all' }) } },
  );
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<ProductInput>({ name: '', sku: '', category: '', description: '', origin: '', packageSize: '', shelfLife: '', storageInstructions: '', imageUrls: [], price: 0, salePrice: null });
  const [loadedEdit, setLoadedEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const editing = productId !== null;
  const selectedProduct = productQuery.data?.find(product => product.id === productId);

  useEffect(() => {
    if (!editing || !productQuery.data || loadedEdit) return;
    if (!selectedProduct) {
      setError('Không tìm thấy sản phẩm cần chỉnh sửa.');
      setLoadedEdit(true);
      return;
    }
    setForm({
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      description: selectedProduct.description,
      origin: selectedProduct.origin,
      packageSize: selectedProduct.packageSize,
      shelfLife: selectedProduct.shelfLife,
      storageInstructions: selectedProduct.storageInstructions,
      imageUrls: selectedProduct.imageUrls,
      price: selectedProduct.price,
      salePrice: selectedProduct.salePrice ?? null,
    });
    setLoadedEdit(true);
  }, [editing, productQuery.data, loadedEdit, selectedProduct]);

  const put = (key: keyof ProductInput, value: string | number | null) =>
    setForm(old => ({ ...old, [key]: value }));
  const imageUpload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Chọn ảnh JPEG, PNG hoặc WebP nhỏ hơn 8 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const dataUrl = await readAsDataUrl(file);
      setForm(old => ({ ...old, imageUrls: [...old.imageUrls, dataUrl] }));
    } catch {
      setError('Không thể tải ảnh lên. Vui lòng thử ảnh JPEG, PNG hoặc WebP.');
    } finally {
      setUploading(false);
    }
  };
  const onSaved = () => {
    qc.invalidateQueries({ queryKey: getListAdminProductsQueryKey({ status: 'all' }) });
    qc.invalidateQueries({ queryKey: getListAdminProductsQueryKey({ status: 'approved' }) });
    qc.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    setLocation('/admin/products');
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (editing && productId !== null) {
      update.mutate({ id: productId, data: form }, {
        onSuccess: onSaved,
        onError: () => setError('Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.'),
      });
    } else {
      create.mutate({ data: form }, {
        onSuccess: onSaved,
        onError: () => setError('Không thể lưu sản phẩm. Vui lòng kiểm tra lại thông tin.'),
      });
    }
  };
  const saving = create.isPending || update.isPending;
  const ready = !editing || (productQuery.isSuccess && loadedEdit);
  return <AdminShell title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
    {editing && productQuery.isError ? <ErrorState retry={() => productQuery.refetch()} /> :
      editing && productQuery.isSuccess && loadedEdit && !selectedProduct
        ? <Empty title="Không tìm thấy sản phẩm" detail="Sản phẩm có thể đã bị xóa khỏi danh mục." action={<Link href="/admin/products" className="btn-primary">Về danh mục</Link>} />
        : !ready ? <Loading label="Đang tải sản phẩm" /> : <>
          <Link href="/admin/products" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={15} /> Danh mục</Link>
          <SectionTitle eyebrow={`Danh mục / ${editing ? 'Chỉnh sửa' : 'Thêm mới'}`} title={editing ? 'Cập nhật thông tin sản phẩm' : 'Thông tin sản phẩm'} desc="Thông tin này sẽ được dùng trên trang sản phẩm và mục truy xuất nguồn gốc." />
          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="surface grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
              <Field label="Tên sản phẩm" required wide><input required className="field" value={form.name} onChange={e => put('name', e.target.value)} data-testid="input-product-name" /></Field>
              <Field label="Mã SKU" required><input required className="field" value={form.sku} onChange={e => put('sku', e.target.value)} data-testid="input-product-sku" /></Field>
              <Field label="Danh mục" required><input required className="field" value={form.category} onChange={e => put('category', e.target.value)} data-testid="input-product-category" /></Field>
              <Field label="Mô tả" wide><textarea className="field min-h-24" value={form.description} onChange={e => put('description', e.target.value)} data-testid="input-product-description" /></Field>
              <Field label="Nguồn gốc / vùng trồng"><input className="field" value={form.origin} onChange={e => put('origin', e.target.value)} data-testid="input-product-origin" /></Field>
              <Field label="Quy cách đóng gói"><input className="field" value={form.packageSize} onChange={e => put('packageSize', e.target.value)} data-testid="input-product-package" /></Field>
              <Field label="Hạn sử dụng"><input className="field" value={form.shelfLife} onChange={e => put('shelfLife', e.target.value)} data-testid="input-product-shelf-life" /></Field>
              <Field label="Hướng dẫn bảo quản"><input className="field" value={form.storageInstructions} onChange={e => put('storageInstructions', e.target.value)} data-testid="input-product-storage" /></Field>
              <Field label="Giá bán (VND)" required><input type="number" min="0" required className="field" value={form.price} onChange={e => put('price', Number(e.target.value))} data-testid="input-product-price" /></Field>
              <Field label="Giá khuyến mãi (VND)"><input type="number" min="0" className="field" value={form.salePrice ?? ''} onChange={e => put('salePrice', e.target.value ? Number(e.target.value) : null)} data-testid="input-product-sale-price" /></Field>
              <div className="sm:col-span-2">
                {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
                <button className="btn-primary" disabled={saving || uploading} data-testid="button-save-product">{saving ? 'Đang lưu...' : editing ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}</button>
              </div>
            </div>
            <aside className="surface h-fit p-5">
              <h2 className="font-bold">Hình ảnh sản phẩm</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Tải ảnh JPEG, PNG hoặc WebP. Hình ảnh hiển thị trên cửa hàng Mevi.</p>
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] px-4 py-7 text-center text-sm font-semibold text-[#52645a] hover:border-[#285e45]">
                <Upload className="mb-2 text-[#285e45]" size={20} />{uploading ? 'Đang tải ảnh...' : 'Chọn ảnh để tải lên'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={e => void imageUpload(e.target.files?.[0])} data-testid="input-product-image" />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2">{form.imageUrls.map((url, i) => <div key={`${url}-${i}`} className="relative">
                <img src={url} alt={`Ảnh sản phẩm ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                <button type="button" className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-700" onClick={() => setForm(old => ({ ...old, imageUrls: old.imageUrls.filter((_, j) => j !== i) }))} aria-label="Xóa ảnh" data-testid={`button-remove-image-${i}`}><X size={14} /></button>
              </div>)}</div>
            </aside>
          </form>
        </>}
  </AdminShell>;
}
function ApprovalPage() {
  const q=useListAdminProducts({status:'pending'},{query:{queryKey:getListAdminProductsQueryKey({status:'pending'})}}); const moderate=useModerateProduct(); const qc=useQueryClient(); const [rejectId,setRejectId]=useState<number|null>(null); const [reason,setReason]=useState('');
  const review=(id:number,status:'approved'|'rejected',rejectionReason?:string)=>moderate.mutate({id,data:{status,rejectionReason:rejectionReason||null}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListAdminProductsQueryKey({status:'pending'})});qc.invalidateQueries({queryKey:getListAdminProductsQueryKey({status:'all'})});qc.invalidateQueries({queryKey:getGetAdminSummaryQueryKey()});setRejectId(null);setReason('');}});
  return <AdminShell title="Duyệt sản phẩm"><SectionTitle eyebrow="Kiểm duyệt" title="Sản phẩm chờ duyệt" desc="Rà soát thông tin nguồn gốc, quy cách và nội dung trước khi xuất hiện trên cửa hàng." />{q.isLoading?<Loading/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:!q.data?.length?<Empty title="Không có sản phẩm cần duyệt" detail="Các sản phẩm gửi lên đã được xử lý."/>:<div className="grid gap-4">{q.data.map(p=><article key={p.id} className="surface grid gap-5 p-5 md:grid-cols-[150px_1fr_auto]" data-testid={`card-approval-${p.id}`}><img src={p.imageUrls?.[0]||imageFallback} className="h-36 w-full rounded-xl object-cover md:w-[150px]" alt={p.name}/><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold">{p.name}</h2><StatusPill status={p.status}/></div><p className="mt-1 text-xs text-muted-foreground">{p.sku} · {p.category} · {p.origin}</p><p className="mt-3 text-sm leading-6">{p.description}</p><p className="mt-2 text-xs text-muted-foreground">Quy cách: {p.packageSize} · Hạn dùng: {p.shelfLife}</p>{rejectId===p.id&&<div className="mt-4 flex flex-wrap gap-2"><input className="field max-w-sm" placeholder="Lý do từ chối" value={reason} onChange={e=>setReason(e.target.value)} data-testid={`input-rejection-reason-${p.id}`}/><button className="btn-danger" disabled={!reason.trim()||moderate.isPending} onClick={()=>review(p.id,'rejected',reason)} data-testid={`button-confirm-reject-${p.id}`}>Xác nhận từ chối</button><button className="btn-outline" onClick={()=>setRejectId(null)}>Hủy</button></div>}</div><div className="flex gap-2 md:flex-col"><button className="btn-primary" disabled={moderate.isPending} onClick={()=>review(p.id,'approved')} data-testid={`button-approve-${p.id}`}><Check size={16}/> Duyệt</button>{rejectId!==p.id&&<button className="btn-outline" onClick={()=>setRejectId(p.id)} data-testid={`button-reject-${p.id}`}>Từ chối</button>}</div></article>)}</div>}</AdminShell>;
}
function OrdersPage() {
  const [status,setStatus]=useState('all'); const params={status:status as 'all'|'new'|'confirmed'|'processing'|'shipped'|'completed'|'cancelled'}; const q=useListAdminOrders(params,{query:{queryKey:getListAdminOrdersQueryKey(params)}}); const update=useUpdateOrderStatus(); const qc=useQueryClient();
  const options=['all','new','confirmed','processing','shipped','completed','cancelled'];
  const setOrderStatus=(id:number,next:OrderStatus)=>update.mutate({id,data:{status:next}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListAdminOrdersQueryKey(params)});qc.invalidateQueries({queryKey:getGetAdminSummaryQueryKey()});}});
  return <AdminShell title="Đơn hàng"><SectionTitle eyebrow="Vận hành" title="Đơn đặt hàng" desc="Theo dõi trạng thái xử lý và liên hệ người nhận để xác nhận giao hàng." /><div className="mb-5 flex flex-wrap gap-2">{options.map(s=><button key={s} className={`rounded-full px-4 py-2 text-xs font-bold ${s===status?'bg-[#285e45] text-white':'border border-[#dcd9ce] bg-[#fffefa] text-[#637268]'}`} onClick={()=>setStatus(s)} data-testid={`filter-order-${s}`}>{s==='all'?'Tất cả':statusLabel(s)}</button>)}</div>{q.isLoading?<Loading/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:!q.data?.length?<Empty title="Không có đơn hàng phù hợp" detail="Các đơn mới sẽ được hiển thị tại đây."/>:<div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Mã đơn','Người nhận','Địa chỉ','Tổng tiền','Trạng thái','Cập nhật'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y divide-[#ece8de]">{q.data.map(o=><tr key={o.id} data-testid={`row-order-${o.id}`}><td className="px-4 py-4 font-mono text-xs font-bold">{o.code}<p className="mt-1 font-sans font-normal text-muted-foreground">{dateFmt(o.createdAt)}</p></td><td className="px-4 py-4"><p className="font-semibold">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.phone}</p></td><td className="max-w-[230px] px-4 py-4 text-xs leading-5 text-muted-foreground">{o.address}, {o.district}, {o.province}</td><td className="px-4 py-4 font-semibold">{fmt(o.total)}</td><td className="px-4 py-4"><StatusPill status={o.status}/></td><td className="px-4 py-4"><AppSelect className="h-9 min-w-[150px] text-xs" value={o.status} onChange={v=>setOrderStatus(o.id,v)} disabled={update.isPending} testId={`select-order-status-${o.id}`} options={options.filter(x=>x!=='all').map(x=>({ value: x as OrderStatus, label: statusLabel(x) }))} /></td></tr>)}</tbody></table></div></div>}</AdminShell>;
}
function AgenciesPage() {
  const q=useListAgencies({query:{queryKey:getListAgenciesQueryKey()}}); const create=useCreateAgency(); const update=useUpdateAgency(); const qc=useQueryClient(); const [show,setShow]=useState(false); const [form,setForm]=useState({slug:'',displayName:'',logoUrl:'',primaryColor:'#285e45',contactName:'',contactPhone:'',contactEmail:''}); const [msg,setMsg]=useState('');
  const save=(e:FormEvent)=>{e.preventDefault();setMsg('');create.mutate({data:{...form,logoUrl:form.logoUrl||null}},{onSuccess:()=>{qc.invalidateQueries({queryKey:getListAgenciesQueryKey()});setShow(false);setForm({slug:'',displayName:'',logoUrl:'',primaryColor:'#285e45',contactName:'',contactPhone:'',contactEmail:''});},onError:()=>setMsg('Không thể tạo đại lý. Vui lòng kiểm tra thông tin.')});};
  const toggle=(a:Agency)=>update.mutate({id:a.id,data:{active:!a.active}},{onSuccess:()=>qc.invalidateQueries({queryKey:getListAgenciesQueryKey()})});
  return <AdminShell title="Đại lý"><div className="flex flex-wrap items-start justify-between gap-4"><SectionTitle eyebrow="Mạng lưới Mevi" title="Đại lý & gian hàng" desc="Quản lý thông tin liên hệ, trạng thái hoạt động và thương hiệu gian hàng."/><button className="btn-primary" onClick={()=>setShow(!show)} data-testid="button-add-agency"><Plus size={16}/> Thêm đại lý</button></div>{show&&<form onSubmit={save} className="surface mb-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Tên gian hàng" required><input required className="field" value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} data-testid="input-agency-name"/></Field><Field label="Slug gian hàng" required><input required className="field" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="ten-gian-hang" data-testid="input-agency-slug"/></Field><Field label="Màu thương hiệu"><input type="color" className="field h-11 p-1" value={form.primaryColor} onChange={e=>setForm({...form,primaryColor:e.target.value})} data-testid="input-agency-color"/></Field><Field label="Người liên hệ"><input className="field" value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.value})} data-testid="input-agency-contact"/></Field><Field label="Điện thoại"><input className="field" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} data-testid="input-agency-phone"/></Field><Field label="Email"><input type="email" className="field" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} data-testid="input-agency-email"/></Field><div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">{msg&&<span className="mr-auto text-sm text-red-700">{msg}</span>}<button type="button" className="btn-outline" onClick={()=>setShow(false)}>Đóng</button><button disabled={create.isPending} className="btn-primary" data-testid="button-save-agency">{create.isPending?'Đang tạo...':'Tạo gian hàng'}</button></div></form>}{q.isLoading?<Loading/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:!q.data?.length?<Empty title="Chưa có đại lý" detail="Tạo gian hàng đại lý đầu tiên để mở rộng mạng lưới."/>:<div className="grid gap-4 lg:grid-cols-2">{q.data.map(a=><article key={a.id} className="surface p-5" data-testid={`card-agency-${a.id}`}><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{backgroundColor:a.primaryColor}}>{a.logoUrl?<img src={a.logoUrl} alt="" className="h-full w-full rounded-xl object-cover"/>:<Store size={21}/>}</span><div><h2 className="font-bold">{a.displayName}</h2><p className="text-xs text-muted-foreground">mevi.vn/shop?ref={a.slug}</p></div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${a.active?'bg-[#e4eee4] text-[#285e45]':'bg-[#f0e8e1] text-[#976047]'}`}>{a.active?'Đang hoạt động':'Tạm dừng'}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ece8de] pt-4 text-xs"><div><p className="text-muted-foreground">Người liên hệ</p><p className="mt-1 font-semibold">{a.contactName||'—'}</p></div><div><p className="text-muted-foreground">Điện thoại</p><p className="mt-1 font-semibold">{a.contactPhone||'—'}</p></div></div><button className="mt-4 text-xs font-bold text-[#285e45]" onClick={()=>toggle(a)} disabled={update.isPending} data-testid={`button-toggle-agency-${a.id}`}>{a.active?'Tạm dừng gian hàng':'Kích hoạt gian hàng'}</button></article>)}</div>}</AdminShell>;
}
function AgencyDashboard() {
  const q=useGetAgencySummary({query:{queryKey:getGetAgencySummaryQueryKey()}});
  return <AgencyShell title="Tổng quan"><SectionTitle eyebrow="Khu vực đại lý" title="Tổng quan gian hàng" desc="Theo dõi đơn hàng được ghi nhận qua cửa hàng đại lý của bạn." />{q.isLoading?<Loading/>:q.isError||!q.data?<ErrorState retry={()=>q.refetch()}/>:<><div className="grid gap-4 sm:grid-cols-3"><Metric label="Đơn đặt hàng" value={q.data.orderCount} note="Tổng đơn qua gian hàng" icon={<ShoppingBag/>}/><Metric label="Đang xử lý" value={q.data.openOrders} note="Đơn chưa hoàn tất" icon={<Clock3/>}/><Metric label="Tổng giá trị" value={fmt(q.data.totalRevenue)} note="Tổng giá trị đơn hàng" icon={<Banknote/>}/></div><div className="surface mt-7 overflow-hidden"><div className="p-5"><h2 className="font-bold">Đơn hàng gần đây</h2></div><OrderTable orders={q.data.recentOrders||[]}/></div></>}</AgencyShell>;
}
function AgencyShell({ title, children }: { title:string;children:ReactNode }) {
  const {user}=useUser(); const {signOut}=useClerk();
  return <div className="min-h-[100dvh] bg-[#f4f2e9]"><header className="border-b border-[#e3e0d5] bg-[#faf9f4]"><div className="shell flex h-[68px] items-center justify-between"><Brand/><nav className="flex items-center gap-5 text-sm font-semibold"><Link className="hidden sm:block" href="/agency/dashboard">Tổng quan</Link><Link className="hidden sm:block" href="/agency/settings">Cài đặt gian hàng</Link><button className="inline-flex items-center gap-2 text-xs text-[#68766d]" onClick={()=>void signOut({redirectUrl:basePath||'/'})} data-testid="button-sign-out"><LogOut size={15}/>Thoát</button></nav></div></header><main className="shell py-8 md:py-11"><p className="mb-5 text-xs text-muted-foreground">{user?.fullName||'Đại lý'} · {title}</p>{children}</main></div>;
}
function AgencySettings() {
  const q = useGetAgencySettings({ query: { queryKey: getGetAgencySettingsQueryKey() } });
  const update = useUpdateMyAgency();
  const qc = useQueryClient();
  const [form, setForm] = useState({ slug: '', displayName: '', logoUrl: '', primaryColor: '#285e45', contactName: '', contactPhone: '', contactEmail: '' });
  const [init, setInit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (q.data && !init) {
      setForm({ slug: q.data.slug, displayName: q.data.displayName, logoUrl: q.data.logoUrl || '', primaryColor: q.data.primaryColor, contactName: q.data.contactName, contactPhone: q.data.contactPhone, contactEmail: q.data.contactEmail });
      setInit(true);
    }
  }, [q.data, init]);

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setMessage('Chọn ảnh JPEG, PNG hoặc WebP nhỏ hơn 8 MB.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const dataUrl = await readAsDataUrl(file);
      setForm(old => ({ ...old, logoUrl: dataUrl }));
      setMessage('Logo đã tải lên. Nhấn lưu để áp dụng.');
    } catch {
      setMessage('Không thể tải logo lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ data: { ...form, logoUrl: form.logoUrl || null } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetAgencySettingsQueryKey() });
        if (q.data?.slug) qc.invalidateQueries({ queryKey: getGetPublicAgencyQueryKey(q.data.slug) });
        qc.invalidateQueries({ queryKey: getGetPublicAgencyQueryKey(form.slug) });
        setMessage('Thông tin gian hàng đã được lưu.');
      },
      onError: () => setMessage('Không thể lưu thay đổi. Vui lòng thử lại.'),
    });
  };

  return <AgencyShell title="Cài đặt">
    <SectionTitle eyebrow="Thương hiệu" title="Cài đặt gian hàng" desc="Thông tin này giúp khách hàng nhận diện gian hàng và liên hệ với bạn." />
    {q.isLoading ? <Loading /> : q.isError || !q.data ? <ErrorState retry={() => q.refetch()} /> : <form onSubmit={submit} className="surface grid max-w-3xl gap-4 p-5 sm:grid-cols-2 sm:p-7">
      <Field label="Tên gian hàng" required><input className="field" required value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} data-testid="input-my-agency-name" /></Field>
      <Field label="Đường dẫn gian hàng" required><input className="field" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} data-testid="input-my-agency-slug" /></Field>
      <Field label="Màu thương hiệu"><input className="field h-11 p-1" type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} data-testid="input-my-agency-color" /></Field>
      <Field label="Logo gian hàng">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] p-3 text-sm font-semibold text-[#52645a]">
          {form.logoUrl && <img src={form.logoUrl} alt="Logo gian hàng hiện tại" className="h-10 w-10 rounded-lg bg-white object-contain p-1" />}
          <span className="inline-flex items-center gap-2"><Upload size={16} />{uploading ? 'Đang tải logo...' : 'Tải logo lên'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => void uploadLogo(e.target.files?.[0])} disabled={uploading} data-testid="input-my-agency-logo" />
        </label>
      </Field>
      <Field label="Người liên hệ"><input className="field" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} data-testid="input-my-agency-contact" /></Field>
      <Field label="Điện thoại"><input className="field" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} data-testid="input-my-agency-phone" /></Field>
      <Field label="Email"><input type="email" className="field" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} data-testid="input-my-agency-email" /></Field>
      <div className="flex items-end justify-between gap-3 sm:col-span-2"><span className="text-xs text-[#285e45]" role="status">{message}</span><button className="btn-primary" disabled={update.isPending || uploading} data-testid="button-save-agency-settings"><Check size={16} />{update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
    </form>}
  </AgencyShell>;
}

export default App;
