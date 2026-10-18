import { useState, type ReactNode } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, Banknote, Clock3, Copy, ExternalLink, Mail, Pencil, Phone, ShoppingBag, Store, TrendingUp } from 'lucide-react';
import type { OrderStatusFilter } from '@/features/admin/api/admin.api';
import { useAdminAgency, useAdminAgencyOrders, useUpdateAgency } from '@/features/admin/api/admin.queries';
import { AdminOrderTable } from '@/features/admin/components/admin-order-table';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { AgencyForm } from '@/features/admin/components/agency-form';
import { AgencyStatusBadge, AgencyToggleButton } from '@/features/admin/components/agency-toggle';
import { OrderStatusFilterBar } from '@/features/admin/components/order-status-filter';
import { Metric } from '@/features/agency/components/metric';
import { toast } from '@/hooks/use-toast';
import { basePath } from '@/shared/config';
import { dateFmt, fmt } from '@/shared/lib/format';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';

const isOpen = (status: string) => !['completed', 'cancelled'].includes(status);

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold">{children}</dd></div>;
}

export function AdminAgencyDetail() {
  const [, params] = useRoute('/admin/agencies/:id');
  const id = Number(params?.id);
  const agencyQ = useAdminAgency(id);
  const allOrdersQ = useAdminAgencyOrders(id, 'all');
  const [status, setStatus] = useState<OrderStatusFilter>('all');
  const ordersQ = useAdminAgencyOrders(id, status);
  const update = useUpdateAgency();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const back = <Link href="/admin/agencies" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={15} /> Danh sách đại lý</Link>;

  if (agencyQ.isLoading) return <AdminShell title="Chi tiết đại lý">{back}<Loading label="Đang tải đại lý" /></AdminShell>;
  if (agencyQ.error && (agencyQ.error as { status?: number }).status === 404 || (!agencyQ.isError && !agencyQ.data))
    return <AdminShell title="Chi tiết đại lý">{back}<Empty title="Không tìm thấy đại lý" detail="Đại lý có thể đã bị xoá hoặc đường dẫn không đúng." action={<Link href="/admin/agencies" className="btn-primary">Về danh sách</Link>} /></AdminShell>;
  if (agencyQ.isError || !agencyQ.data) return <AdminShell title="Chi tiết đại lý">{back}<ErrorState retry={() => agencyQ.refetch()} /></AdminShell>;

  const a = agencyQ.data;
  const orders = allOrdersQ.data ?? [];
  const completed = orders.filter(o => o.status === 'completed');
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  const shareUrl = `${window.location.origin}${basePath}/?ref=${a.slug}`;
  const copyLink = () => navigator.clipboard?.writeText(shareUrl).then(() => toast({ title: 'Đã sao chép link gian hàng' }), () => toast({ title: 'Không thể sao chép', variant: 'destructive' }));

  return <AdminShell title={a.displayName}>
    {back}
    <section className="surface overflow-hidden">
      <div className="h-2" style={{ backgroundColor: a.primaryColor }} />
      <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl text-white" style={{ backgroundColor: a.primaryColor }}>{a.logoUrl ? <img src={a.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store size={26} />}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold" style={{ color: a.primaryColor }} data-testid="text-agency-name">{a.displayName}</h1><AgencyStatusBadge active={a.active} /></div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{a.slug}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <a href={shareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#285e45]"><ExternalLink size={13} /> Gian hàng công khai</a>
              <button onClick={copyLink} className="inline-flex items-center gap-1 text-[#285e45]" data-testid="button-copy-agency-link"><Copy size={13} /> Sao chép link</button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AgencyToggleButton agency={a} className={a.active ? 'btn-outline' : 'btn-primary'} />
          <button className="btn-primary" onClick={() => setEditing(e => !e)} data-testid="button-edit-agency"><Pencil size={15} /> Sửa thông tin</button>
        </div>
      </div>
      {editing && <div className="border-t border-[#ece8de] p-6"><AgencyForm key={a.id + a.slug} initial={a} submitLabel="Lưu thay đổi" pending={update.isPending} error={error}
        onCancel={() => { setEditing(false); setError(''); }}
        onSubmit={input => update.mutate({ id: a.id, ...input }, {
          onSuccess: () => { toast({ title: 'Đã lưu thông tin đại lý' }); setEditing(false); setError(''); },
          onError: e => setError(e.message || 'Không thể lưu thay đổi.'),
        })} /></div>}
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="surface h-fit p-5">
        <h2 className="font-bold">Thông tin liên hệ</h2>
        <dl className="mt-4 grid gap-4 text-sm">
          <InfoRow label="Người liên hệ">{a.contactName || '—'}</InfoRow>
          <InfoRow label="Điện thoại">{a.contactPhone ? <a className="inline-flex items-center gap-1.5 text-[#285e45]" href={`tel:${a.contactPhone}`}><Phone size={14} />{a.contactPhone}</a> : '—'}</InfoRow>
          <InfoRow label="Email">{a.contactEmail ? <a className="inline-flex items-center gap-1.5 text-[#285e45]" href={`mailto:${a.contactEmail}`}><Mail size={14} />{a.contactEmail}</a> : '—'}</InfoRow>
          <InfoRow label="Màu thương hiệu"><span className="inline-flex items-center gap-2"><span className="h-5 w-5 rounded-md border border-black/10" style={{ backgroundColor: a.primaryColor }} /><span className="font-mono text-xs">{a.primaryColor}</span></span></InfoRow>
          <InfoRow label="Logo">{a.logoUrl ? <img src={a.logoUrl} alt="Logo" className="h-14 w-14 rounded-xl object-cover" /> : 'Chưa có logo'}</InfoRow>
          <InfoRow label="Ngày tham gia">{a.createdAt ? dateFmt(a.createdAt) : '—'}</InfoRow>
        </dl>
      </section>

      <div className="min-w-0">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Tổng đơn" value={orders.length} note="Qua link giới thiệu" icon={<ShoppingBag />} />
          <Metric label="Đang xử lý" value={orders.filter(o => isOpen(o.status)).length} note="Chưa hoàn tất" icon={<Clock3 />} />
          <Metric label="Doanh thu" value={fmt(revenue)} note="Đơn hoàn tất" icon={<Banknote />} />
          <Metric label="Giá trị TB" value={fmt(completed.length ? Math.round(revenue / completed.length) : 0)} note="Mỗi đơn hoàn tất" icon={<TrendingUp />} />
        </div>
        <h2 className="mb-4 mt-8 font-bold">Đơn hàng của đại lý</h2>
        <OrderStatusFilterBar value={status} onChange={setStatus} />
        {ordersQ.isLoading ? <Loading /> : ordersQ.isError ? <ErrorState retry={() => ordersQ.refetch()} />
          : !ordersQ.data?.length ? <Empty title="Chưa có đơn hàng" detail="Đơn đặt qua link của đại lý sẽ xuất hiện tại đây." />
          : <AdminOrderTable orders={ordersQ.data} />}
      </div>
    </div>
  </AdminShell>;
}
