import { useAgencySettings, useUpdateAgencySettings } from '@/features/agency/api/agency.queries';
import { useEffect, useState, type FormEvent } from 'react';
import { Check, Upload } from 'lucide-react';
import { AgencyShell } from '@/features/agency/components/agency-shell';
import { readAsDataUrl } from '@/shared/lib/file';
import { Loading, ErrorState } from '@/shared/ui/feedback';
import { Field } from '@/shared/ui/field';
import { SectionTitle } from '@/shared/ui/section-title';

export function AgencySettings() {
  const q = useAgencySettings();
  const update = useUpdateAgencySettings();
  const [form, setForm] = useState({ slug: '', displayName: '', logoUrl: '', primaryColor: '#285e45', contactName: '', contactPhone: '', contactEmail: '' });
  const [init, setInit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (q.data && !init) {
      setForm({ slug: q.data.slug, displayName: q.data.displayName, logoUrl: q.data.logoUrl || '', primaryColor: q.data.primaryColor, contactName: q.data.contactName, contactPhone: q.data.contactPhone, contactEmail: q.data.contactEmail });
      setInit(true);
    }
  }, [q.data, init]);

  const uploadLogo = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setMessage('Chọn ảnh JPEG, PNG hoặc WebP nhỏ hơn 8 MB.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const dataUrl = await readAsDataUrl(file);
      setForm(old => ({ ...old, logoUrl: dataUrl }));
      setMessage('Logo đã tải lên. Nhấn lưu để áp dụng.');
    } catch {
      setMessage('Không thể tải logo lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ ...form, logoUrl: form.logoUrl || null }, {
      onSuccess: () => {
        setMessage('Thông tin gian hàng đã được lưu.');
      },
      onError: () => setMessage('Không thể lưu thay đổi. Vui lòng thử lại.'),
    });
  };

  return <AgencyShell title="Cài đặt">
    <SectionTitle eyebrow="Thương hiệu" title="Cài đặt gian hàng" desc="Thông tin này giúp khách hàng nhận diện gian hàng và liên hệ với bạn." />
    {q.isLoading ? <Loading /> : q.isError || !q.data ? <ErrorState retry={() => q.refetch()} /> : <form onSubmit={submit} className="surface grid max-w-3xl gap-4 p-5 sm:grid-cols-2 sm:p-7">
      <Field label="Tên gian hàng" required><input className="field" required value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} data-testid="input-my-agency-name" /></Field>
      <Field label="Đường dẫn gian hàng" required><input className="field" required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} data-testid="input-my-agency-slug" /></Field>
      <Field label="Màu thương hiệu"><input className="field h-11 p-1" type="color" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} data-testid="input-my-agency-color" /></Field>
      <Field label="Logo gian hàng">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] p-3 text-sm font-semibold text-[#52645a]">
          {form.logoUrl && <img src={form.logoUrl} alt="Logo gian hàng hiện tại" className="h-10 w-10 rounded-lg bg-white object-contain p-1" />}
          <span className="inline-flex items-center gap-2"><Upload size={16} />{uploading ? 'Đang tải logo...' : 'Tải logo lên'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => void uploadLogo(e.target.files?.[0])} disabled={uploading} data-testid="input-my-agency-logo" />
        </label>
      </Field>
      <Field label="Người liên hệ"><input className="field" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} data-testid="input-my-agency-contact" /></Field>
      <Field label="Điện thoại"><input className="field" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} data-testid="input-my-agency-phone" /></Field>
      <Field label="Email"><input type="email" className="field" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} data-testid="input-my-agency-email" /></Field>
      <div className="flex items-end justify-between gap-3 sm:col-span-2"><span className="text-xs text-[#285e45]" role="status">{message}</span><button className="btn-primary" disabled={update.isPending || uploading} data-testid="button-save-agency-settings"><Check size={16} />{update.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
    </form>}
  </AgencyShell>;
}

