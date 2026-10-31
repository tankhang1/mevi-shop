import { useCartStore, selectCount } from "@/features/cart/model/cart.store";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { homeFor } from "@/features/auth/auth-page";
import { ADMIN_URL } from "@/shared/config";
import { Brand } from "@/shared/ui/brand";

import { BottomNav } from "@/shared/ui/bottom-nav";

export function Header() {
  const [menu, setMenu] = useState(false);
  const { user, signOut } = useAuthStore();
  const cartCount = useCartStore(selectCount);
  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e2d7] bg-[#faf9f4]/95 backdrop-blur-md">
      <div className="shell flex h-[62px] md:h-[74px] items-center justify-between gap-5">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#52645a] md:flex">
          <Link href="/shop" className="hover:text-[#285e45]">
            Cửa hàng
          </Link>
          <Link href="/categories" className="hover:text-[#285e45]">
            Danh mục
          </Link>
          <Link href="/shops" className="hover:text-[#285e45]">
            Gian hàng
          </Link>
          <Link href="/trace" className="hover:text-[#285e45]">
            Truy xuất nguồn gốc
          </Link>
          <Link href="/wholesale" className="hover:text-[#285e45]">
            Khách sỉ & đại lý
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-1 sm:flex">
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noreferrer"
                className="mr-1 inline-flex items-center gap-1.5 rounded-full border border-[#d7e1d3] px-3 py-1.5 text-xs font-bold text-[#285e45] hover:bg-[#eef1e9]"
                data-testid="link-admin"
              >
                <ShieldCheck size={15} /> Trang quản trị
              </a>
              <Link
                href={homeFor(user.role)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-[#214c3a] hover:bg-[#eef1e9]"
                data-testid="link-account"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#285e45] text-xs font-bold text-white">
                  {user.fullName.split(" ").slice(-1)[0][0]?.toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="grid h-9 w-9 place-items-center rounded-full text-[#718077] hover:bg-[#eef1e9] hover:text-[#214c3a]"
                aria-label="Đăng xuất"
                data-testid="button-sign-out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-[#52645a] sm:flex"
              data-testid="link-sign-in"
            >
              <UserRound size={17} /> Đăng nhập
            </Link>
          )}

          {/* Cart Icon on Header (Quick access) */}
          <Link
            href="/cart"
            className="relative grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-full bg-[#eef1e9]"
            style={{ color: "var(--agency-accent)" }}
            aria-label="Giỏ hàng"
            data-testid="link-cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#bd6e46] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle for secondary links */}
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-[#52645a] md:hidden"
            onClick={() => setMenu(!menu)}
            aria-label="Mở menu"
            data-testid="button-menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="grid gap-3 border-t border-[#e6e2d7] px-6 py-4 text-sm md:hidden animate-in slide-in-from-top-2 duration-200">
          <Link href="/shop" onClick={() => setMenu(false)}>
            Cửa hàng nông sản
          </Link>
          <Link href="/categories" onClick={() => setMenu(false)}>
            Danh mục sản phẩm
          </Link>
          <Link href="/shops" onClick={() => setMenu(false)}>
            Gian hàng đối tác
          </Link>
          <Link href="/trace" onClick={() => setMenu(false)}>
            Truy xuất nguồn gốc
          </Link>
          <Link href="/wholesale" onClick={() => setMenu(false)}>
            Khách sỉ & đại lý
          </Link>
          {user ? (
            <>
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#285e45]"
              >
                Trang quản trị Mevi
              </a>
              <button
                className="text-left text-red-600"
                onClick={() => {
                  signOut();
                  setMenu(false);
                }}
              >
                Đăng xuất ({user.fullName})
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setMenu(false)}
              className="font-bold text-[#285e45]"
            >
              Đăng nhập tài khoản
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 md:mt-20 bg-[#214c3a] py-10 md:py-12 text-[#f5f1e5]">
      <div className="shell grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand inverse />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#c3d0c5]">
            Nông sản Việt có nguồn gốc minh bạch, kết nối người trồng với người
            tiêu dùng và đại lý địa phương.
          </p>
        </div>
        <div>
          <p className="font-bold">Mevi Commerce Hub</p>
          <p className="mt-3 text-sm text-[#c3d0c5]">Mua sắm nông sản an tâm</p>
          <p className="mt-2 text-sm text-[#c3d0c5]">
            Đặt hàng · nhận hàng · thanh toán khi nhận
          </p>
        </div>
        <div>
          <p className="font-bold">Dành cho đối tác</p>
          <Link
            className="mt-3 block text-sm text-[#c3d0c5] hover:text-white"
            href="/sign-in"
          >
            Cổng đại lý
          </Link>
          <a className="mt-2 block text-sm text-[#c3d0c5]" href="/wholesale">
            Hợp tác cùng Mevi
          </a>
        </div>
      </div>
      <div className="shell mt-9 border-t border-white/15 pt-5 text-xs text-[#aebeb2]">
        © {new Date().getFullYear()} Mevi. Nông sản Việt, hành trình rõ ràng.
      </div>
    </footer>
  );
}

export function CustomerShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const hideBottomNav =
    location.startsWith("/product/") || location === "/checkout/confirm";

  return (
    // Pad the whole page (not just content) so the fixed mobile bar never covers the footer.
    <div
      className={`min-h-screen flex flex-col bg-[#faf9f4] md:pb-0 ${
        !hideBottomNav
          ? "pb-[calc(4rem+env(safe-area-inset-bottom))]"
          : location.startsWith("/product/")
            ? "pb-[calc(54px+env(safe-area-inset-bottom))]"
            : ""
      }`}
    >
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export function PageFrame({
  children,
}: {
  children: ReactNode;
  hideBottomNav?: boolean;
}) {
  return <>{children}</>;
}
