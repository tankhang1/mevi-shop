import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { shops, type Shop } from '@/lib/shops';
import { ProductCard } from '@/features/products/components/product-card';
import { useAllProducts } from '@/features/products/product-utils';

export function MoreFromShop({ shop, excludeId }: { shop: Shop; excludeId: number }) {
  const { data } = useAllProducts();
  const items = (data || []).filter(p => shop.productIds.includes(p.id) && p.id !== excludeId).slice(0, 4);
  if (!items.length) return null;
  return <section className="mt-14"><div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-extrabold text-[#214c3a]">Sản phẩm khác của {shop.name}</h2><Link href={`/shops/${shop.slug}`} className="hidden items-center gap-1.5 text-sm font-bold text-[#285e45] sm:flex">Xem shop <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{items.map(p => <ProductCard key={p.id} product={p} />)}</div></section>;
}
