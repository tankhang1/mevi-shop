import { useProduct } from "@/features/products/api/products.queries";
import { useCartStore } from "@/features/cart/model/cart.store";
import { reviewsOf } from "@/features/reviews/model/reviews";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  ShieldCheck,
  ShoppingBag,
  Sprout,
} from "lucide-react";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ratingOf, soldOf } from "@/features/products/product-utils";
import { ReviewForm } from "@/features/reviews/review-form";
import { ReviewsBlock } from "@/features/reviews/reviews-block";
import { PurchaseOptions, usePurchaseSelection } from "@/features/products/components/purchase-options";
import { farmsOf, kindOf, variantsOf } from "@/shared/lib/product-options";
import { RichText } from "@/shared/ui/rich-text";
import type { Product } from "@/shared/types";
import { fmt } from "@/shared/lib/format";
import { Loading, ErrorState } from "@/shared/ui/feedback";
import { Detail } from "@/shared/ui/field";
import { PageFrame } from "@/shared/ui/layout";
import { Stars } from "@/shared/ui/stars";

import { ProductMobileActionBar } from "@/features/products/components/product-mobile-action-bar";

export function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = Number(params?.id || 0);
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const [reviewVersion, setReviewVersion] = useState(0);

  if (isLoading)
    return (
      <PageFrame hideBottomNav>
        <main className="shell">
          <Loading />
        </main>
      </PageFrame>
    );
  if (isError || !product)
    return (
      <PageFrame hideBottomNav>
        <main className="shell">
          <ErrorState retry={() => refetch()} />
        </main>
      </PageFrame>
    );

  const reviews = reviewsOf(product.id);
  const farms = farmsOf(product);
  return (
    <PageFrame hideBottomNav>
      <main className="shell py-6 md:py-12">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#65756c]"
          href="/shop"
        >
          <ArrowLeft size={16} /> Quay lại cửa hàng
        </Link>
        <div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr]">
          <ProductGallery product={product} />
          <div className="py-1">
            <p className="eyebrow">
              {product.category} · {product.origin}
            </p>
            <h1
              className="mt-3 text-3xl font-bold leading-tight md:text-4xl"
              data-testid="text-product-name"
            >
              {product.name}
            </h1>
            <a
              href="#reviews"
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Stars value={Number(ratingOf(product))} />
              <span className="font-bold text-[#214c3a]">
                {ratingOf(product)}
              </span>
              <span>
                · {reviewsOf(product.id).length} đánh giá · Đã bán{" "}
                {soldOf(product)}
              </span>
            </a>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-bold text-[#285e45]">
                {priceRange(product)}
              </span>
              {variantsOf(product).length === 1 && product.salePrice != null && (
                <span className="pb-1 text-sm text-muted-foreground line-through">
                  {fmt(product.price)}
                </span>
              )}
            </div>
            {/* Desktop: choose options inline. Mobile uses the bottom action bar + sheet. */}
            <DesktopPurchase key={product.id} product={product} />
            <p className="mt-6 text-sm text-muted-foreground md:hidden">
              {variantsOf(product).length} quy cách
              {farms.length > 0 && ` · ${farms.length} vườn`} — chọn khi bấm “Mua ngay”.
            </p>

            {farms.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5" data-testid="section-farms">
                <div className="flex items-center gap-2 font-bold">
                  <Sprout size={19} className="text-[#285e45]" /> Thông tin vườn
                </div>
                <div className="mt-4 grid gap-3">
                  {farms.map((f) => (
                    <div key={f.id} className="rounded-xl bg-[#faf9f4] p-3.5 text-sm">
                      <p className="flex flex-wrap items-center gap-2 font-bold text-[#214c3a]">
                        {f.name}
                        {f.certification && <span className="rounded-full bg-[#eef1e9] px-2 py-0.5 text-[10px] text-[#285e45]">{f.certification}</span>}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Chủ vườn: {f.owner} · {f.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck size={19} className="text-[#285e45]" /> Thông tin
                  truy xuất
                </div>
                <Link
                  href={`/trace?code=${encodeURIComponent(product.sku)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#285e45] hover:underline"
                  data-testid="link-trace-product"
                >
                  Xem hành trình <ArrowRight size={13} />
                </Link>
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <Detail label="Vùng trồng" value={product.origin} />
                <Detail label="Quy cách đóng gói" value={variantsOf(product).map((v) => v.label).join(", ")} />
                <Detail label="Hạn sử dụng" value={product.shelfLife} />
                <Detail label="Bảo quản" value={product.storageInstructions} />
                <Detail label="Mã sản phẩm" value={product.sku} />
              </dl>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#eef1e9] p-4 text-xs leading-5 text-[#506557]">
              <Banknote size={16} className="mt-0.5 shrink-0" />
              Mevi ghi nhận đơn đặt trước, không thu tiền trực tuyến. Bạn thanh
              toán COD hoặc chuyển khoản trực tiếp theo hướng dẫn của nhân viên.
            </p>
          </div>
        </div>
        {product.descriptionHtml && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-extrabold text-[#214c3a]">Thông tin sản phẩm</h2>
            <RichText html={product.descriptionHtml} className="mt-4" />
          </section>
        )}
        <section id="reviews" className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-extrabold text-[#214c3a]">
            Đánh giá sản phẩm
          </h2>
          <ReviewForm
            product={product}
            onSubmitted={() => setReviewVersion((v) => v + 1)}
          />
          <ReviewsBlock key={reviewVersion} reviews={reviews} />
        </section>
      </main>

      {/* Mobile-only Bottom Action Bar */}
      <ProductMobileActionBar product={product} />
    </PageFrame>
  );
}

function priceRange(product: Product) {
  const prices = variantsOf(product).map((v) => v.salePrice ?? v.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  return lo === hi ? fmt(lo) : `${fmt(lo)} – ${fmt(hi)}`;
}

function DesktopPurchase({ product }: { product: Product }) {
  const state = usePurchaseSelection(product);
  const addToCart = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);
  const add = () => {
    const { variantId, farmId, quantity } = state.selection;
    addToCart(product, quantity, { variantId, farmId });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };
  return (
    <div className="mt-6 hidden rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5 md:block">
      <PurchaseOptions product={product} state={state} />
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#ece8de] pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Tạm tính · {kindOf(product) === "farm" ? "nông sản" : "sản phẩm"}</p>
          <p className="text-xl font-black text-[#285e45]">{fmt(state.unitPrice * state.selection.quantity)}</p>
        </div>
        <button className="btn-primary" onClick={add} disabled={!state.canBuy} data-testid="button-add-cart">
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {!state.canBuy ? "Hết hàng" : added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
}
