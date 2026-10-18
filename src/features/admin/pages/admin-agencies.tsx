import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Plus, Search, Store } from 'lucide-react';
import { useAdminAgencies, useCreateAgency } from '@/features/admin/api/admin.queries';
import { AgencyForm } from '@/features/admin/components/agency-form';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { AgencyStatusBadge, AgencyToggleButton } from '@/features/admin/components/agency-toggle';
import { toast } from '@/hooks/use-toast';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

type ActiveFilter = 'all' | 'active' | 'paused';
const filters: { value: ActiveFilter; label: string }[] = [{ value: 'all', label: 'Tất cả' }, { value: 'active', label: 'Hoạt động' }, { value: 'paused', label: 'Tạm dừng' }];

export function AdminAgencies() {
  const q = useAdminAgencies();
  const create = useCreateAgency();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState<ActiveFilter>('all');

  const list = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (q.data ?? []).filter(a =>
      (filter === 'all' || (filter === 'active') === a.active)
      && (!t || [a.displayName, a.slug, a.contactPhone].some(v => v.toLowerCase().includes(t))));
  }, [q.data, term, filter]);

  return <AdminShell title="Đại lý">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionTitle eyebrow="Mạng lưới Mevi" title="Đại lý & gian hàng" desc="Quản lý thông tin liên hệ, trạng thái hoạt động và thương hiệu gian hàng." />
      <button className="btn-primary" onClick={() => setShowForm(s => !s)} data-testid="button-add-agency"><Plus size={16} /> Thêm đại lý</button>
    </div>
    {showForm && <div className="surface mb-6 p-5"><AgencyForm submitLabel="Tạo gian hàng" pending={create.isPending} error={error}
      onCancel={() => setShowForm(false)}
      onSubmit={input => create.mutate(input, {
        onSuccess: a => { toast({ title: `Đã tạo đại lý ${a.displayName}` }); setShowForm(false); setError(''); },
        onError: e => setError(e.message || 'Không thể tạo đại lý. Vui lòng kiểm tra thông tin.'),
      })} /></div>}
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[240px] flex-1 sm:max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718077]" size={17} />
        <input className="field pl-10" placeholder="Tìm theo tên, slug, SĐT..." value={term} onChange={e => setTerm(e.target.value)} data-testid="input-search-agency" /></label>
      <div className="flex gap-2">{filters.map(f => <button key={f.value} onClick={() => setFilter(f.value)} data-testid={`filter-agency-${f.value}`}
        className={`rounded-full px-4 py-2 text-xs font-bold ${f.value === filter ? 'bg-[#285e45] text-white' : 'border border-[#dcd9ce] bg-[#fffefa] text-[#637268]'}`}>{f.label}</button>)}</div>
    </div>
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} />
      : !q.data?.length ? <Empty title="Chưa có đại lý" detail="Tạo gian hàng đại lý đầu tiên để mở rộng mạng lưới." />
      : !list.length ? <Empty title="Không tìm thấy đại lý" detail="Thử từ khoá hoặc bộ lọc khác." />
      : <div className="grid gap-4 lg:grid-cols-2">{list.map(a => <Link key={a.id} href={`/admin/agencies/${a.id}`} className="surface block p-5 transition hover:border-[#285e45]" data-testid={`card-agency-${a.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl text-white" style={{ backgroundColor: a.primaryColor }}>{a.logoUrl ? <img src={a.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store size={21} />}</span>
            <div><h2 className="font-bold">{a.displayName}</h2><p className="text-xs text-muted-foreground">?ref={a.slug}</p></div>
          </div>
          <AgencyStatusBadge active={a.active} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ece8de] pt-4 text-xs">
          <div><p className="text-muted-foreground">Người liên hệ</p><p className="mt-1 font-semibold">{a.contactName || '—'}</p></div>
          <div><p className="text-muted-foreground">Điện thoại</p><p className="mt-1 font-semibold">{a.contactPhone || '—'}</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between"><AgencyToggleButton agency={a} /><span className="text-xs font-bold text-[#285e45]">Xem chi tiết →</span></div>
      </Link>)}</div>}
  </AdminShell>;
}
