import {
  Check,
  Clock,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  Truck,
  User,
} from "lucide-react";
import type { Order } from "@/shared/types";
import { fmt, dateFmt, dateTimeFmt, statusLabel } from "@/shared/lib/format";
import { BackendError } from "@/shared/api/api-client";
import { useCancelOrder } from "@/features/orders/api/my-orders.queries";
import { carrierLabel } from "@/features/orders/model/shop-order-adapter";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { reorderLine } from "@/features/orders/model/reorder";
import { useCartStore } from "@/features/cart/model/cart.store";
import { useLocation } from "wouter";
import { useState } from "react";
import { useProducts } from "@/features/products/api/products.queries";
import {
  BasicLine,
  OrderItemTrace,
  OrderItemZone,
} from "@/features/orders/components/order-item-trace";
import { USE_REAL_SHOP } from "@/features/products/api/products.api";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const [, setLocation] = useLocation();
  const [reordered, setReordered] = useState(false);
  const addToCart = useCartStore((s) => s.add);
  const { data: products = [] } = useProducts();

  const cancelOrder = useCancelOrder();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  if (!order) return null;

  const confirmCancel = () =>
    cancelOrder.mutate(
      { id: order.id, reason: cancelReason.trim() || undefined },
      {
        onSuccess: () => setCancelOpen(false),
        onError: (e) =>
          setCancelError(
            e instanceof BackendError && e.status === 409
              ? "Đơn đã được xác nhận nên không thể hủy. Vui lòng liên hệ Mevi."
              : "Chưa thể hủy đơn. Vui lòng thử lại.",
          ),
      },
    );

  const handleReorder = () => {
    // Add each order item back to cart using available product data
    order.items.forEach((item) => {
      addToCart(...reorderLine(order, item));
    });

    setReordered(true);
    setTimeout(() => {
      setReordered(false);
      onOpenChange(false);
      setLocation("/cart");
    }, 700);
  };

  const statusColors: Record<Order["status"], { bg: string; text: string }> = {
    new: { bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
    confirmed: { bg: "bg-[#dbeafe]", text: "text-[#1e40af]" },
    processing: { bg: "bg-[#e0e7ff]", text: "text-[#3730a3]" },
    shipped: { bg: "bg-[#ede9fe]", text: "text-[#5b21b6]" },
    completed: { bg: "bg-[#dcfce7]", text: "text-[#166534]" },
    cancelled: { bg: "bg-[#fee2e2]", text: "text-[#991b1b]" },
  };

  const statusStyle = statusColors[order.status] || {
    bg: "bg-muted",
    text: "text-foreground",
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#fffefa] border-[#e6e2d7] max-h-[88vh] rounded-t-[28px] focus:outline-none">
        <DrawerHeader className="text-left pb-3 border-b border-[#ece8de]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-mono font-bold text-[#285e45]">
                Đơn hàng
              </p>
              <DrawerTitle className="text-xl font-mono font-extrabold text-[#214c3a]">
                {order.code}
              </DrawerTitle>
            </div>
            <div className="flex items-center gap-1.5">
              {order.paymentStatus === "PAID" && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#166534]">
                  Đã thanh toán
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
              >
                {statusLabel(order.status)}
              </span>
            </div>
          </div>
          <DrawerDescription className="text-xs text-muted-foreground mt-1">
            Đặt ngày {dateFmt(order.createdAt)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto space-y-5 text-sm">
          {/* Tracking steps visualization */}
          <div className="rounded-2xl bg-[#faf9f4] border border-[#ece8de] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#758179] mb-3">
              Trạng thái vận chuyển
            </p>
            <div className="grid grid-cols-4 gap-1 text-center relative">
              {[
                {
                  label: "Chờ xác nhận",
                  active: true,
                  icon: Clock,
                  at: order.createdAt,
                },
                {
                  label: "Đã lên đơn",
                  active: order.status !== "new",
                  icon: Package,
                  at: order.confirmedAt,
                },
                {
                  label: "Đang giao",
                  active: ["processing", "shipped", "completed"].includes(
                    order.status,
                  ),
                  icon: Truck,
                  at: order.shippingAt,
                },
                {
                  label: "Đã giao hàng",
                  active: order.status === "completed",
                  icon: Check,
                  at: order.deliveredAt,
                },
              ].map((step, idx, steps) => {
                const Icon = step.icon;
                const next = steps[idx + 1];
                // Done segments are solid; the one leading to the current step marches; the rest stay idle.
                const line = !next
                  ? null
                  : next.active
                    ? "bg-[#285e45]"
                    : step.active
                      ? "track-dash"
                      : "track-dash-idle";
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center"
                  >
                    {line && order.status !== "cancelled" && (
                      <span
                        aria-hidden
                        className={`absolute top-[15px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 rounded-full ${line}`}
                      />
                    )}
                    <div
                      className={`relative z-10 h-8 w-8 rounded-full grid place-items-center text-xs transition ${
                        step.active
                          ? "bg-[#285e45] text-white font-bold"
                          : "bg-[#e9e6dd] text-[#8e9992]"
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium ${
                        step.active
                          ? "text-[#285e45] font-bold"
                          : "text-[#8e9992]"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.active && step.at && (
                      <span className="mt-0.5 text-[9px] leading-3 text-[#758179]">
                        {dateTimeFmt(step.at)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {order.status === "cancelled" && (
            <div
              className="rounded-2xl bg-[#fee2e2] p-4 text-xs text-[#991b1b]"
              data-testid="panel-order-cancelled"
            >
              <p className="font-bold">
                Đơn đã hủy
                {order.cancelledAt
                  ? ` lúc ${dateTimeFmt(order.cancelledAt)}`
                  : ""}
              </p>
              {order.cancelReason && (
                <p className="mt-1">Lý do: {order.cancelReason}</p>
              )}
            </div>
          )}

          {(order.shippingCarrier || order.trackingCode) && (
            <div
              className="rounded-2xl border border-[#ece8de] bg-white p-4 space-y-1.5 text-xs text-[#3d5045]"
              data-testid="panel-order-shipping"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#758179]">
                Vận chuyển
              </p>
              {order.shippingCarrier && (
                <p>
                  Đơn vị:{" "}
                  <span className="font-semibold">
                    {carrierLabel(order.shippingCarrier)}
                  </span>
                </p>
              )}
              {order.trackingCode && (
                <p>
                  Mã vận đơn:{" "}
                  <span className="font-mono font-bold">
                    {order.trackingCode}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Delivery Info */}
          <div className="rounded-2xl border border-[#ece8de] bg-white p-4 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#758179]">
              Thông tin nhận hàng
            </p>
            <div className="flex items-start gap-2.5 text-xs text-[#3d5045]">
              <User size={15} className="text-[#285e45] shrink-0 mt-0.5" />
              <span className="font-semibold">{order.customerName}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#3d5045]">
              <Phone size={15} className="text-[#285e45] shrink-0 mt-0.5" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#3d5045]">
              <MapPin size={15} className="text-[#285e45] shrink-0 mt-0.5" />
              <span>
                {order.address}, {order.district}, {order.province}
              </span>
            </div>
            {order.note && (
              <p className="mt-2 text-xs italic text-muted-foreground bg-[#f7f5ed] p-2.5 rounded-xl">
                Ghi chú: {order.note}
              </p>
            )}
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#758179]">
              Sản phẩm ({order.items.length})
            </p>
            <div className="divide-y divide-[#ece8de] rounded-2xl border border-[#ece8de] bg-white overflow-hidden">
              {order.items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                // A chosen garden is known from the moment of ordering, so it shows at every status.
                if (item.farmCode)
                  return (
                    <OrderItemZone
                      key={item.id}
                      item={item}
                      imageUrl={product?.imageUrls?.[0]}
                    />
                  );
                // Demo batch data: never shown for real orders.
                return !USE_REAL_SHOP && order.status === "completed" ? (
                  <OrderItemTrace key={item.id} item={item} product={product} />
                ) : (
                  <BasicLine
                    key={item.id}
                    item={item}
                    imageUrl={product?.imageUrls?.[0]}
                    packageSize={[
                      item.variantLabel ?? product?.packageSize,
                      item.farmName,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                );
              })}
            </div>
          </div>

          {/* Pricing summary */}
          <div className="rounded-2xl bg-[#eef1e9] p-4 space-y-2">
            <div className="flex justify-between text-xs text-[#52645a]">
              <span>Tạm tính ({order.items.length} món):</span>
              <span>{fmt(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#52645a]">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold text-[#285e45]">
                Xác nhận khi gọi
              </span>
            </div>
            <div className="border-t border-[#d8e0d4] pt-2 flex justify-between items-baseline font-bold">
              <span className="text-sm text-[#214c3a]">Tổng thanh toán:</span>
              <span className="text-lg text-[#285e45] font-black">
                {fmt(order.total)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#52645a] pt-1 border-t border-[#d8e0d4]/60">
              <span>Trạng thái thanh toán:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${order.paymentStatus === "PAID" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}
              >
                {order.paymentStatus === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>
            {order.paymentStatus === "PAID" && order.paidAt && (
              <div className="flex justify-between text-xs text-[#52645a]">
                <span>Thời gian thanh toán:</span>
                <span className="text-muted-foreground">
                  {dateTimeFmt(order.paidAt)}
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground pt-1">
              Hình thức: Thanh toán COD hoặc chuyển khoản khi nhận hàng.
            </p>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-6 px-4">
          {USE_REAL_SHOP && order.status === "new" && (
            <button
              type="button"
              onClick={() => {
                setCancelError("");
                setCancelOpen(true);
              }}
              className="w-full h-11 rounded-xl border border-[#e3b9b3] text-[#a7473d] font-bold text-xs hover:bg-[#fbecea] transition"
              data-testid="btn-cancel-order"
            >
              Hủy đơn hàng
            </button>
          )}
          <button
            type="button"
            onClick={handleReorder}
            className="w-full h-11 rounded-xl bg-[#285e45] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1e4d38] active:scale-[0.98] transition shadow-sm"
            data-testid="btn-reorder-sheet"
          >
            {reordered ? (
              <>
                <Check size={16} /> Đã thêm vào giỏ!
              </>
            ) : (
              <>
                <RotateCcw size={16} /> Mua lại đơn này
              </>
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn {order.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Đơn đã hủy không thể khôi phục. Bạn có thể đặt lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            className="field min-h-20 py-2"
            maxLength={1000}
            placeholder="Lý do hủy (không bắt buộc)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            data-testid="input-cancel-reason"
          />
          {cancelError && (
            <p className="text-xs font-semibold text-[#a7473d]" role="alert">
              {cancelError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ đơn</AlertDialogCancel>
            <button
              type="button"
              className="btn-primary"
              disabled={cancelOrder.isPending}
              onClick={confirmCancel}
              data-testid="btn-confirm-cancel"
            >
              {cancelOrder.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
