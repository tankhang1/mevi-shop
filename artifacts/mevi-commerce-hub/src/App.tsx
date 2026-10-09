import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { Route, Switch, Link, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import {
  useListProducts, getListProductsQueryKey, useGetProduct, getGetProductQueryKey, useCreateOrder,
  useGetAdminSummary, getGetAdminSummaryQueryKey, useListAdminProducts, getListAdminProductsQueryKey,
  useCreateProduct, useUpdateProduct, useDeleteProduct, useModerateProduct,
  useListAdminOrders, getListAdminOrdersQueryKey, useUpdateOrderStatus,
  useListAgencies, getListAgenciesQueryKey, useCreateAgency, useUpdateAgency,
  useGetAgencySummary, getGetAgencySummaryQueryKey, useGetAgencySettings, getGetAgencySettingsQueryKey,
  useUpdateMyAgency, useRequestUploadUrl, useGetPublicAgency, getGetPublicAgencyQueryKey,
} from '@workspace/api-client-react';
import type { Product, Order, Agency, PublicAgency, ProductInput, OrderStatusInput } from '@workspace/api-client-react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Banknote, Check, CircleAlert,
  ClipboardList, Clock3, Filter, Leaf, LogOut, Menu, Package, PackageCheck, Plus, Search,
  ShieldCheck, ShoppingBag, ShoppingCart, Sprout, Store, Truck, UserRound, X, Upload, Trash2, Pencil,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');
const fmt = (amount = 0) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
const dateFmt = (date?: string) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const imageFallback = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=1000';
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
  const [, setLocation] = useLocation();
  const stripBase = (path: string) => basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
  return <ClerkProvider
    publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}
    routerPush={to => setLocation(stripBase(to))} routerReplace={to => setLocation(stripBase(to), { replace:true })}
    appearance={{ variables: { colorPrimary: '#285e45', colorForeground: '#21382d', colorMutedForeground: '#65756c', colorBackground: '#fbfaf5', colorInput: '#f4f1e8', colorInputForeground: '#21382d', colorDanger: '#ae4137', colorNeutral: '#d6d5c9', fontFamily: "'Be Vietnam Pro', sans-serif", borderRadius: '12px' }, elements: { card: 'shadow-none border-0', headerTitle: 'font-bold', formButtonPrimary: 'font-semibold' } }}
    localization={{ signIn: { start: { title: 'Chào mừng bạn quay lại', subtitle: 'Đăng nhập để tiếp tục mua sắm cùng Mevi' } }, signUp: { start: { title: 'Tạo tài khoản Mevi', subtitle: 'Cùng kết nối với nông sản Việt minh bạch' } } }}
  ><ClerkQueryInvalidator /><Router /></ClerkProvider>;
}
function ClerkQueryInvalidator() {
  const { addListener } = useClerk(); const client = useQueryClient(); const priorUser = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const nextId = user?.id ?? null;
    if (priorUser.current !== undefined && priorUser.current !== nextId) client.clear();
    priorUser.current = nextId;
  }), [addListener, client]);
  return null;
}

function Router() {
  const [location] = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('mevi-agency-ref', ref);
  }, [location]);
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomeRoute} /><Route path="/shop" component={CatalogPage} /><Route path="/product/:id" component={ProductPage} />
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
function HomeRoute() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [, setLocation] = useLocation();
  const role = user?.publicMetadata.role;
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (role === 'admin') setLocation('/admin/dashboard');
    else if (role === 'agency') setLocation('/agency/dashboard');
  }, [isLoaded, isSignedIn, role, setLocation]);
  return <HomePage />;
}
function SignInPage() { return <AuthFrame><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></AuthFrame>; }
function SignUpPage() { return <AuthFrame><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></AuthFrame>; }
function AuthFrame({ children }: { children: ReactNode }) { return <div className="min-h-[100dvh] bg-[#f1efe5] px-5 py-12"><div className="shell grid min-h-[calc(100dvh-6rem)] items-center justify-center gap-10 lg:grid-cols-[1fr_480px]"><div className="hidden max-w-xl lg:block"><Brand /><p className="mt-12 text-sm font-semibold uppercase tracking-[.2em] text-[#bd6e46]">Nông sản Việt · nguồn gốc rõ ràng</p><h1 className="mt-4 text-5xl font-bold leading-[1.08] tracking-tight">Từ mùa vụ<br />đến bàn ăn.</h1><p className="mt-5 max-w-md leading-7 text-[#617168]">Mevi đưa nông sản đáng tin cậy đến gần hơn với mỗi gia đình và đối tác địa phương.</p></div><div className="flex justify-center">{children}</div></div></div>; }
function Gate({ role, children }: { role: string; children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return <Loading label="Đang kiểm tra tài khoản" />;
  if (!isSignedIn) return <div className="grid min-h-[100dvh] place-items-center p-6"><div className="surface max-w-md p-8 text-center"><Brand /><h1 className="mt-6 text-2xl font-bold">Vui lòng đăng nhập</h1><p className="mt-2 text-muted-foreground">Khu vực này dành cho tài khoản nhân sự Mevi.</p><Link className="btn-primary mt-6" href="/sign-in">Đăng nhập</Link></div></div>;
  if ((user.publicMetadata as { role?: string }).role !== role) return <div className="grid min-h-[100dvh] place-items-center"><div className="surface p-8 text-center"><CircleAlert className="mx-auto text-[#bd6e46]" /><h2 className="mt-3 text-xl font-bold">Bạn chưa được cấp quyền</h2><Link className="btn-outline mt-5" href="/">Về trang chủ</Link></div></div>;
  return <>{children}</>;
}

function Brand({ inverse = false }: { inverse?: boolean }) { const agency=useContext(agencyBrandContext); const color=agency?.primaryColor||'#285e45'; return <Link href="/" className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${inverse ? 'text-[#f5f1e5]' : ''}`} style={!inverse?{color}:undefined} data-testid="link-brand" aria-label={agency?.displayName||'Mevi'}>{agency?.logoUrl?<span className="grid h-9 min-w-9 place-items-center overflow-hidden rounded-xl bg-white p-1"><img src={agency.logoUrl} alt="" className="h-full max-w-32 object-contain" /></span>:<span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7eee5]" style={{color}}><Sprout size={21} strokeWidth={2.3} /></span>}<span className="text-[20px]">{agency?.displayName||<>mevi<span className="font-medium text-[#bd6e46]">.</span></>}</span></Link>; }
function Header() {
  const [menu, setMenu] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-[#e6e2d7] bg-[#faf9f4]/95 backdrop-blur-md"><div className="shell flex h-[74px] items-center justify-between gap-5"><Brand /><nav className="hidden items-center gap-8 text-sm font-semibold text-[#52645a] md:flex"><Link href="/shop" className="hover:text-[#285e45]">Cửa hàng</Link><a href="/#trace" className="hover:text-[#285e45]">Truy xuất nguồn gốc</a><a href="/#wholesale" className="hover:text-[#285e45]">Khách sỉ & đại lý</a></nav><div className="flex items-center gap-2.5"><Link href="/sign-in" className="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-[#52645a] sm:flex" data-testid="link-sign-in"><UserRound size={17} /> Đăng nhập</Link><Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full bg-[#edf0e8]" style={{color:'var(--agency-accent)'}} aria-label="Giỏ hàng" data-testid="link-cart"><ShoppingCart size={19} />{cartStore.count > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#bd6e46] px-1 text-[10px] font-bold text-white">{cartStore.count}</span>}</Link><button className="grid h-10 w-10 place-items-center rounded-lg md:hidden" onClick={() => setMenu(!menu)} aria-label="Mở menu" data-testid="button-menu">{menu ? <X /> : <Menu />}</button></div></div>{menu && <nav className="grid gap-3 border-t border-[#e6e2d7] px-6 py-4 text-sm md:hidden"><Link href="/shop">Cửa hàng</Link><a href="/#trace">Truy xuất nguồn gốc</a><a href="/#wholesale">Khách sỉ & đại lý</a><Link href="/sign-in">Đăng nhập</Link></nav>}</header>;
}
function Footer() { return <footer className="mt-20 bg-[#214c3a] py-12 text-[#f5f1e5]"><div className="shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]"><div><Brand inverse /><p className="mt-4 max-w-sm text-sm leading-6 text-[#c3d0c5]">Nông sản Việt có nguồn gốc minh bạch, kết nối người trồng với người tiêu dùng và đại lý địa phương.</p></div><div><p className="font-bold">Mevi Commerce Hub</p><p className="mt-3 text-sm text-[#c3d0c5]">Mua sắm nông sản an tâm</p><p className="mt-2 text-sm text-[#c3d0c5]">Đặt hàng · nhận hàng · thanh toán khi nhận</p></div><div><p className="font-bold">Dành cho đối tác</p><Link className="mt-3 block text-sm text-[#c3d0c5] hover:text-white" href="/sign-in">Cổng đại lý</Link><a className="mt-2 block text-sm text-[#c3d0c5]" href="/#wholesale">Hợp tác cùng Mevi</a></div></div><div className="shell mt-9 border-t border-white/15 pt-5 text-xs text-[#aebeb2]">© {new Date().getFullYear()} Mevi. Nông sản Việt, hành trình rõ ràng.</div></footer>; }
function Loading({ label = 'Đang tải dữ liệu' }: { label?: string }) { return <div className="space-y-4 py-8" role="status" data-testid="state-loading"><div className="h-8 w-48 animate-pulse rounded-lg bg-[#e7e5dc]" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x => <div key={x} className="h-56 animate-pulse rounded-2xl bg-[#e9e7df]" />)}</div><p className="text-sm text-muted-foreground">{label}</p></div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div className="surface my-8 flex flex-col items-center p-10 text-center" data-testid="state-error"><CircleAlert className="text-[#bd6e46]" /><h3 className="mt-3 font-bold">Chưa thể tải dữ liệu</h3><p className="mt-1 text-sm text-muted-foreground">Vui lòng thử lại sau ít phút.</p><button className="btn-outline mt-5" onClick={retry} data-testid="button-retry">Thử lại</button></div>; }
function Empty({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) { return <div className="surface my-7 grid justify-items-center p-12 text-center" data-testid="state-empty"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef1e9] text-[#285e45]"><Package size={25} /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>; }
function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) { return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.19em] text-[#bd6e46]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-[38px]">{title}</h1>{desc && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{desc}</p>}</div>; }
function priceOf(p: Product) { return p.salePrice ?? p.price; }
function ProductCard({ product }: { product: Product }) {
  return <article className="group overflow-hidden rounded-2xl border border-[#e7e4d9] bg-[#fffefa] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]" data-testid={`card-product-${product.id}`}><Link href={`/product/${product.id}`} className="block"><div className="relative aspect-[1.23] overflow-hidden bg-[#e8eddf]"><img src={product.imageUrls?.[0] || imageFallback} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute left-3 top-3 rounded-full bg-[#f8f6ed]/95 px-3 py-1 text-[11px] font-bold text-[#285e45]">{product.category}</span></div><div className="p-4"><p className="text-xs text-[#758179]">{product.origin || 'Nông sản Việt'}</p><h3 className="mt-1 line-clamp-2 min-h-12 font-bold leading-6">{product.name}</h3><div className="mt-3 flex items-end justify-between gap-3"><div><p className="font-bold text-[#285e45]">{fmt(priceOf(product))}</p>{product.salePrice != null && <p className="text-xs text-[#8a938d] line-through">{fmt(product.price)}</p>}</div><span className="pb-1 text-xs text-[#78847c]">{product.packageSize}</span></div></div></Link></article>;
}
function PageFrame({ children }: { children: ReactNode }) { return <><Header />{children}<Footer /></>; }
function HomePage() {
  const { data, isLoading, isError, refetch } = useListProducts({ sort: 'featured' }, { query: { queryKey: getListProductsQueryKey({ sort: 'featured' }) } });
  const featured = data?.slice(0, 4) || [];
  return <PageFrame><main>
    <section className="relative overflow-hidden bg-[#e8eee3]"><div className="shell grid min-h-[540px] items-center gap-8 py-14 md:grid-cols-[1fr_.95fr] md:py-20"><div className="rise relative z-10"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#bd6e46]"><span className="h-px w-7 bg-[#bd6e46]" />Mùa vụ chọn lọc · Việt Nam</p><h1 className="mt-5 max-w-[620px] text-[42px] font-bold leading-[1.08] tracking-[-.045em] text-[#204d39] md:text-[64px]">Nguồn lành<br />cho bữa cơm Việt.</h1><p className="mt-5 max-w-lg text-[15px] leading-7 text-[#5c6c60]">Nông sản có xuất xứ rõ ràng, được chọn từ vùng trồng và giao đến tận nhà bạn.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="btn-primary">Khám phá nông sản <ArrowRight size={17} /></Link><a href="#trace" className="btn-outline">Tìm hiểu Mevi</a></div><div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#52665a]"><span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Nguồn gốc minh bạch</span><span className="inline-flex items-center gap-2"><Truck size={16} /> Đặt hàng tiện lợi</span></div></div><div className="relative rise md:ml-5"><div className="absolute -left-9 top-8 h-40 w-40 rounded-full border border-[#b2c3ad]/60" /><div className="absolute -right-8 bottom-8 h-56 w-56 rounded-full bg-[#d3dfce]" /><div className="relative h-[350px] overflow-hidden rounded-[42%_42%_16px_16px] border-[8px] border-[#f8f6ed] shadow-[0_28px_55px_rgba(48,77,53,.16)] md:h-[435px]"><img src="https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=1400" alt="Nông sản tươi tại chợ địa phương" className="h-full w-full object-cover" /><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-[#faf9f2]/95 p-4 backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a56545]">Từ vùng trồng</p><p className="mt-1 text-sm font-bold">Tươi lành, rõ xuất xứ</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#285e45] text-white"><Leaf size={19} /></span></div></div></div></div></section>
    <section id="trace" className="shell grid gap-8 py-16 md:grid-cols-[.85fr_1.15fr] md:py-24"><div><p className="eyebrow">Mỗi sản phẩm có câu chuyện</p><h2 className="mt-3 max-w-md text-3xl font-bold leading-tight">Biết rõ điều gì<br />đang có trên bàn ăn.</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Mevi kết nối những sản phẩm nông nghiệp có thông tin vùng trồng, quy cách và cách bảo quản rõ ràng. Chọn thực phẩm bằng sự an tâm.</p><Link href="/shop" className="inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#285e45]">Xem sản phẩm <ArrowRight size={16} /></Link></div><div className="grid gap-3 sm:grid-cols-2"><Feature icon={<ShieldCheck />} number="01" title="Nguồn gốc rõ ràng" desc="Thông tin vùng trồng được hiển thị cùng từng sản phẩm." /><Feature icon={<PackageCheck />} number="02" title="Thông tin đầy đủ" desc="Quy cách đóng gói, hạn dùng và hướng dẫn bảo quản." /><Feature icon={<Truck />} number="03" title="Đặt hàng linh hoạt" desc="Đặt trước, thanh toán khi nhận hoặc chuyển khoản trực tiếp." /><Feature icon={<Store />} number="04" title="Đại lý địa phương" desc="Mua qua những cửa hàng được xây dựng bởi đối tác Mevi." /></div></section>
    <section className="bg-[#f0eee5] py-14 md:py-18"><div className="shell"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Được chọn trong mùa này</p><h2 className="mt-2 text-3xl font-bold">Nông sản nổi bật</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex">Tất cả sản phẩm <ArrowRight size={16} /></Link></div>{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : featured.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map(p => <ProductCard key={p.id} product={p} />)}</div> : <Empty title="Sắp có mùa mới" detail="Danh mục sản phẩm đang được cập nhật." />}<Link href="/shop" className="btn-outline mt-6 sm:hidden">Xem tất cả</Link></div></section>
    <section id="wholesale" className="shell py-16 md:py-24"><div className="overflow-hidden rounded-3xl bg-[#214c3a] px-7 py-10 text-[#f5f1e5] md:flex md:items-center md:justify-between md:px-12 md:py-14"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e0a57c]">Cùng tạo giá trị tại địa phương</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-4xl">Đưa nông sản tốt đến gần hơn với cộng đồng của bạn.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#c3d0c5]">Đại lý Mevi sở hữu gian hàng thương hiệu riêng, dễ dàng chia sẻ sản phẩm và theo dõi đơn đặt hàng.</p></div><Link href="/sign-in" className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#eee7d5] px-6 py-3 text-sm font-bold text-[#214c3a] md:ml-8 md:mt-0">Khu vực đại lý <ArrowRight size={16} /></Link></div></section>
  </main></PageFrame>;
}
function Feature({ icon, number, title, desc }: { icon: ReactNode; number: string; title: string; desc: string }) { return <div className="rounded-2xl border border-[#e5e1d5] bg-[#fbfaf5] p-5"><div className="flex items-center justify-between"><span className="text-[#285e45]">{icon}</span><span className="font-mono text-xs text-[#a6a99b]">{number}</span></div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p></div>; }

function CatalogPage() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get('q') || '');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'featured'|'newest'|'price-asc'|'price-desc'>('featured');
  const queryParams = useMemo(() => ({ q: search || undefined, category: category || undefined, sort }), [search, category, sort]);
  const { data, isLoading, isError, refetch } = useListProducts(queryParams, { query: { queryKey: getListProductsQueryKey(queryParams) } });
  const categories = Array.from(new Set((data || []).map(p => p.category).filter(Boolean)));
  const ref = shopRef();
  return <PageFrame><main className="shell py-10 md:py-14"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Mevi / Cửa hàng</p><h1 className="mt-2 text-4xl font-bold">Nông sản chọn lọc</h1><p className="mt-2 text-sm text-muted-foreground">Tìm sản phẩm phù hợp cho bữa ăn và nhu cầu kinh doanh.</p></div>{ref && <div className="rounded-xl border border-[#d7e1d3] bg-[#eef2e9] px-4 py-3 text-xs font-semibold text-[#285e45]" data-testid="text-agency-ref">Bạn đang xem gian hàng đối tác · {ref}</div>}</div><div className="mb-7 grid gap-3 rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-4 md:grid-cols-[1fr_210px_210px]"><label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718077]" size={18} /><input className="field pl-10" placeholder="Tìm theo tên, sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-products" /></label><label className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718077]" size={16} /><select className="field pl-9" value={category} onChange={e => setCategory(e.target.value)} data-testid="select-category"><option value="">Tất cả danh mục</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label><select className="field" value={sort} onChange={e => setSort(e.target.value as typeof sort)} data-testid="select-sort"><option value="featured">Sắp xếp: Nổi bật</option><option value="newest">Mới nhất</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option></select></div>{isLoading ? <Loading /> : isError ? <ErrorState retry={() => refetch()} /> : data?.length ? <><p className="mb-4 text-sm text-muted-foreground" data-testid="text-product-count">{data.length} sản phẩm</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.map(p => <ProductCard key={p.id} product={p} />)}</div></> : <Empty title="Chưa tìm thấy sản phẩm" detail="Thử điều chỉnh từ khóa hoặc chọn danh mục khác." />}</main></PageFrame>;
}
function ProductPage() {
  const [, params] = useRoute('/product/:id'); const id = Number(params?.id || 0);
  const { data: product, isLoading, isError, refetch } = useGetProduct(id, { query: { queryKey: getGetProductQueryKey(id), enabled: !!id } });
  const [added, setAdded] = useState(false);
  if (isLoading) return <PageFrame><main className="shell"><Loading /></main></PageFrame>;
  if (isError || !product) return <PageFrame><main className="shell"><ErrorState retry={() => refetch()} /></main></PageFrame>;
  const add = () => { cartStore.add(product); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <PageFrame><main className="shell py-8 md:py-12"><Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#65756c]" href="/shop"><ArrowLeft size={16} /> Quay lại cửa hàng</Link><div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr]"><div className="overflow-hidden rounded-3xl bg-[#e9eee4]"><img src={product.imageUrls?.[0] || imageFallback} alt={product.name} className="h-full min-h-[330px] w-full object-cover md:min-h-[500px]" data-testid={`img-product-${product.id}`} /></div><div className="py-1"><p className="eyebrow">{product.category} · {product.origin}</p><h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl" data-testid="text-product-name">{product.name}</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">{product.description}</p><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-bold text-[#285e45]">{fmt(priceOf(product))}</span>{product.salePrice != null && <span className="pb-1 text-sm text-muted-foreground line-through">{fmt(product.price)}</span>}</div><p className="mt-2 text-sm text-muted-foreground">Quy cách: {product.packageSize}</p><button className="btn-primary mt-6 w-full sm:w-auto" onClick={add} data-testid="button-add-cart"><ShoppingBag size={18} />{added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}</button><div className="mt-8 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5"><div className="flex items-center gap-2 font-bold"><ShieldCheck size={19} className="text-[#285e45]" /> Thông tin truy xuất</div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Vùng trồng" value={product.origin} /><Detail label="Quy cách đóng gói" value={product.packageSize} /><Detail label="Hạn sử dụng" value={product.shelfLife} /><Detail label="Bảo quản" value={product.storageInstructions} /><Detail label="Mã sản phẩm" value={product.sku} /></dl></div><p className="mt-4 flex items-start gap-2 rounded-xl bg-[#eef1e9] p-4 text-xs leading-5 text-[#506557]"><Banknote size={16} className="mt-0.5 shrink-0" />Mevi ghi nhận đơn đặt trước, không thu tiền trực tuyến. Bạn thanh toán COD hoặc chuyển khoản trực tiếp theo hướng dẫn của nhân viên.</p></div></div></main></PageFrame>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold">{value || 'Đang cập nhật'}</dd></div>; }
function CartPage() {
  const cart = cartStore;
  return <PageFrame><main className="shell py-10 md:py-14"><SectionTitle eyebrow="Đơn đặt hàng" title="Giỏ hàng" desc="Kiểm tra sản phẩm và số lượng trước khi xác nhận thông tin nhận hàng." />{!cart.items.length ? <Empty title="Giỏ hàng đang trống" detail="Chọn nông sản từ cửa hàng để bắt đầu đặt hàng." action={<Link href="/shop" className="btn-primary">Khám phá cửa hàng <ArrowRight size={16} /></Link>} /> : <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]"><div className="surface divide-y divide-[#ece8de]">{cart.items.map(item => <div key={item.productId} className="flex gap-4 p-4 sm:p-5" data-testid={`row-cart-${item.productId}`}><img className="h-20 w-20 rounded-xl object-cover" src={item.product.imageUrls?.[0] || imageFallback} alt={item.product.name} /><div className="min-w-0 flex-1"><Link href={`/product/${item.productId}`} className="font-bold hover:text-[#285e45]">{item.product.name}</Link><p className="mt-1 text-xs text-muted-foreground">{item.product.packageSize}</p><p className="mt-2 font-bold text-[#285e45]">{fmt(priceOf(item.product))}</p></div><div className="flex flex-col items-end justify-between"><button onClick={() => cart.update(item.productId, 0)} className="text-[#a45445]" aria-label="Xóa sản phẩm" data-testid={`button-remove-${item.productId}`}><Trash2 size={17} /></button><div className="flex items-center rounded-lg border border-[#deddd2]"><button className="px-2.5 py-1" onClick={() => cart.update(item.productId, item.quantity - 1)} data-testid={`button-qty-minus-${item.productId}`}>−</button><span className="min-w-7 text-center text-sm">{item.quantity}</span><button className="px-2.5 py-1" onClick={() => cart.update(item.productId, item.quantity + 1)} data-testid={`button-qty-plus-${item.productId}`}>+</button></div></div></div>)}</div><aside className="surface p-5"><h2 className="font-bold">Tóm tắt đơn hàng</h2><div className="mt-4 flex justify-between text-sm"><span>Tạm tính · {cart.count} sản phẩm</span><span>{fmt(cart.total)}</span></div><div className="mt-4 border-t border-[#e9e5db] pt-4"><div className="flex justify-between font-bold"><span>Tổng cộng</span><span className="text-[#285e45]">{fmt(cart.total)}</span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Phí giao hàng (nếu có) sẽ được xác nhận khi liên hệ đơn hàng.</p></div><Link href="/checkout/confirm" className="btn-primary mt-5 w-full">Tiếp tục đặt hàng <ArrowRight size={16} /></Link><Link href="/shop" className="mt-4 block text-center text-xs font-semibold text-[#607368]">Tiếp tục mua sắm</Link></aside></div>}</main></PageFrame>;
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
  return <div className="min-h-[100dvh] bg-[#f4f2e9] md:flex"><aside className={`${open ? 'block' : 'hidden'} fixed inset-y-0 left-0 z-50 w-[260px] bg-[#214c3a] px-5 py-6 text-[#f5f1e5] md:sticky md:block md:h-[100dvh] md:shrink-0`}><Brand inverse /><p className="mb-4 mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#a9c1ae]">Quản trị Mevi</p><nav className="space-y-1">{adminNav.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-white/10 ${window.location.pathname === item.href ? 'bg-white/10 text-white' : 'text-[#d4dfd4]'}`}><Icon size={17} />{item.label}</Link>; })}</nav><Link href="/" className="absolute bottom-6 left-8 flex items-center gap-2 text-xs text-[#c3d0c5]"><ArrowLeft size={14} /> Về cửa hàng</Link></aside><div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#e3e0d5] bg-[#faf9f4]/95 px-5 backdrop-blur md:px-9"><button className="md:hidden" onClick={() => setOpen(!open)} data-testid="button-admin-menu"><Menu /></button><div className="hidden text-sm font-bold md:block">{title}</div><div className="flex items-center gap-3 text-sm"><span className="hidden text-muted-foreground sm:block">Mevi Commerce Hub</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8eee3] text-[#285e45]"><UserRound size={17} /></span></div></header><main className="mx-auto max-w-[1320px] p-5 md:p-9">{children}</main></div></div>;
}
function AdminDashboard() {
  const q = useGetAdminSummary({ query: { queryKey: getGetAdminSummaryQueryKey() } });
  return <AdminShell title="Tổng quan"><SectionTitle eyebrow="Bảng điều khiển" title="Chào bạn, đội ngũ Mevi" desc="Theo dõi hoạt động mới nhất của cửa hàng và các đối tác." />{q.isLoading ? <Loading /> : q.isError || !q.data ? <ErrorState retry={() => q.refetch()} /> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Sản phẩm" value={q.data.productCount} note="Đang có trong danh mục" icon={<Package />} /><Metric label="Chờ duyệt" value={q.data.pendingProducts} note="Cần xem xét" icon={<Clock3 />} /><Metric label="Đơn đặt hàng" value={q.data.orderCount} note={`${q.data.newOrders} đơn mới`} icon={<ShoppingBag />} /><Metric label="Doanh thu" value={fmt(q.data.totalRevenue)} note="Tổng giá trị đơn hoàn tất" icon={<Banknote />} /></div><div className="mt-7 surface overflow-hidden"><div className="flex items-center justify-between p-5"><div><h2 className="font-bold">Đơn hàng gần đây</h2><p className="mt-1 text-xs text-muted-foreground">Những đơn đặt hàng mới nhất trên Mevi</p></div><Link href="/admin/orders" className="text-xs font-bold text-[#285e45]">Tất cả đơn hàng <ArrowRight className="ml-1 inline" size={14} /></Link></div><OrderTable orders={q.data.recentOrders || []} /></div></>}</AdminShell>;
}
function Metric({ label, value, note, icon }: { label: string; value: ReactNode; note: string; icon: ReactNode }) { return <div className="surface p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-muted-foreground">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf1e8] text-[#285e45]">{icon}</span></div><p className="mt-4 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
function OrderTable({ orders }: { orders: Order[] }) { return !orders.length ? <div className="px-5 pb-5"><Empty title="Chưa có đơn hàng" detail="Đơn đặt hàng mới sẽ xuất hiện tại đây." /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Mã đơn','Khách hàng','Ngày đặt','Tổng tiền','Trạng thái'].map(t => <th key={t} className="px-5 py-3 font-semibold">{t}</th>)}</tr></thead><tbody className="divide-y divide-[#ece8de]">{orders.map(order => <tr key={order.id} data-testid={`row-order-${order.id}`}><td className="px-5 py-4 font-mono text-xs font-bold">{order.code}</td><td className="px-5 py-4"><p className="font-semibold">{order.customerName}</p><p className="text-xs text-muted-foreground">{order.phone}</p></td><td className="px-5 py-4 text-muted-foreground">{dateFmt(order.createdAt)}</td><td className="px-5 py-4 font-semibold">{fmt(order.total)}</td><td className="px-5 py-4"><StatusPill status={order.status} /></td></tr>)}</tbody></table></div>; }
function StatusPill({ status }: { status: string }) { return <span className="inline-flex rounded-full bg-[#edf1e8] px-2.5 py-1 text-[11px] font-bold text-[#315d43]" data-testid={`status-${status}`}>{statusLabel(status)}</span>; }
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
            <Link className="rounded-lg p-2 text-[#285e45] hover:bg-[#edf1e8]" href={`/admin/products/${product.id}/edit`} aria-label="Chỉnh sửa sản phẩm" data-testid={`button-edit-product-${product.id}`}><Pencil size={16} /></Link>
            <button className="rounded-lg p-2 text-[#a45445] hover:bg-[#f7e8e4]" onClick={() => remove(product)} disabled={del.isPending} aria-label="Xóa sản phẩm" data-testid={`button-delete-product-${product.id}`}><Trash2 size={16} /></button>
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
  const upload = useRequestUploadUrl();
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
      const signed = await upload.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' } });
      const result = await fetch(signed.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!result.ok) throw new Error('Upload failed');
      setForm(old => ({ ...old, imageUrls: [...old.imageUrls, `/api/storage${signed.objectPath}`] }));
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
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] px-4 py-7 text-center text-sm font-semibold text-[#52665a] hover:border-[#285e45]">
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
  return <AdminShell title="Đơn hàng"><SectionTitle eyebrow="Vận hành" title="Đơn đặt hàng" desc="Theo dõi trạng thái xử lý và liên hệ người nhận để xác nhận giao hàng." /><div className="mb-5 flex flex-wrap gap-2">{options.map(s=><button key={s} className={`rounded-full px-4 py-2 text-xs font-bold ${s===status?'bg-[#285e45] text-white':'border border-[#dcd9ce] bg-[#fffefa] text-[#637268]'}`} onClick={()=>setStatus(s)} data-testid={`filter-order-${s}`}>{s==='all'?'Tất cả':statusLabel(s)}</button>)}</div>{q.isLoading?<Loading/>:q.isError?<ErrorState retry={()=>q.refetch()}/>:!q.data?.length?<Empty title="Không có đơn hàng phù hợp" detail="Các đơn mới sẽ được hiển thị tại đây."/>:<div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Mã đơn','Người nhận','Địa chỉ','Tổng tiền','Trạng thái','Cập nhật'].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody className="divide-y divide-[#ece8de]">{q.data.map(o=><tr key={o.id} data-testid={`row-order-${o.id}`}><td className="px-4 py-4 font-mono text-xs font-bold">{o.code}<p className="mt-1 font-sans font-normal text-muted-foreground">{dateFmt(o.createdAt)}</p></td><td className="px-4 py-4"><p className="font-semibold">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.phone}</p></td><td className="max-w-[230px] px-4 py-4 text-xs leading-5 text-muted-foreground">{o.address}, {o.district}, {o.province}</td><td className="px-4 py-4 font-semibold">{fmt(o.total)}</td><td className="px-4 py-4"><StatusPill status={o.status}/></td><td className="px-4 py-4"><select className="field min-w-[135px] py-2 text-xs" value={o.status} onChange={e=>setOrderStatus(o.id,e.target.value as OrderStatus)} disabled={update.isPending} data-testid={`select-order-status-${o.id}`}>{options.filter(x=>x!=='all').map(x=><option value={x} key={x}>{statusLabel(x)}</option>)}</select></td></tr>)}</tbody></table></div></div>}</AdminShell>;
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
  const upload = useRequestUploadUrl();
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
      const signed = await upload.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' } });
      const result = await fetch(signed.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!result.ok) throw new Error('Upload failed');
      setForm(old => ({ ...old, logoUrl: `/api/storage${signed.objectPath}` }));
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
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] p-3 text-sm font-semibold text-[#52665a]">
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
