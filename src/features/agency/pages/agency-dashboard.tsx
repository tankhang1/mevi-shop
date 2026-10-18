import { useAgencySummary } from '@/features/agency/api/agency.queries';
import { Banknote, Clock3, ShoppingBag } from 'lucide-react';
import { AgencyShell } from '@/features/agency/components/agency-shell';
import { Metric } from '@/features/agency/components/metric';
import { OrderTable } from '@/features/agency/components/order-table';
import { fmt } from '@/shared/lib/format';
import { Loading, ErrorState } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AgencyDashboard() {
  const q=useAgencySummary();
  return <AgencyShell title="Tổng quan"><SectionTitle eyebrow="Khu vực đại lý" title="Tổng quan gian hàng" desc="Theo dõi đơn hàng được ghi nhận qua cửa hàng đại lý của bạn." />{q.isLoading?<Loading/>:q.isError||!q.data?<ErrorState retry={()=>q.refetch()}/>:<><div className="grid gap-4 sm:grid-cols-3"><Metric label="Đơn đặt hàng" value={q.data.orderCount} note="Tổng đơn qua gian hàng" icon={<ShoppingBag/>}/><Metric label="Đang xử lý" value={q.data.openOrders} note="Đơn chưa hoàn tất" icon={<Clock3/>}/><Metric label="Tổng giá trị" value={fmt(q.data.totalRevenue)} note="Tổng giá trị đơn hàng" icon={<Banknote/>}/></div><div className="surface mt-7 overflow-hidden"><div className="p-5"><h2 className="font-bold">Đơn hàng gần đây</h2></div><OrderTable orders={q.data.recentOrders||[]}/></div></>}</AgencyShell>;
}
