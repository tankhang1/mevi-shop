import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ShoppingBag, ArrowRight, PhoneCall, RefreshCw } from "lucide-react";
import type { Order } from "@/shared/types";
import { PageFrame } from "@/shared/ui/layout";
import { useCustomerOrdersStore } from "@/features/orders/api/customer-orders";
import { OrderCard } from "@/features/orders/components/order-card";
import { OrderLookup } from "@/features/orders/components/order-lookup";

type StatusFilter = "all" | "pending" | "shipping" | "completed" | "cancelled";

export function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = useCustomerOrdersStore((s) => s.orders);
  const initDemoOrders = useCustomerOrdersStore((s) => s.initDemoOrders);

  // Tab definitions
  const tabs = [
    { key: "all" as StatusFilter, label: "Tất cả" },
    { key: "pending" as StatusFilter, label: "Chờ xử lý" },
    { key: "shipping" as StatusFilter, label: "Đang giao" },
    { key: "completed" as StatusFilter, label: "Hoàn tất" },
    { key: "cancelled" as StatusFilter, label: "Đã hủy" },
  ];

  // Filtering logic
  const filteredOrders = useMemo(() => {
    let list = orders;

    // Filter by tab
    if (activeTab === "pending") {
      list = list.filter((o) => ["new", "confirmed"].includes(o.status));
    } else if (activeTab === "shipping") {
      list = list.filter((o) => ["processing", "shipped"].includes(o.status));
    } else if (activeTab === "completed") {
      list = list.filter((o) => o.status === "completed");
    } else if (activeTab === "cancelled") {
      list = list.filter((o) => o.status === "cancelled");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.code.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((it) => it.productName.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [orders, activeTab, searchQuery]);

  // Tab counts
  const countFor = (tab: StatusFilter) => {
    if (tab === "all") return orders.length;
    if (tab === "pending")
      return orders.filter((o) => ["new", "confirmed"].includes(o.status))
        .length;
    if (tab === "shipping")
      return orders.filter((o) => ["processing", "shipped"].includes(o.status))
        .length;
    if (tab === "completed")
      return orders.filter((o) => o.status === "completed").length;
    if (tab === "cancelled")
      return orders.filter((o) => o.status === "cancelled").length;
    return 0;
  };

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
            const count = countFor(tab.key);
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
                {count > 0 && (
                  <span
                    className={`grid h-4 min-w-4 px-1 place-items-center rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-[#eef1e9] text-[#285e45]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3.5">
            {filteredOrders.map((order) => (
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
              {orders.length === 0 && (
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
