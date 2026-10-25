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
import { fmt, dateFmt, statusLabel } from "@/shared/lib/format";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useCartStore } from "@/features/cart/model/cart.store";
import { useLocation } from "wouter";
import { useState } from "react";

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

  if (!order) return null;

  const handleReorder = () => {
    // Add each order item back to cart using available product data
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.productId,
          name: item.productName,
          sku: `SKU-${item.productId}`,
          category: "Nông sản",
          description: "",
          origin: order.province || "Việt Nam",
          packageSize: "Tiêu chuẩn",
          shelfLife: "12 tháng",
          storageInstructions: "",
          price: item.unitPrice,
          salePrice: null,
          status: "approved",
          createdAt: new Date().toISOString(),
          imageUrls: [],
        },
        item.quantity,
      );
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusLabel(order.status)}
            </span>
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
                { label: "Đã nhận", active: true, icon: Clock },
                {
                  label: "Xác nhận",
                  active: order.status !== "new",
                  icon: Package,
                },
                {
                  label: "Đang giao",
                  active: ["processing", "shipped", "completed"].includes(
                    order.status,
                  ),
                  icon: Truck,
                },
                {
                  label: "Hoàn tất",
                  active: order.status === "completed",
                  icon: Check,
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full grid place-items-center text-xs transition ${
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
                  </div>
                );
              })}
            </div>
          </div>

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
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#214c3a] text-xs truncate">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {fmt(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <strong className="text-xs font-bold text-[#285e45]">
                    {fmt(item.lineTotal)}
                  </strong>
                </div>
              ))}
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
            <p className="text-[11px] text-muted-foreground pt-1">
              Hình thức: Thanh toán COD hoặc chuyển khoản khi nhận hàng.
            </p>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-6 px-4">
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
    </Drawer>
  );
}
