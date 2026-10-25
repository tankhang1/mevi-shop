import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/shared/types";
import { useCartStore, selectCount } from "@/features/cart/model/cart.store";
import { priceOf } from "@/features/products/product-utils";
import { fmt } from "@/shared/lib/format";
import { ProductQuickBuySheet } from "./product-quick-buy-sheet";

interface ProductMobileActionBarProps {
  product: Product;
}

export function ProductMobileActionBar({
  product,
}: ProductMobileActionBarProps) {
  const cartCount = useCartStore(selectCount);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"cart" | "buy">("cart");

  const openForCart = () => {
    setSheetMode("cart");
    setSheetOpen(true);
  };

  const openForBuy = () => {
    setSheetMode("buy");
    setSheetOpen(true);
  };

  const currentPrice = priceOf(product);

  return (
    <>
      {/* Shopee-style Full-Bleed Fixed Footer for Product Detail */}
      <nav
        aria-label="Thanh thao tác sản phẩm"
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white border-t border-[#e6e2d7] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
        data-testid="product-mobile-action-bar"
      >
        <div className="flex h-[54px] items-stretch">
          {/* Cột 1: Thêm vào giỏ hàng (Icon Giỏ hàng + Badge đếm số lượng) */}
          <button
            type="button"
            onClick={openForCart}
            className="relative flex flex-col items-center justify-center w-[28%] min-w-[84px] border-r border-[#ece8de] text-[#52645a] hover:bg-[#faf9f4] active:bg-[#f0ece1] transition select-none"
            aria-label="Thêm vào giỏ hàng"
            data-testid="btn-action-add-cart"
          >
            <div className="relative">
              <ShoppingCart size={20} className="text-[#285e45]" />
              <span
                className="absolute -top-1 -right-2.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-[#bd6e46] text-white text-[9px] font-black shadow-sm ring-1 ring-white"
                data-testid="badge-action-cart"
              >
                {cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : "+"}
              </span>
            </div>
            <span className="text-[10px] font-semibold mt-1 leading-none text-center text-[#52645a]">
              Thêm vào giỏ
            </span>
          </button>

          {/* Cột 2: Nút "Mua ngay" Lớn Tràn Viền Chuẩn Shopee */}
          <button
            type="button"
            onClick={openForBuy}
            className="flex-1 flex flex-col items-center justify-center bg-[#285e45] text-white hover:bg-[#1e4936] active:brightness-90 transition px-3 select-none"
            aria-label={`Mua ngay với giá ${fmt(currentPrice)}`}
            data-testid="btn-action-buy-now"
          >
            <span className="text-xs font-bold leading-tight uppercase tracking-wider">
              Mua ngay
            </span>
            <span className="text-[12px] font-extrabold text-white/95 leading-tight mt-0.5">
              {fmt(currentPrice)}
            </span>
          </button>
        </div>

        {/* Seamless Safe Area Inset for iOS Home Indicator */}
        <div className="flex h-[env(safe-area-inset-bottom)]">
          <div className="w-[28%] min-w-[84px] bg-white" />
          <div className="flex-1 bg-[#285e45]" />
        </div>
      </nav>

      {/* Quantity / confirmation bottom sheet */}
      <ProductQuickBuySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={product}
        mode={sheetMode}
      />
    </>
  );
}
