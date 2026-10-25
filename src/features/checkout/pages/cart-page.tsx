import { useCart } from "@/features/cart/model/cart.store";
import { Link } from "wouter";
import { ArrowRight, Trash2 } from "lucide-react";
import { priceOf } from "@/features/products/product-utils";
import { imageFallback } from "@/shared/config";
import { fmt } from "@/shared/lib/format";
import { Empty } from "@/shared/ui/feedback";
import { PageFrame } from "@/shared/ui/layout";
import { SectionTitle } from "@/shared/ui/section-title";

export function CartPage() {
  const cart = useCart();
  return (
    <PageFrame>
      <main className="shell py-6 md:py-14 pb-28 md:pb-14">
        <SectionTitle
          eyebrow="Đơn đặt hàng"
          title="Giỏ hàng"
          desc="Kiểm tra sản phẩm và số lượng trước khi xác nhận thông tin nhận hàng."
        />
        {!cart.items.length ? (
          <Empty
            title="Giỏ hàng đang trống"
            detail="Chọn nông sản từ cửa hàng để bắt đầu đặt hàng."
            action={
              <Link href="/shop" className="btn-primary">
                Khám phá cửa hàng <ArrowRight size={16} />
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
              <div className="surface divide-y divide-[#ece8de]">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-4 sm:p-5"
                    data-testid={`row-cart-${item.productId}`}
                  >
                    <img
                      className="h-20 w-20 rounded-xl object-cover border border-[#e7e4d9]"
                      src={item.product.imageUrls?.[0] || imageFallback}
                      alt={item.product.name}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="font-bold hover:text-[#285e45] text-sm md:text-base line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.product.packageSize}
                      </p>
                      <p className="mt-2 font-bold text-[#285e45]">
                        {fmt(priceOf(item.product))}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => cart.update(item.productId, 0)}
                        className="text-[#8a968f] hover:text-[#a7473d] p-1"
                        aria-label="Xóa sản phẩm"
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 size={17} />
                      </button>
                      <div className="flex items-center rounded-lg border border-[#deddd2] bg-[#faf9f4]">
                        <button
                          className="px-2.5 py-1 text-[#52645a] hover:bg-white rounded-l-lg transition"
                          onClick={() =>
                            cart.update(item.productId, item.quantity - 1)
                          }
                          data-testid={`button-qty-minus-${item.productId}`}
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2.5 py-1 text-[#52645a] hover:bg-white rounded-r-lg transition"
                          onClick={() =>
                            cart.update(item.productId, item.quantity + 1)
                          }
                          data-testid={`button-qty-plus-${item.productId}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop summary card */}
              <aside className="surface p-5 hidden lg:block sticky top-24">
                <h2 className="font-bold">Tóm tắt đơn hàng</h2>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Tạm tính · {cart.count} sản phẩm</span>
                  <span>{fmt(cart.total)}</span>
                </div>
                <div className="mt-4 border-t border-[#e9e5db] pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-[#285e45]">{fmt(cart.total)}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Phí giao hàng (nếu có) sẽ được xác nhận khi liên hệ đơn
                    hàng.
                  </p>
                </div>
                <Link
                  href="/checkout/confirm"
                  className="btn-primary mt-5 w-full"
                >
                  Tiếp tục đặt hàng <ArrowRight size={16} />
                </Link>
                <Link
                  href="/shop"
                  className="mt-4 block text-center text-xs font-semibold text-[#607368]"
                >
                  Tiếp tục mua sắm
                </Link>
              </aside>
            </div>

            {/* Mobile Sticky Checkout Bar (Fixed right above BottomNav) */}
            <div
              className="fixed bottom-16 inset-x-0 z-40 lg:hidden bg-[#fffefa]/95 backdrop-blur-md border-t border-[#e6e2d7] px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
              data-testid="mobile-cart-sticky-bar"
            >
              <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                <div>
                  <span className="text-[11px] text-muted-foreground">
                    Tổng ({cart.count} món):
                  </span>
                  <p className="text-base font-black text-[#285e45] leading-none mt-0.5">
                    {fmt(cart.total)}
                  </p>
                </div>
                <Link
                  href="/checkout/confirm"
                  className="btn-primary h-11 px-5 text-xs font-bold rounded-xl shadow-sm"
                  data-testid="btn-mobile-checkout"
                >
                  Đặt hàng ngay <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </PageFrame>
  );
}
