import { Link } from "wouter";
import {
  PackageCheck,
  MapPin,
  Heart,
  ShieldCheck,
  Store,
  PhoneCall,
  MessageSquare,
  FileText,
  LogOut,
  ChevronRight,
  Clock,
  Truck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  useAuthStore,
  demoUsers,
  type Role,
} from "@/features/auth/model/auth.store";
import { useCustomerOrdersStore } from "@/features/orders/api/customer-orders";
import { ADMIN_URL } from "@/shared/config";

export function AccountMenu() {
  const { user, signIn, signOut } = useAuthStore();
  const orders = useCustomerOrdersStore((s) => s.orders);

  const pendingCount = orders.filter((o) =>
    ["new", "confirmed"].includes(o.status),
  ).length;
  const shippingCount = orders.filter((o) =>
    ["processing", "shipped"].includes(o.status),
  ).length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-5">
      {/* Quick Status Tiles */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <Link
          href="/orders"
          className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-3 shadow-sm hover:border-[#285e45] transition"
        >
          <div className="relative mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#fef3c7] text-[#92400e]">
            <Clock size={18} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#bd6e46] text-[9px] font-black text-white ring-1 ring-white">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#214c3a] block mt-1.5">
            Chờ xử lý
          </span>
        </Link>

        <Link
          href="/orders"
          className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-3 shadow-sm hover:border-[#285e45] transition"
        >
          <div className="relative mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#ede9fe] text-[#5b21b6]">
            <Truck size={18} />
            {shippingCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#bd6e46] text-[9px] font-black text-white ring-1 ring-white">
                {shippingCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#214c3a] block mt-1.5">
            Đang giao
          </span>
        </Link>

        <Link
          href="/orders"
          className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-3 shadow-sm hover:border-[#285e45] transition"
        >
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#dcfce7] text-[#166534]">
            <PackageCheck size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#214c3a] block mt-1.5">
            Đã mua ({completedCount})
          </span>
        </Link>

        <div className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-3 shadow-sm">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#fce7f3] text-[#9d174d]">
            <Sparkles size={18} />
          </div>
          <span className="text-[11px] font-bold text-[#214c3a] block mt-1.5">
            120 M-Xu
          </span>
        </div>
      </div>

      {/* Group 1: Shopping Management */}
      <div className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] overflow-hidden divide-y divide-[#ece8de]">
        <Link
          href="/orders"
          className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">
              <PackageCheck size={17} />
            </span>
            <span className="text-xs font-bold text-[#214c3a]">
              Đơn mua của tôi
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{orders.length} đơn</span>
            <ChevronRight size={15} />
          </div>
        </Link>

        <Link
          href="/shop"
          className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">
              <Store size={17} />
            </span>
            <span className="text-xs font-bold text-[#214c3a]">
              Khám phá cửa hàng nông sản
            </span>
          </div>
          <ChevronRight size={15} className="text-muted-foreground" />
        </Link>

        <Link
          href="/trace"
          className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">
              <ShieldCheck size={17} />
            </span>
            <span className="text-xs font-bold text-[#214c3a]">
              Truy xuất nguồn gốc lô hàng
            </span>
          </div>
          <ChevronRight size={15} className="text-muted-foreground" />
        </Link>
      </div>

      {/* Group 2: Partner / Management Portal */}
      <div className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] overflow-hidden divide-y divide-[#ece8de]">
        {user?.role === "admin" ? (
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition bg-[#f4f7f2]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#285e45] text-white">
                <ShieldCheck size={17} />
              </span>
              <div>
                <span className="text-xs font-bold text-[#285e45]">
                  Trang quản trị hệ thống Mevi
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Quản lý sản phẩm, đơn hàng và đại lý
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-[#285e45]" />
          </a>
        ) : user?.role === "agency" ? (
          <Link
            href="/agency/dashboard"
            className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition bg-[#f4f7f2]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#285e45] text-white">
                <Store size={17} />
              </span>
              <div>
                <span className="text-xs font-bold text-[#285e45]">
                  Cổng quản trị đại lý
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Theo dõi đơn hàng qua link giới thiệu
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-[#285e45]" />
          </Link>
        ) : (
          <Link
            href="/wholesale"
            className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fdf2e9] text-[#bd6e46]">
                <Store size={17} />
              </span>
              <div>
                <span className="text-xs font-bold text-[#214c3a]">
                  Đăng ký làm Đại lý Mevi
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Hưởng chiết khấu hấp dẫn và gian hàng riêng
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </Link>
        )}
      </div>

      {/* Group 3: Help & Support */}
      <div className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] overflow-hidden divide-y divide-[#ece8de]">
        <a
          href="tel:19006868"
          className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eef1e9] text-[#285e45]">
              <PhoneCall size={17} />
            </span>
            <div>
              <span className="text-xs font-bold text-[#214c3a]">
                Hotline hỗ trợ 24/7
              </span>
              <p className="text-[11px] text-muted-foreground">
                1900 6868 (1.000đ/phút)
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#eef1e9] px-2.5 py-1 text-[11px] font-bold text-[#285e45]">
            Gọi ngay
          </span>
        </a>

        <a
          href="https://zalo.me"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-4 hover:bg-[#faf9f4] transition"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
              <MessageSquare size={17} />
            </span>
            <div>
              <span className="text-xs font-bold text-[#214c3a]">
                Chat tư vấn Zalo OA
              </span>
              <p className="text-[11px] text-muted-foreground">
                Phản hồi trong vòng 5 phút
              </p>
            </div>
          </div>
          <ChevronRight size={15} className="text-muted-foreground" />
        </a>
      </div>

      {/* Demo Role Switcher (Convenient for Pair-programming testing) */}
      <div className="rounded-2xl border border-[#e7e4d9] bg-[#faf9f4] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#758179] mb-2.5 flex items-center gap-1.5">
          <UserCheck size={14} /> Chuyển vai trò thử nghiệm:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["customer", "agency", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => signIn(r)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                user?.role === r
                  ? "bg-[#285e45] text-white border-[#285e45] shadow-sm"
                  : "bg-white text-[#52645a] border-[#deddd2] hover:border-[#285e45]"
              }`}
            >
              {r === "admin" ? "Admin" : r === "agency" ? "Đại lý" : "Khách"}
            </button>
          ))}
        </div>
      </div>

      {/* Sign out button */}
      {user && (
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full h-11 rounded-2xl border border-[#ebd6d4] bg-[#fdf2f2] text-[#991b1b] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#fae6e6] transition"
          data-testid="btn-account-logout"
        >
          <LogOut size={15} /> Đăng xuất tài khoản ({user.fullName})
        </button>
      )}
    </div>
  );
}
