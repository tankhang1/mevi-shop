import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { ShoppingBag, ArrowRight, PhoneCall, RefreshCw } from "lucide-react";
import type { Order } from "@/shared/types";
import { statusLabel } from "@/shared/lib/format";
import { PageFrame } from "@/shared/ui/layout";
import { useCustomerOrdersStore } from "@/features/orders/api/customer-orders";
import { OrderCard } from "@/features/orders/components/order-card";
import { OrderLookup } from "@/features/orders/components/order-lookup";
import { RegisterLink } from "@/features/auth/components/register-link";
import { useMyOrders } from "@/features/orders/api/my-orders.queries";
import { toShopOrderStatus } from "@/features/orders/model/shop-order-adapter";
import { USE_REAL_SHOP } from "@/features/products/api/products.api";
import { login, useAuthStore } from "@/features/auth/model/auth.store";
import { ErrorState, Loading } from "@/shared/ui/feedback";

type StatusFilter = "all" | Order["status"] | "returned";

// One tab per backend status, labelled exactly like the order badge.
const STATUS_TABS: Exclude<StatusFilter, "all">[] = ["new", "confirmed", "shipped", "completed", "returned", "cancelled"];

const STATUS_PARAM_MAP: Record<string, StatusFilter> = {
  all: "all",
  pending: "new",
  new: "new",
  confirmed: "confirmed",
  shipping: "shipped",
  shipped: "shipped",
  completed: "completed",
  delivered: "completed",
  returned: "returned",
  cancelled: "cancelled",
};

function parseStatusFromSearch(search: string): StatusFilter {
  const param = new URLSearchParams(search).get("status")?.toLowerCase() ?? "";
  return STATUS_PARAM_MAP[param] ?? "all";
}

export function CustomerOrdersPage() {
  const search = useSearch();
  const [activeTab, setActiveTab] = useState<StatusFilter>(() => parseStatusFromSearch(search));
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    setActiveTab(parseStatusFromSearch(search));
  }, [search]);

  // Debounce search input 350ms before calling API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const backendStatus = activeTab !== "all" ? toShopOrderStatus[activeTab] : undefined;

  // Gọi trực tiếp API với status và keyword đã debounce
  const { orders: rawOrders, isLoading, isError, refetch } = useMyOrders({
    status: backendStatus,
    keyword: debouncedQuery,
  });

  const orders = activeTab === "returned"
    ? rawOrders.filter((o) => ["returned", "refunded"].includes(String(o.status)))
    : rawOrders;

  const user = useAuthStore((s) => s.user);
  const initDemoOrders = useCustomerOrdersStore((s) => s.initDemoOrders);

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    ...STATUS_TABS.map((key) => ({
      key,
      label: key === "returned" ? "Hoàn hàng" : statusLabel(key),
    })),
  ];

  return (
    <PageFrame>
      <main className="shell py-5 md:py-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <p className="eyebrow">Lịch sử mua sắm</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-[#214c3a]">
            Đơn hàng của bạn
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Theo dõi tiến trình vận chuyển, kiểm tra chi tiết và mua lại nhanh.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <OrderLookup query={searchQuery} onQueryChange={setSearchQuery} />
        </div>

        {/* Status Horizontal Tabs */}
        <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-[#285e45] text-white shadow-sm"
                    : "bg-white border border-[#e6e2d7] text-[#52645a] hover:border-[#285e45]"
                }`}
                data-testid={`tab-order-status-${tab.key}`}
              >
                <span>{tab.label}</span>
                {isActive && orders.length > 0 && (
                  <span
                    className="grid h-4 min-w-4 px-1 place-items-center rounded-full text-[10px] font-extrabold bg-white/25 text-white"
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        {USE_REAL_SHOP && !user ? (
          <div className="rounded-2xl border border-dashed border-[#d8d5cb] bg-[#fffefa] p-8 text-center my-6">
            <h2 className="text-base font-bold text-[#214c3a]">Đăng nhập để xem đơn hàng</h2>
            <button type="button" className="btn-primary mt-4 text-xs h-10 px-4" onClick={login} data-testid="button-orders-login">Đăng nhập</button>
            <RegisterLink className="btn-outline mt-4 ml-2 text-xs h-10 px-4" />
          </div>
        ) : isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorState retry={() => refetch()} />
        ) : orders.length > 0 ? (
          <div className="space-y-3.5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d8d5cb] bg-[#fffefa] p-8 text-center my-6">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#eef1e9] text-[#285e45] mb-3">
              <ShoppingBag size={22} />
            </span>
            <h2 className="text-base font-bold text-[#214c3a]">
              {searchQuery
                ? "Không tìm thấy đơn hàng phù hợp"
                : "Chưa có đơn hàng nào trong mục này"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? "Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng của bạn."
                : "Khám phá ngay các nông sản tươi sạch từ những nhà vườn đối tác của Mevi."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn-primary text-xs h-10 px-4">
                Khám phá cửa hàng <ArrowRight size={14} />
              </Link>
              {!USE_REAL_SHOP && orders.length === 0 && (
                <button
                  type="button"
                  onClick={initDemoOrders}
                  className="btn-outline text-xs h-10 px-4 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Nạp đơn hàng mẫu
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customer Support Banner */}
        <div className="mt-8 rounded-2xl bg-[#f4f2ea] border border-[#e2ded2] p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#285e45] text-white shrink-0">
              <PhoneCall size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#214c3a]">
                Cần hỗ trợ gấp về đơn hàng?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tổng đài viên Mevi sẵn sàng hỗ trợ 24/7
              </p>
            </div>
          </div>
          <a
            href="tel:19006868"
            className="shrink-0 rounded-xl bg-white border border-[#d8d4c7] px-3 py-1.5 text-xs font-bold text-[#285e45] hover:bg-[#eef1e9] transition"
          >
            1900 6868
          </a>
        </div>
      </main>
    </PageFrame>
  );
}
