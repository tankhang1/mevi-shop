import { Link } from 'wouter';
import { ArrowRight, Banknote, Clock3, Package, ShoppingBag } from 'lucide-react';
import { useAdminSummary } from '@/features/admin/api/admin.queries';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { Metric } from '@/features/agency/components/metric';
import { OrderTable } from '@/features/agency/components/order-table';
import { fmt } from '@/shared/lib/format';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminDashboard() {
  const q = useAdminSummary();
  return <AdminShell title="Tổng quan">
    <SectionTitle eyebrow="Bảng điều khiển" title="Chào bạn, đội ngũ Mevi" desc="Theo dõi hoạt động mới nhất của cửa hàng và các đối tác." />
    {q.isLoading ? <Loading /> : q.isError || !q.data ? <ErrorState retry={() => q.refetch()} /> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Sản phẩm" value={q.data.productCount} note="Đang có trong danh mục" icon={<Package />} />
        <Metric label="Chờ duyệt" value={q.data.pendingProducts} note="Cần xem xét" icon={<Clock3 />} />
        <Metric label="Đơn đặt hàng" value={q.data.orderCount} note={`${q.data.newOrders} đơn mới`} icon={<ShoppingBag />} />
        <Metric label="Doanh thu" value={fmt(q.data.totalRevenue)} note="Tổng giá trị đơn hoàn tất" icon={<Banknote />} />
      </div>
      <div className="surface mt-7 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div><h2 className="font-bold">Đơn hàng gần đây</h2><p className="mt-1 text-xs text-muted-foreground">Những đơn đặt hàng mới nhất trên Mevi</p></div>
          <Link href="/admin/orders" className="text-xs font-bold text-[#285e45]">Tất cả đơn hàng <ArrowRight className="ml-1 inline" size={14} /></Link>
        </div>
        {q.data.recentOrders.length ? <OrderTable orders={q.data.recentOrders} /> : <div className="px-5 pb-5"><Empty title="Chưa có đơn hàng" detail="Đơn mới sẽ xuất hiện tại đây." /></div>}
      </div>
    </>}
  </AdminShell>;
}
