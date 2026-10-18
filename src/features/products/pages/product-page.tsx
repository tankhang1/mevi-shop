import { useProduct } from '@/features/products/api/products.queries';
import { useCartStore } from '@/features/cart/model/cart.store';
import { shopOfProduct } from '@/features/shops/model/shops';
import { reviewsOf } from '@/features/reviews/model/reviews';
import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, Banknote, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ProductGallery } from '@/features/products/components/product-gallery';
import { priceOf, ratingOf, soldOf } from '@/features/products/product-utils';
import { ReviewForm } from '@/features/reviews/review-form';
import { ReviewsBlock } from '@/features/reviews/reviews-block';
import { MoreFromShop } from '@/features/shops/components/more-from-shop';
import { ShopCard } from '@/features/shops/components/shop-card';
import { fmt } from '@/shared/lib/format';
import { Loading, ErrorState } from '@/shared/ui/feedback';
import { Detail } from '@/shared/ui/field';
import { PageFrame } from '@/shared/ui/layout';
import { Stars } from '@/shared/ui/stars';

export function ProductPage() {
  const [, params] = useRoute('/product/:id'); const id = Number(params?.id || 0);
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const [added, setAdded] = useState(false);
  const [reviewVersion, setReviewVersion] = useState(0);
  if (isLoading) return <PageFrame><main className="shell"><Loading /></main></PageFrame>;
  if (isError || !product) return <PageFrame><main className="shell"><ErrorState retry={() => refetch()} /></main></PageFrame>;
  const shop = shopOfProduct(product.id);
  const reviews = reviewsOf(product.id);
  const addToCart = useCartStore(s => s.add);
  const add = () => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <PageFrame><main className="shell py-8 md:py-12"><Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#65756c]" href="/shop"><ArrowLeft size={16} /> Quay lại cửa hàng</Link><div className="grid gap-9 lg:grid-cols-[1.05fr_.95fr]"><ProductGallery product={product} /><div className="py-1"><p className="eyebrow">{product.category} · {product.origin}</p><h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl" data-testid="text-product-name">{product.name}</h1><a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground"><Stars value={Number(ratingOf(product))} /><span className="font-bold text-[#214c3a]">{ratingOf(product)}</span><span>· {reviewsOf(product.id).length} đánh giá · Đã bán {soldOf(product)}</span></a><p className="mt-4 text-sm leading-7 text-muted-foreground">{product.description}</p><div className="mt-6 flex items-end gap-3"><span className="text-3xl font-bold text-[#285e45]">{fmt(priceOf(product))}</span>{product.salePrice != null && <span className="pb-1 text-sm text-muted-foreground line-through">{fmt(product.price)}</span>}</div><p className="mt-2 text-sm text-muted-foreground">Quy cách: {product.packageSize}</p><button className="btn-primary mt-6 w-full sm:w-auto" onClick={add} data-testid="button-add-cart"><ShoppingBag size={18} />{added ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}</button>{shop && <div className="mt-6"><ShopCard shop={shop} compact /></div>}<div className="mt-6 rounded-2xl border border-[#e6e2d7] bg-[#fffefa] p-5"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-bold"><ShieldCheck size={19} className="text-[#285e45]" /> Thông tin truy xuất</div><Link href={`/trace?code=${encodeURIComponent(product.sku)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#285e45] hover:underline" data-testid="link-trace-product">Xem hành trình <ArrowRight size={13} /></Link></div><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><Detail label="Vùng trồng" value={product.origin} /><Detail label="Quy cách đóng gói" value={product.packageSize} /><Detail label="Hạn sử dụng" value={product.shelfLife} /><Detail label="Bảo quản" value={product.storageInstructions} /><Detail label="Mã sản phẩm" value={product.sku} /></dl></div><p className="mt-4 flex items-start gap-2 rounded-xl bg-[#eef1e9] p-4 text-xs leading-5 text-[#506557]"><Banknote size={16} className="mt-0.5 shrink-0" />Mevi ghi nhận đơn đặt trước, không thu tiền trực tuyến. Bạn thanh toán COD hoặc chuyển khoản trực tiếp theo hướng dẫn của nhân viên.</p></div></div><section id="reviews" className="mt-14 scroll-mt-24"><h2 className="text-2xl font-extrabold text-[#214c3a]">Đánh giá sản phẩm</h2><ReviewForm product={product} onSubmitted={() => setReviewVersion(v => v + 1)} /><ReviewsBlock key={reviewVersion} reviews={reviews} /></section>{shop && <MoreFromShop shop={shop} excludeId={product.id} />}</main></PageFrame>;
}
