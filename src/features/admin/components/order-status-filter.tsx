import type { OrderStatusFilter } from '@/features/admin/api/admin.api';
import { statusLabel } from '@/shared/lib/format';

export const orderStatuses = ['new', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'] as const;

export function OrderStatusFilterBar({ value, onChange }: { value: OrderStatusFilter; onChange: (s: OrderStatusFilter) => void }) {
  return <div className="mb-5 flex flex-wrap gap-2">{(['all', ...orderStatuses] as const).map(s =>
    <button key={s} onClick={() => onChange(s)} data-testid={`filter-order-${s}`}
      className={`rounded-full px-4 py-2 text-xs font-bold ${s === value ? 'bg-[#285e45] text-white' : 'border border-[#dcd9ce] bg-[#fffefa] text-[#637268]'}`}>
      {s === 'all' ? 'Tất cả' : statusLabel(s)}
    </button>)}
  </div>;
}
