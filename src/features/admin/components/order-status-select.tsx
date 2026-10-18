import { useState } from 'react';
import type { Order, OrderStatus } from '@/shared/types';
import { useUpdateOrderStatus } from '@/features/admin/api/admin.queries';
import { orderStatuses } from '@/features/admin/components/order-status-filter';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { toast } from '@/hooks/use-toast';
import { statusLabel } from '@/shared/lib/format';
import { AppSelect } from '@/shared/ui/app-select';

const FINAL: OrderStatus[] = ['completed', 'cancelled'];

/** Status picker that never writes directly: every change goes through a confirmation dialog. */
export function OrderStatusSelect({ order }: { order: Order }) {
  const [next, setNext] = useState<OrderStatus | null>(null);
  const update = useUpdateOrderStatus();
  const confirm = () => {
    if (!next) return;
    update.mutate({ id: order.id, status: next }, {
      onSuccess: () => toast({ title: `Đã cập nhật đơn ${order.code}`, description: `Trạng thái: ${statusLabel(next)}` }),
      onError: () => toast({ title: `Không thể cập nhật đơn ${order.code}`, description: 'Trạng thái được giữ nguyên.', variant: 'destructive' }),
      onSettled: () => setNext(null),
    });
  };
  const isFinal = next !== null && FINAL.includes(next);
  return <>
    <AppSelect className="h-9 min-w-[150px] text-xs" value={order.status} onChange={v => v !== order.status && setNext(v)}
      disabled={update.isPending} testId={`select-order-status-${order.id}`}
      options={orderStatuses.map(s => ({ value: s as OrderStatus, label: statusLabel(s) }))} />
    <ConfirmDialog
      open={next !== null}
      title={`Đổi trạng thái đơn ${order.code}?`}
      danger={isFinal}
      pending={update.isPending}
      confirmLabel={next === 'cancelled' ? 'Huỷ đơn' : 'Xác nhận'}
      onCancel={() => setNext(null)}
      onConfirm={confirm}
      description={<div className="space-y-2">
        <p><b className="text-foreground">{statusLabel(order.status)}</b> → <b className="text-foreground">{next ? statusLabel(next) : ''}</b></p>
        <p>Người nhận: {order.customerName} · {order.phone}</p>
        {isFinal && <p className="font-semibold text-[#a7473d]">Không thể hoàn tác sau khi xác nhận.</p>}
      </div>}
    />
  </>;
}
