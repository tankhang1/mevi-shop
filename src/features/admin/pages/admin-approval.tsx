import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useAdminProducts, useModerateProduct } from '@/features/admin/api/admin.queries';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { StatusPill } from '@/features/agency/components/order-table';
import { toast } from '@/hooks/use-toast';
import { imageFallback } from '@/shared/config';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminApproval() {
  const q = useAdminProducts('pending');
  const moderate = useModerateProduct();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const review = (id: number, name: string, status: 'approved' | 'rejected') => moderate.mutate({ id, status, rejectionReason: reason || null }, {
    onSuccess: () => { toast({ title: status === 'approved' ? `Đã duyệt “${name}”` : `Đã từ chối “${name}”` }); setRejectId(null); setReason(''); },
    onError: () => toast({ title: 'Không thể cập nhật sản phẩm', variant: 'destructive' }),
  });
  return <AdminShell title="Duyệt sản phẩm">
    <SectionTitle eyebrow="Kiểm duyệt" title="Sản phẩm chờ duyệt" desc="Rà soát thông tin nguồn gốc, quy cách và nội dung trước khi xuất hiện trên cửa hàng." />
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} />
      : !q.data?.length ? <Empty title="Không có sản phẩm cần duyệt" detail="Các sản phẩm gửi lên đã được xử lý." />
      : <div className="grid gap-4">{q.data.map(p => <article key={p.id} className="surface grid gap-5 p-5 md:grid-cols-[150px_1fr_auto]" data-testid={`card-approval-${p.id}`}>
        <img src={p.imageUrls?.[0] || imageFallback} className="h-36 w-full rounded-xl object-cover md:w-[150px]" alt={p.name} />
        <div>
          <div className="flex items-center gap-2"><h2 className="text-lg font-bold">{p.name}</h2><StatusPill status={p.status} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{p.sku} · {p.category} · {p.origin}</p>
          <p className="mt-3 text-sm leading-6">{p.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">Quy cách: {p.packageSize} · Hạn dùng: {p.shelfLife}</p>
          {rejectId === p.id && <div className="mt-4 flex flex-wrap gap-2">
            <input autoFocus className="field max-w-sm" placeholder="Lý do từ chối (bắt buộc)" value={reason} onChange={e => setReason(e.target.value)} data-testid={`input-rejection-reason-${p.id}`} />
            <button className="btn-danger" disabled={!reason.trim() || moderate.isPending} onClick={() => review(p.id, p.name, 'rejected')} data-testid={`button-confirm-reject-${p.id}`}>Xác nhận từ chối</button>
            <button className="btn-outline" onClick={() => { setRejectId(null); setReason(''); }}>Huỷ</button>
          </div>}
        </div>
        <div className="flex gap-2 md:flex-col">
          <button className="btn-primary" disabled={moderate.isPending} onClick={() => review(p.id, p.name, 'approved')} data-testid={`button-approve-${p.id}`}><Check size={16} /> Duyệt</button>
          <button className="btn-outline" onClick={() => setRejectId(p.id)} data-testid={`button-reject-${p.id}`}><X size={16} /> Từ chối</button>
        </div>
      </article>)}</div>}
  </AdminShell>;
}
