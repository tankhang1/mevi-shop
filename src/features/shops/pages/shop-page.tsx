import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { BadgeCheck, Check, Plus, Star } from "lucide-react";
import { ProductCard } from "@/features/products/components/product-card";
import {
  sortOptions,
  type SortKey,
} from "@/features/products/pages/catalog-page";
import { useProducts } from "@/features/products/api/products.queries";
import { ReviewsBlock } from "@/features/reviews/reviews-block";
import { useShopStats } from "@/features/shops/components/shop-card";
import { shops, shopBySlug } from "@/features/shops/model/shops";
import {
  useStorefront,
  useStorefrontProducts,
} from "@/features/shop/api/shop.queries";
import { summaryToProduct } from "@/features/shop/model/shop-adapter";
import {
  parseStorefrontSlug,
  storefrontPath,
} from "@/features/shop/model/storefront-url";
import { imageFallback } from "@/shared/config";
import { compactNumber } from "@/shared/lib/format";
import { AppSelect } from "@/shared/ui/app-select";
import { Empty, ErrorState, Loading } from "@/shared/ui/feedback";
import { Detail } from "@/shared/ui/field";
import { PageFrame } from "@/shared/ui/layout";

export function ShopPage() {
  const [, params] = useRoute("/shops/:slug");
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";
  const parsed = useMemo(() => parseStorefrontSlug(slug), [slug]);
  const storefrontId = parsed?.id ?? null;

  // Real API queries
  const {
    data: storefront,
    isLoading: isStorefrontLoading,
    isError: isStorefrontError,
    refetch: refetchStorefront,
  } = useStorefront(storefrontId);

  const [page, setPage] = useState(0);
  const {
    data: productsPage,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useStorefrontProducts(storefrontId, { page, size: 24 });

  // Fallback for legacy demo slugs (e.g. nong-trai-da-lat-xanh) when not a real numeric ID
  const legacyShop = useMemo(
    () => (!storefrontId ? shopBySlug(slug) : null),
    [storefrontId, slug],
  );
  const legacyStats = useShopStats(legacyShop ?? shops[0]);
  const [legacySort, setLegacySort] = useState<SortKey>("featured");
  const { data: legacyCatalog } = useProducts({ sort: legacySort });

  const [tab, setTab] = useState<"products" | "reviews" | "about">("products");
  const [following, setFollowing] = useState(false);
  const [location, setLocation] = useLocation();

  // Canonical redirect when handle in URL is missing or stale (Notice 2026-10-28)
  useEffect(() => {
    if (!storefront) return;
    const canonical = storefrontPath({
      id: storefront.id,
      handle: storefront.handle,
    });
    if (location !== canonical && !location.startsWith(`${canonical}?`)) {
      setLocation(canonical, { replace: true });
    }
  }, [storefront, location, setLocation]);

  // Record referral tracking when visiting a real storefront
  useEffect(() => {
    if (storefront?.id) {
      try {
        localStorage.setItem("mevi-storefront-ref", String(storefront.id));
      } catch {
        // storage disabled
      }
    }
  }, [storefront?.id]);

  // Handle loading state for real API
  if (storefrontId && isStorefrontLoading) {
    return (
      <PageFrame>
        <main className="shell py-12">
          <Loading />
        </main>
      </PageFrame>
    );
  }

  // Real Storefront View
  if (storefront) {
    const products = (productsPage?.content || []).map(summaryToProduct);
    const coverUrl =
      storefront.coverImageUrl ||
      "https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?auto=compress&cs=tinysrgb&w=1600";
    const logoUrl = storefront.logoUrl || imageFallback;
    const tabs = [
      { key: "products", label: `Sản phẩm (${storefront.productCount})` },
      { key: "about", label: "Giới thiệu" },
    ] as const;

    return (
      <PageFrame>
        <main className="shell py-6 md:py-10">
          <section className="overflow-hidden rounded-[28px] border border-[#e7e4d9] bg-white">
            <div className="relative h-44 md:h-60">
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35" />
              <nav className="absolute left-6 top-5 flex items-center gap-1.5 text-xs font-semibold text-white/85 md:left-10">
                <Link href="/" className="hover:text-white">
                  Trang chủ
                </Link>
                <span>/</span>
                <Link href="/shops" className="hover:text-white">
                  Gian hàng
                </Link>
                <span>/</span>
                <span className="text-white">{storefront.name}</span>
              </nav>
            </div>

            <div className="flex flex-col gap-5 px-6 pb-7 md:flex-row md:items-end md:justify-between md:px-10">
              <div className="flex items-end gap-5">
                <img
                  src={logoUrl}
                  alt=""
                  className="relative z-10 -mt-12 h-24 w-24 shrink-0 rounded-3xl border-4 border-white object-cover shadow-lg md:-mt-14 md:h-28 md:w-28"
                  style={
                    storefront.brandColor
                      ? { borderColor: storefront.brandColor }
                      : undefined
                  }
                />
                <div className="pb-1 pt-4">
                  <h1
                    className="flex items-center gap-2 text-2xl font-extrabold leading-tight text-[#214c3a] md:text-3xl"
                    data-testid="text-shop-name"
                  >
                    {storefront.name}
                    {storefront.verified && (
                      <BadgeCheck className="text-[#285e45]" />
                    )}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {storefront.slogan ? `${storefront.slogan} · ` : ""}
                    {storefront.province || "Toàn quốc"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className={following ? "btn-outline" : "btn-primary"}
                  onClick={() => setFollowing(!following)}
                  data-testid="button-follow-shop"
                >
                  {following ? (
                    <>
                      <Check size={16} /> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Theo dõi
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-[#ece8de] md:grid-cols-3">
              <div className="border-[#ece8de] px-6 py-4 md:px-10">
                <p className="text-lg font-extrabold text-[#214c3a]">
                  {storefront.productCount}
                </p>
                <p className="text-xs text-muted-foreground">Sản phẩm</p>
              </div>
              <div className="border-l border-[#ece8de] px-6 py-4 md:px-10">
                <p className="text-lg font-extrabold text-[#214c3a]">
                  {compactNumber(
                    storefront.followerCount + (following ? 1 : 0),
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Người theo dõi</p>
              </div>
              <div className="col-span-2 border-t border-[#ece8de] px-6 py-4 md:col-span-1 md:border-l md:border-t-0 md:px-10">
                <p className="text-lg font-extrabold text-[#214c3a]">
                  {storefront.joinedYear
                    ? `Từ ${storefront.joinedYear}`
                    : "Mới tham gia"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Thời gian hoạt động
                </p>
              </div>
            </div>
          </section>

          <div className="sticky top-[74px] z-30 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[#e6e2d7] bg-background/95 px-1 backdrop-blur [scrollbar-width:none]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${
                  tab === t.key
                    ? "border-[#285e45] text-[#285e45]"
                    : "border-transparent text-[#718077] hover:text-[#214c3a]"
                }`}
                data-testid={`tab-shop-${t.key}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "products" && (
            <div className="mt-6">
              {isProductsLoading ? (
                <Loading />
              ) : isProductsError ? (
                <ErrorState retry={() => refetchProducts()} />
              ) : products.length ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <Empty
                  title="Gian hàng chưa có sản phẩm"
                  detail="Đối tác đang hoàn tất chọn các mặt hàng nông sản vào gian hàng."
                />
              )}
            </div>
          )}

          {tab === "about" && (
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="surface p-6">
                <h2 className="text-lg font-extrabold text-[#214c3a]">
                  Về {storefront.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#3d4a42]">
                  {storefront.description ||
                    "Gian hàng đối tác phân phối chính thức các sản phẩm nông sản sạch từ Mevi Farm."}
                </p>
                {products.length > 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {products.slice(0, 3).map((p) => (
                      <img
                        key={p.id}
                        src={p.imageUrls?.[0] || imageFallback}
                        alt={p.name}
                        className="aspect-square w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="surface h-fit p-6">
                <dl className="grid gap-4 text-sm">
                  <Detail
                    label="Khu vực hoạt động"
                    value={storefront.province || "Toàn quốc"}
                  />
                  <Detail
                    label="Tham gia Mevi"
                    value={
                      storefront.joinedYear
                        ? `Từ năm ${storefront.joinedYear}`
                        : "2026"
                    }
                  />
                  <Detail
                    label="Xác minh"
                    value={
                      storefront.verified
                        ? "Đã xác minh nguồn gốc bởi Mevi"
                        : "Gian hàng đối tác Mevi"
                    }
                  />
                </dl>
              </div>
            </div>
          )}
        </main>
      </PageFrame>
    );
  }

  // Legacy mock fallback (keeps old demo links functional)
  if (legacyShop) {
    const products = (legacyCatalog || []).filter((p) =>
      legacyShop.productIds.includes(p.id),
    );
    const { reviews, rating } = legacyStats;
    const tabs = [
      { key: "products", label: `Sản phẩm (${products.length})` },
      { key: "reviews", label: `Đánh giá (${reviews.length})` },
      { key: "about", label: "Giới thiệu" },
    ] as const;

    return (
      <PageFrame>
        <main className="shell py-6 md:py-10">
          <section className="overflow-hidden rounded-[28px] border border-[#e7e4d9] bg-white">
            <div className="relative h-44 md:h-60">
              <img
                src={legacyShop.cover}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35" />
              <nav className="absolute left-6 top-5 flex items-center gap-1.5 text-xs font-semibold text-white/85 md:left-10">
                <Link href="/" className="hover:text-white">
                  Trang chủ
                </Link>
                <span>/</span>
                <Link href="/shops" className="hover:text-white">
                  Gian hàng
                </Link>
                <span>/</span>
                <span className="text-white">{legacyShop.name}</span>
              </nav>
            </div>
            <div className="flex flex-col gap-5 px-6 pb-7 md:flex-row md:items-end md:justify-between md:px-10">
              <div className="flex items-end gap-5">
                <img
                  src={legacyShop.avatar}
                  alt=""
                  className="relative z-10 -mt-12 h-24 w-24 shrink-0 rounded-3xl border-4 border-white object-cover shadow-lg md:-mt-14 md:h-28 md:w-28"
                />
                <div className="pb-1 pt-4">
                  <h1
                    className="flex items-center gap-2 text-2xl font-extrabold leading-tight text-[#214c3a] md:text-3xl"
                    data-testid="text-shop-name"
                  >
                    {legacyShop.name}
                    {legacyShop.verified && (
                      <BadgeCheck className="text-[#285e45]" />
                    )}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {legacyShop.tagline} · {legacyShop.location}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className={following ? "btn-outline" : "btn-primary"}
                  onClick={() => setFollowing(!following)}
                  data-testid="button-follow-shop"
                >
                  {following ? (
                    <>
                      <Check size={16} /> Đang theo dõi
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Theo dõi
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-[#ece8de] md:grid-cols-4">
              {[
                {
                  label: "Đánh giá",
                  value: (
                    <span className="inline-flex items-center gap-1">
                      <Star
                        size={15}
                        fill="currentColor"
                        className="text-[#d4a24c]"
                      />
                      {rating.toFixed(1)}
                    </span>
                  ),
                },
                { label: "Sản phẩm", value: products.length },
                {
                  label: "Người theo dõi",
                  value: compactNumber(
                    legacyShop.followers + (following ? 1 : 0),
                  ),
                },
                {
                  label: "Phản hồi chat",
                  value: `${legacyShop.responseRate}%`,
                },
              ].map((st, n) => (
                <div
                  key={st.label}
                  className={`px-6 py-4 md:px-10 ${n % 2 ? "border-l" : ""} ${n === 2 ? "md:border-l" : ""} border-[#ece8de] ${n > 1 ? "border-t md:border-t-0" : ""}`}
                >
                  <p className="text-lg font-extrabold text-[#214c3a]">
                    {st.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{st.label}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="sticky top-[74px] z-30 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-[#e6e2d7] bg-background/95 px-1 backdrop-blur [scrollbar-width:none]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition ${tab === t.key ? "border-[#285e45] text-[#285e45]" : "border-transparent text-[#718077] hover:text-[#214c3a]"}`}
                data-testid={`tab-shop-${t.key}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "products" && (
            <div className="mt-6">
              <div className="mb-5 flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Sắp xếp</span>
                <AppSelect<SortKey>
                  className="w-[190px]"
                  value={legacySort}
                  onChange={setLegacySort}
                  options={[...sortOptions]}
                  testId="select-shop-sort"
                />
              </div>
              {products.length ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <Empty
                  title="Gian hàng chưa có sản phẩm"
                  detail="Sản phẩm mới đang được cập nhật."
                />
              )}
            </div>
          )}
          {tab === "reviews" && (
            <ReviewsBlock reviews={reviews} products={legacyCatalog} />
          )}
          {tab === "about" && (
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <div className="surface p-6">
                <h2 className="text-lg font-extrabold text-[#214c3a]">
                  Về {legacyShop.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#3d4a42]">
                  {legacyShop.description}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {products.slice(0, 3).map((p) => (
                    <img
                      key={p.id}
                      src={p.imageUrls?.[0] || imageFallback}
                      alt={p.name}
                      className="aspect-square w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </div>
              <div className="surface h-fit p-6">
                <dl className="grid gap-4 text-sm">
                  <Detail label="Địa chỉ" value={legacyShop.location} />
                  <Detail
                    label="Tham gia Mevi"
                    value={`Từ năm ${legacyShop.joined}`}
                  />
                  <Detail
                    label="Tỉ lệ phản hồi"
                    value={`${legacyShop.responseRate}% · thường trong vài giờ`}
                  />
                  <Detail
                    label="Xác minh"
                    value={
                      legacyShop.verified
                        ? "Đã xác minh nguồn gốc bởi Mevi"
                        : "Đang xác minh"
                    }
                  />
                </dl>
              </div>
            </div>
          )}
        </main>
      </PageFrame>
    );
  }

  // Error or Not Found
  return (
    <PageFrame>
      <main className="shell py-12">
        {isStorefrontError ? (
          <Empty
            title="Không tìm thấy gian hàng"
            detail="Gian hàng không tồn tại hoặc đang tạm ngưng hoạt động."
            action={
              <Link href="/shops" className="btn-outline">
                Xem các gian hàng
              </Link>
            }
          />
        ) : (
          <Empty
            title="Không tìm thấy gian hàng"
            detail="Đường dẫn gian hàng không hợp lệ hoặc đã ngừng hoạt động."
            action={
              <Link href="/shops" className="btn-outline">
                Xem các gian hàng
              </Link>
            }
          />
        )}
      </main>
    </PageFrame>
  );
}
