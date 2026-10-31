import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, Zap, Check } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore } from "@/features/cart/model/cart.store";
import { PurchaseOptions, usePurchaseSelection } from "@/features/products/components/purchase-options";
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
  const [added, setAdded] = useState(false);
  const [, setLocation] = useLocation();
  const addToCart = useCartStore((s) => s.add);
  const state = usePurchaseSelection(product);
  const { variantId, farmId, quantity } = state.selection;
  const lineTotal = state.unitPrice * quantity;

  const handleConfirm = () => {
    if (!state.canBuy) return;
    addToCart(product, quantity, { variantId, farmId });
    if (mode === "buy") {
      onOpenChange(false);
      setLocation("/checkout/confirm");
    } else {
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onOpenChange(false);
        state.setQuantity(1);
      }, 700);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#fffefa] border-[#e6e2d7] max-h-[88vh] rounded-t-[28px] focus:outline-none">
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
                {state.variant.label} · {product.origin}
              </DrawerDescription>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-extrabold text-[#285e45]">{fmt(state.unitPrice)}</span>
                {state.variant.salePrice != null && (
                  <span className="text-xs text-muted-foreground line-through">{fmt(state.variant.price)}</span>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-5 overflow-y-auto">
          <PurchaseOptions product={product} state={state} compact />
          <div className="flex items-center justify-between rounded-xl bg-[#eef1e9] p-3.5 text-sm">
            <span className="font-semibold text-[#52645a]">Tạm tính:</span>
            <span className="text-lg font-black text-[#285e45]" data-testid="text-sheet-total">{fmt(lineTotal)}</span>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-6 px-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!state.canBuy}
            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] disabled:opacity-50 ${
              mode === "buy"
                ? "bg-[#285e45] text-white hover:bg-[#1e4d38]"
                : added
                  ? "bg-[#407a52] text-white"
                  : "bg-[#bd6e46] text-white hover:bg-[#a55e39]"
            }`}
            data-testid="btn-sheet-confirm"
          >
            {!state.canBuy ? "Hết hàng" : added ? (
              <><Check size={18} /> Đã thêm vào giỏ!</>
            ) : mode === "buy" ? (
              <><Zap size={18} /> Mua ngay {fmt(lineTotal)}</>
            ) : (
              <><ShoppingBag size={18} /> Thêm vào giỏ hàng</>
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
