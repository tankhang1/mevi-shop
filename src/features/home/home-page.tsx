import { useProducts } from '@/features/products/api/products.queries';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { CategoryTiles } from '@/features/home/components/category-tiles';
import { ProductCard } from '@/features/products/components/product-card';
import { soldOf } from '@/features/products/product-utils';
import { useStorefronts } from '@/features/shop/api/shop.queries';
import { StorefrontCard } from '@/features/shops/components/storefront-card';
import {
  useContentBlocks,
  HomeHeroBanner,
  HomeHighlightsSection,
  HomeFaqSection,
} from '@/features/content-blocks';
import { Loading, ErrorState, Empty } from '@/shared/ui/feedback';
import { PageFrame } from '@/shared/ui/layout';

export function HomePage() {
  const { data, isLoading, isError, refetch } = useProducts({ sort: 'featured' });
  const storefronts = useStorefronts({ sort: 'REVENUE', size: 10 });
  const contentBlocks = useContentBlocks();

  const products = data || [];
  const bestSellers = [...products].sort((a, b) => soldOf(b) - soldOf(a)).slice(0, 8);

  return (
    <PageFrame>
      <main>
        {/* Khối Banner trang chủ */}
        <HomeHeroBanner
          block={contentBlocks.data?.banner}
          isLoading={contentBlocks.isLoading}
        />

        {/* Danh mục nhanh */}
        <CategoryTiles />

        {/* Bán chạy tuần này */}
        <section className="shell mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Được yêu thích nhất</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">
                Bán chạy tuần này
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex"
            >
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <Loading />
          ) : isError ? (
            <ErrorState retry={() => refetch()} />
          ) : bestSellers.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <Empty
              title="Sắp có mùa mới"
              detail="Danh mục sản phẩm đang được cập nhật."
            />
          )}
          <Link href="/shop" className="btn-outline mt-6 w-full sm:hidden">
            Xem tất cả
          </Link>
        </section>

        {/* Gian hàng nổi bật */}
        <section className="shell mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Mua tận gốc</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#214c3a]">
                Gian hàng nổi bật
              </h2>
            </div>
            <Link
              href="/shops"
              className="hidden items-center gap-2 text-sm font-bold text-[#285e45] sm:flex"
            >
              Tất cả gian hàng <ArrowRight size={16} />
            </Link>
          </div>
          {storefronts.isLoading ? (
            <Loading />
          ) : storefronts.isError ? (
            <ErrorState retry={() => storefronts.refetch()} />
          ) : storefronts.data?.content.length ? (
            <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none]">
              {storefronts.data.content.map((s) => (
                <StorefrontCard
                  key={s.id}
                  storefront={s}
                  className="w-[85%] shrink-0 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
                />
              ))}
            </div>
          ) : (
            <Empty
              title="Chưa có gian hàng"
              detail="Các gian hàng đang được cập nhật."
            />
          )}
          <Link href="/shops" className="btn-outline mt-6 w-full sm:hidden">
            Tất cả gian hàng
          </Link>
        </section>

        {/* Khối Nổi bật & Cam kết (tích hợp API public /api/public/shop/content-blocks) */}
        <HomeHighlightsSection block={contentBlocks.data?.highlights} />

        {/* Khối FAQ thường gặp (tích hợp API public /api/public/shop/content-blocks) */}
        <HomeFaqSection block={contentBlocks.data?.faq} />
      </main>
    </PageFrame>
  );
}
