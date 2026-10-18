import { useState } from 'react';
import type { Agency } from '@/shared/types';
import { useUpdateAgency } from '@/features/admin/api/admin.queries';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { toast } from '@/hooks/use-toast';

export function AgencyStatusBadge({ active }: { active: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${active ? 'bg-[#e4eee4] text-[#285e45]' : 'bg-[#f0e8e1] text-[#976047]'}`}>{active ? 'Đang hoạt động' : 'Tạm dừng'}</span>;
}

/** Activate / pause an agency, always behind a confirmation. */
export function AgencyToggleButton({ agency, className = 'text-xs font-bold text-[#285e45]' }: { agency: Agency; className?: string }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateAgency();
  const pausing = agency.active;
  const confirm = () => update.mutate({ id: agency.id, active: !agency.active }, {
    onSuccess: () => toast({ title: pausing ? `Đã tạm dừng ${agency.displayName}` : `Đã kích hoạt ${agency.displayName}` }),
    onError: () => toast({ title: 'Không thể cập nhật đại lý', variant: 'destructive' }),
    onSettled: () => setOpen(false),
  });
  return <>
    <button className={className} onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }} data-testid={`button-toggle-agency-${agency.id}`}>
      {pausing ? 'Tạm dừng gian hàng' : 'Kích hoạt gian hàng'}
    </button>
    <ConfirmDialog open={open} danger={pausing} pending={update.isPending}
      title={pausing ? `Tạm dừng ${agency.displayName}?` : `Kích hoạt ${agency.displayName}?`}
      description={pausing ? 'Gian hàng và link giới thiệu sẽ ngừng hiển thị thương hiệu đại lý cho khách hàng.' : 'Gian hàng sẽ hiển thị lại với khách hàng qua link giới thiệu.'}
      confirmLabel={pausing ? 'Tạm dừng' : 'Kích hoạt'} onCancel={() => setOpen(false)} onConfirm={confirm} />
  </>;
}
