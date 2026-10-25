import { useState } from "react";
import { useLocation } from "wouter";
import { Minus, Plus, ShoppingBag, Zap, Check } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore } from "@/features/cart/model/cart.store";
import { priceOf } from "@/features/products/product-utils";
import { fmt } from "@/shared/lib/format";
import { imageFallback } from "@/shared/config";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface ProductQuickBuySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  mode: "cart" | "buy";
}

export function ProductQuickBuySheet({
  open,
  onOpenChange,
  product,
  mode,
}: ProductQuickBuySheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [, setLocation] = useLocation();
  const addToCart = useCartStore((s) => s.add);

  const unitPrice = priceOf(product);
  const lineTotal = unitPrice * quantity;

  const handleMinus = () => setQuantity((q) => Math.max(1, q - 1));
  const handlePlus = () => setQuantity((q) => q + 1);

  const handleConfirm = () => {
    addToCart(product, quantity);

    if (mode === "buy") {
      onOpenChange(false);
      setLocation("/checkout/confirm");
    } else {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onOpenChange(false);
        setQuantity(1);
      }, 700);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#fffefa] border-[#e6e2d7] max-h-[85vh] rounded-t-[28px] focus:outline-none">
        <DrawerHeader className="text-left pb-3 border-b border-[#ece8de]">
          <div className="flex gap-3 items-center">
            <img
              src={product.imageUrls?.[0] || imageFallback}
              alt={product.name}
              className="h-16 w-16 rounded-xl object-cover border border-[#e7e4d9]"
            />
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-base font-bold text-[#214c3a] truncate">
                {product.name}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-[#758179] mt-0.5">
                {product.packageSize} · {product.origin}
              </DrawerDescription>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-extrabold text-[#285e45]">
                  {fmt(unitPrice)}
                </span>
                {product.salePrice != null && (
                  <span className="text-xs text-muted-foreground line-through">
                    {fmt(product.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-5">
          {/* Quantity selector */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#214c3a]">Số lượng đặt</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đóng gói: {product.packageSize}
              </p>
            </div>

            <div className="flex items-center rounded-xl border border-[#deddd2] bg-[#faf9f4] p-1">
              <button
                type="button"
                onClick={handleMinus}
                disabled={quantity <= 1}
                aria-label="Giảm số lượng"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#52645a] hover:bg-white disabled:opacity-35 transition"
                data-testid="btn-qty-minus"
              >
                <Minus size={15} />
              </button>
              <span
                className="min-w-10 text-center font-bold text-sm text-[#214c3a]"
                data-testid="text-sheet-qty"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                aria-label="Tăng số lượng"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#52645a] hover:bg-white transition"
                data-testid="btn-qty-plus"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Subtotal line */}
          <div className="flex items-center justify-between rounded-xl bg-[#eef1e9] p-3.5 text-sm">
            <span className="font-semibold text-[#52645a]">Tạm tính:</span>
            <span
              className="text-lg font-black text-[#285e45]"
              data-testid="text-sheet-total"
            >
              {fmt(lineTotal)}
            </span>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-6 px-4">
          <button
            type="button"
            onClick={handleConfirm}
            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] ${
              mode === "buy"
                ? "bg-[#285e45] text-white hover:bg-[#1e4d38]"
                : added
                  ? "bg-[#407a52] text-white"
                  : "bg-[#bd6e46] text-white hover:bg-[#a55e39]"
            }`}
            data-testid="btn-sheet-confirm"
          >
            {added ? (
              <>
                <Check size={18} /> Đã thêm vào giỏ!
              </>
            ) : mode === "buy" ? (
              <>
                <Zap size={18} /> Mua ngay {fmt(lineTotal)}
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Thêm vào giỏ hàng
              </>
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
