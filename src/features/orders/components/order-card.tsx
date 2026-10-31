import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Package, RotateCcw, Check } from "lucide-react";
import type { Order } from "@/shared/types";
import { fmt, dateFmt, statusLabel } from "@/shared/lib/format";
import { reorderLine } from "@/features/orders/model/reorder";
import { useCartStore } from "@/features/cart/model/cart.store";
import { OrderDetailSheet } from "./order-detail-sheet";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [reordered, setReordered] = useState(false);
  const [, setLocation] = useLocation();
  const addToCart = useCartStore((s) => s.add);

  const statusColors: Record<
    Order["status"],
    { bg: string; text: string; dot: string }
  > = {
    new: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#d97706]" },
    confirmed: {
      bg: "bg-[#dbeafe]",
      text: "text-[#1e40af]",
      dot: "bg-[#2563eb]",
    },
    processing: {
      bg: "bg-[#e0e7ff]",
      text: "text-[#3730a3]",
      dot: "bg-[#4f46e5]",
    },
    shipped: {
      bg: "bg-[#ede9fe]",
      text: "text-[#5b21b6]",
      dot: "bg-[#7c3aed]",
    },
    completed: {
      bg: "bg-[#dcfce7]",
      text: "text-[#166534]",
      dot: "bg-[#16a34a]",
    },
    cancelled: {
      bg: "bg-[#fee2e2]",
      text: "text-[#991b1b]",
      dot: "bg-[#dc2626]",
    },
  };

  const statusStyle = statusColors[order.status] || {
    bg: "bg-muted",
    text: "text-foreground",
    dot: "bg-muted-foreground",
  };

  const handleReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    order.items.forEach((item) => {
      addToCart(...reorderLine(order, item));
    });

    setReordered(true);
    setTimeout(() => {
      setReordered(false);
      setLocation("/cart");
    }, 700);
  };

  return (
    <>
      <article
        onClick={() => setDetailOpen(true)}
        className="rounded-2xl border border-[#e7e4d9] bg-[#fffefa] p-4 transition shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-[#b4c5b0] hover:shadow-[0_4px_16px_rgba(40,70,50,0.06)] cursor-pointer"
        data-testid={`card-order-${order.id}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ece8de]">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#eef1e9] text-[#285e45]">
              <Package size={15} />
            </span>
            <span className="font-mono text-xs font-black text-[#214c3a]">
              {order.code}
            </span>
            <span className="text-[11px] text-muted-foreground">
              · {dateFmt(order.createdAt)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusLabel(order.status)}
          </span>
        </div>

        {/* Content list preview */}
        <div className="py-3 space-y-1.5">
          {order.items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-[#3c4e43] font-medium truncate max-w-[220px]">
                {item.productName}{" "}
                <span className="text-muted-foreground">×{item.quantity}</span>
              </span>
              <span className="text-muted-foreground shrink-0">
                {fmt(item.lineTotal)}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[11px] text-muted-foreground italic">
              + thêm {order.items.length - 3} sản phẩm khác...
            </p>
          )}
        </div>

        {/* Total & Footer buttons */}
        <div className="pt-3 border-t border-[#ece8de] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground">
              Tổng cộng:
            </span>
            <p className="text-sm font-black text-[#285e45]">
              {fmt(order.total)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReorder}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#285e45] bg-[#f2f6f1] text-[11px] font-bold text-[#285e45] hover:bg-[#e4ece2] active:scale-95 transition"
              data-testid={`btn-reorder-${order.id}`}
            >
              {reordered ? (
                <>
                  <Check size={13} /> Đã thêm
                </>
              ) : (
                <>
                  <RotateCcw size={13} /> Mua lại
                </>
              )}
            </button>

            <span className="inline-flex items-center text-xs font-semibold text-[#667a6f]">
              Chi tiết <ChevronRight size={14} className="ml-0.5" />
            </span>
          </div>
        </div>
      </article>

      <OrderDetailSheet
        order={order}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
