import { useState, type FormEvent } from 'react';
import type { AgencyInput } from '@/shared/types';
import { Field } from '@/shared/ui/field';

export const emptyAgency: AgencyInput = { slug: '', displayName: '', logoUrl: '', primaryColor: '#285e45', contactName: '', contactPhone: '', contactEmail: '' };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

interface AgencyFormProps {
  initial?: AgencyInput;
  submitLabel: string;
  pending?: boolean;
  error?: string;
  onSubmit: (input: AgencyInput) => void;
  onCancel: () => void;
}

export function AgencyForm({ initial = emptyAgency, submitLabel, pending, error, onSubmit, onCancel }: AgencyFormProps) {
  const [form, setForm] = useState<AgencyInput>({ ...initial, logoUrl: initial.logoUrl ?? '' });
  const [localError, setLocalError] = useState('');
  const set = (k: keyof AgencyInput) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [k]: e.target.value }));
  const slugChanged = initial !== emptyAgency && form.slug !== initial.slug;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!SLUG_RE.test(form.slug)) return setLocalError('Slug chỉ gồm chữ thường, số và dấu gạch ngang (vd: dalat-xanh).');
    if (!COLOR_RE.test(form.primaryColor)) return setLocalError('Màu thương hiệu phải có dạng #RRGGBB.');
    setLocalError('');
    onSubmit({ ...form, logoUrl: form.logoUrl?.trim() || null });
  };

  return <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="form-agency">
    <Field label="Tên gian hàng *"><input required className="field" value={form.displayName} onChange={set('displayName')} data-testid="input-agency-name" /></Field>
    <Field label="Slug gian hàng *"><input required className="field" value={form.slug} onChange={set('slug')} placeholder="ten-gian-hang" data-testid="input-agency-slug" /></Field>
    <Field label="Màu thương hiệu">
      <div className="flex gap-2"><input type="color" className="field h-11 w-14 shrink-0 p-1" value={form.primaryColor} onChange={set('primaryColor')} data-testid="input-agency-color" /><input className="field font-mono" value={form.primaryColor} onChange={set('primaryColor')} /></div>
    </Field>
    <Field label="Logo URL"><input className="field" value={form.logoUrl ?? ''} onChange={set('logoUrl')} placeholder="https://..." data-testid="input-agency-logo" /></Field>
    <Field label="Người liên hệ"><input className="field" value={form.contactName} onChange={set('contactName')} data-testid="input-agency-contact" /></Field>
    <Field label="Điện thoại"><input className="field" value={form.contactPhone} onChange={set('contactPhone')} data-testid="input-agency-phone" /></Field>
    <Field label="Email"><input type="email" className="field" value={form.contactEmail} onChange={set('contactEmail')} data-testid="input-agency-email" /></Field>
    {slugChanged && <p className="rounded-xl bg-[#f6efdc] px-3 py-2 text-xs font-semibold text-[#8a5a1f] sm:col-span-2 lg:col-span-3">Đổi slug: link giới thiệu cũ (?ref={initial.slug}) sẽ không còn hiệu lực.</p>}
    <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
      {(localError || error) && <span className="mr-auto text-sm text-red-700" role="alert">{localError || error}</span>}
      <button type="button" className="btn-outline ml-auto" onClick={onCancel}>Đóng</button>
      <button disabled={pending} className="btn-primary" data-testid="button-save-agency">{pending ? 'Đang lưu...' : submitLabel}</button>
    </div>
  </form>;
}
