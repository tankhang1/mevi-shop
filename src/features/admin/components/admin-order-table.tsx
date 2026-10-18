import type { Order } from '@/shared/types';
import { OrderStatusSelect } from '@/features/admin/components/order-status-select';
import { StatusPill } from '@/features/agency/components/order-table';
import { dateFmt, fmt } from '@/shared/lib/format';

export function AdminOrderTable({ orders }: { orders: Order[] }) {
  return <div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm">
    <thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Mã đơn', 'Người nhận', 'Địa chỉ', 'Tổng tiền', 'Trạng thái', 'Cập nhật'].map(x => <th key={x} className="px-4 py-3">{x}</th>)}</tr></thead>
    <tbody className="divide-y divide-[#ece8de]">{orders.map(o => <tr key={o.id} data-testid={`row-order-${o.id}`}>
      <td className="px-4 py-4 font-mono text-xs font-bold">{o.code}<p className="mt-1 font-sans font-normal text-muted-foreground">{dateFmt(o.createdAt)}</p></td>
      <td className="px-4 py-4"><p className="font-semibold">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.phone}</p></td>
      <td className="max-w-[230px] px-4 py-4 text-xs leading-5 text-muted-foreground">{o.address}, {o.district}, {o.province}</td>
      <td className="px-4 py-4 font-semibold">{fmt(o.total)}</td>
      <td className="px-4 py-4"><StatusPill status={o.status} /></td>
      <td className="px-4 py-4"><OrderStatusSelect order={o} /></td>
    </tr>)}</tbody>
  </table></div></div>;
}
