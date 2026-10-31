import { useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Banner } from '@/shared/types';
import { bannerHref } from '@/shared/types';
import { useAdminBanners, useDeleteBanner, useSaveBanner } from '@/features/admin/api/admin.queries';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { BannerForm, linkTypeLabels } from '@/features/admin/components/banner-form';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { toast } from '@/hooks/use-toast';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminBanners() {
  const q = useAdminBanners();
  const save = useSaveBanner();
  const remove = useDeleteBanner();
  // null = closed, 'new' = create form, Banner = editing that banner.
  const [editing, setEditing] = useState<Banner | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [error, setError] = useState('');
  const editId = editing && editing !== 'new' ? editing.id : null;

  const form = editing && <div className="surface mb-6 p-5"><BannerForm key={editId ?? 'new'}
    initial={editing === 'new' ? undefined : editing}
    submitLabel={editing === 'new' ? 'Tạo banner' : 'Lưu thay đổi'} pending={save.isPending} error={error}
    onCancel={() => setEditing(null)}
    onSubmit={input => save.mutate({ id: editId, ...input }, {
      onSuccess: () => { toast({ title: editId ? 'Đã cập nhật banner' : 'Đã tạo banner' }); setEditing(null); setError(''); },
      onError: e => setError(e.message || 'Không thể lưu banner.'),
    })} /></div>;

  return <AdminShell title="Banner">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionTitle eyebrow="Trang chủ" title="Banner quảng cáo" desc="Banner trên trang chủ có thể liên kết tới nhóm sản phẩm, sản phẩm hoặc gian hàng của Đại lý/CTV." />
      <button className="btn-primary" onClick={() => setEditing('new')} data-testid="button-add-banner"><Plus size={16} /> Thêm banner</button>
    </div>
    {editing === 'new' && form}
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} />
      : !q.data?.length ? <Empty title="Chưa có banner" detail="Tạo banner đầu tiên cho trang chủ." />
      : <div className="grid gap-4">{q.data.map(b => <div key={b.id}>
        {editId === b.id ? form : <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center" data-testid={`card-banner-${b.id}`}>
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-52">
            <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${b.fromColor}f2, ${b.toColor}33)` }} />
            <p className="absolute inset-x-3 bottom-2 line-clamp-2 whitespace-pre-line text-sm font-extrabold leading-tight text-white">{b.title}</p>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.active ? 'bg-[#eef1e9] text-[#285e45]' : 'bg-[#efede6] text-[#7a8279]'}`}>{b.active ? 'Đang hiển thị' : 'Đã ẩn'}</span>
              <span className="text-xs text-muted-foreground">Thứ tự {b.sortOrder}</span>
            </div>
            <p className="mt-2 text-sm"><span className="text-muted-foreground">{linkTypeLabels[b.linkType]}:</span> <a href={bannerHref(b)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#285e45]">{b.linkTarget}<ExternalLink size={13} /></a></p>
            <p className="mt-1 text-xs text-muted-foreground">Nút: “{b.ctaLabel}”</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={() => save.mutate({ id: b.id, active: !b.active })} data-testid={`button-toggle-banner-${b.id}`}>{b.active ? 'Ẩn' : 'Hiện'}</button>
            <button className="btn-outline" onClick={() => setEditing(b)} aria-label="Sửa banner" data-testid={`button-edit-banner-${b.id}`}><Pencil size={15} /></button>
            <button className="btn-outline text-red-700" onClick={() => setDeleting(b)} aria-label="Xoá banner" data-testid={`button-delete-banner-${b.id}`}><Trash2 size={15} /></button>
          </div>
        </div>}
      </div>)}</div>}
    <ConfirmDialog open={!!deleting} danger title="Xoá banner?" description="Banner sẽ bị gỡ khỏi trang chủ và không thể khôi phục." confirmLabel="Xoá" pending={remove.isPending}
      onCancel={() => setDeleting(null)}
      onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast({ title: 'Đã xoá banner' }); setDeleting(null); } })} />
  </AdminShell>;
}
