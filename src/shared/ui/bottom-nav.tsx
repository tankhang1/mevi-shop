import { memo } from "react";
import { Link, useLocation } from "wouter";
import { Home, PackageCheck, ShoppingCart, User } from "lucide-react";
import { useCartStore, selectCount } from "@/features/cart/model/cart.store";
import { useCustomerOrdersStore } from "@/features/orders/api/customer-orders";

const NAV_TABS = [
  { href: "/", label: "Trang chủ", icon: Home, testId: "bottom-tab-home" },
  {
    href: "/orders",
    label: "Đơn hàng",
    icon: PackageCheck,
    testId: "bottom-tab-orders",
  },
  {
    href: "/cart",
    label: "Giỏ hàng",
    icon: ShoppingCart,
    testId: "bottom-tab-cart",
  },
  {
    href: "/account",
    label: "Tài khoản",
    icon: User,
    testId: "bottom-tab-account",
  },
] as const;

export const BottomNav = memo(function BottomNav() {
  const [location] = useLocation();
  const cartCount = useCartStore(selectCount);
  const activeOrdersCount = useCustomerOrdersStore((s) => s.getActiveCount());

  // Hide Bottom Navigation on Product Detail Page and Checkout Confirmation Form
  // On Product Detail, a dedicated ProductMobileActionBar will be shown instead
  if (location.startsWith("/product/") || location === "/checkout/confirm") {
    return null;
  }

  return (
    <nav
      aria-label="Điều hướng chính trên di động"
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#fffefa]/95 backdrop-blur-lg border-t border-[#e6e2d7] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      data-testid="mobile-bottom-nav"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/"
              ? location === "/"
              : tab.href === "/orders"
                ? location.startsWith("/orders")
                : tab.href === "/cart"
                  ? location.startsWith("/cart")
                  : location.startsWith("/account") ||
                    location.startsWith("/sign-in");

          const badge =
            tab.href === "/cart" && cartCount > 0
              ? cartCount > 99
                ? "99+"
                : cartCount
              : tab.href === "/orders" && activeOrdersCount > 0
                ? activeOrdersCount
                : null;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              data-testid={tab.testId}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition duration-150 select-none ${
                active
                  ? "text-[#285e45] font-bold"
                  : "text-[#66786e] hover:text-[#285e45] font-medium"
              }`}
            >
              <div className="relative">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-xl transition-all duration-150 ${
                    active ? "bg-[#eef1e9] scale-105" : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    className="transition-transform duration-150"
                  />
                </div>

                {badge !== null && (
                  <span
                    className="absolute -top-1 -right-1.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#bd6e46] text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white"
                    data-testid={`${tab.testId}-badge`}
                  >
                    {badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] leading-tight tracking-tight mt-1">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
