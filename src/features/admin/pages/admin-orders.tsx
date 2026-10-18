import { useState } from 'react';
import type { OrderStatusFilter } from '@/features/admin/api/admin.api';
import { useAdminOrders } from '@/features/admin/api/admin.queries';
import { AdminOrderTable } from '@/features/admin/components/admin-order-table';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { OrderStatusFilterBar } from '@/features/admin/components/order-status-filter';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminOrders() {
  const [status, setStatus] = useState<OrderStatusFilter>('all');
  const q = useAdminOrders(status);
  return <AdminShell title="Đơn hàng">
    <SectionTitle eyebrow="Vận hành" title="Đơn đặt hàng" desc="Theo dõi trạng thái xử lý và liên hệ người nhận để xác nhận giao hàng." />
    <OrderStatusFilterBar value={status} onChange={setStatus} />
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} />
      : !q.data?.length ? <Empty title="Không có đơn hàng phù hợp" detail="Các đơn mới sẽ được hiển thị tại đây." />
      : <AdminOrderTable orders={q.data} />}
  </AdminShell>;
}
