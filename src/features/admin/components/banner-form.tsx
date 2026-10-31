import { useState, type FormEvent } from 'react';
import type { BannerInput, BannerLinkType } from '@/shared/types';
import { categoryTiles } from '@/features/home/data';
import { usePublicAgencies } from '@/features/agency/api/agency.queries';
import { useProducts } from '@/features/products/api/products.queries';
import { shops } from '@/features/shops/model/shops';
import { AppSelect } from '@/shared/ui/app-select';
import { Field } from '@/shared/ui/field';

export const emptyBanner: BannerInput = {
  tag: '', title: '', description: '', ctaLabel: 'Mua ngay', imageUrl: '', fromColor: '#214c3a', toColor: '#5f8f6e',
  linkType: 'category', linkTarget: categoryTiles[0].name, active: true, sortOrder: 1,
};

export const linkTypeLabels: Record<BannerLinkType, string> = { category: 'Nhóm sản phẩm', product: 'Sản phẩm', agency: 'Gian hàng Đại lý/CTV', shop: 'Gian hàng nông trại' };
const linkTypes = (Object.keys(linkTypeLabels) as BannerLinkType[]).map(value => ({ value, label: linkTypeLabels[value] }));
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

interface BannerFormProps {
  initial?: BannerInput;
  submitLabel: string;
  pending?: boolean;
  error?: string;
  onSubmit: (input: BannerInput) => void;
  onCancel: () => void;
}

export function BannerForm({ initial = emptyBanner, submitLabel, pending, error, onSubmit, onCancel }: BannerFormProps) {
  const [form, setForm] = useState<BannerInput>(initial);
  const [localError, setLocalError] = useState('');
  const { data: products = [] } = useProducts();
  const { data: agencies = [] } = usePublicAgencies();
  const set = (k: keyof BannerInput) => (e: { target: { value: string } }) => setForm(f => ({ ...f, [k]: e.target.value }));

  const targets = form.linkType === 'category' ? categoryTiles.map(c => ({ value: c.name, label: c.name }))
    : form.linkType === 'product' ? products.map(p => ({ value: String(p.id), label: `#${p.id} · ${p.name}` }))
    : form.linkType === 'agency' ? agencies.map(a => ({ value: a.slug, label: `${a.displayName} (${a.slug})` }))
    : shops.map(s => ({ value: s.slug, label: s.name }));
  // Switching link type invalidates the old target, so default to the first option of the new type.
  const changeType = (linkType: BannerLinkType) => setForm(f => ({ ...f, linkType, linkTarget: '' }));
  const target = form.linkTarget || targets[0]?.value || '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!target) return setLocalError('Vui lòng chọn đích liên kết.');
    if (!COLOR_RE.test(form.fromColor) || !COLOR_RE.test(form.toColor)) return setLocalError('Màu phải có dạng #RRGGBB.');
    setLocalError('');
    onSubmit({ ...form, linkTarget: target, sortOrder: Number(form.sortOrder) || 0 });
  };

  return <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" data-testid="form-banner">
    <Field label="Nhãn nhỏ"><input className="field" value={form.tag} onChange={set('tag')} placeholder="Mùa vụ mới · Đà Lạt" data-testid="input-banner-tag" /></Field>
    <Field label="Chữ nút *"><input required className="field" value={form.ctaLabel} onChange={set('ctaLabel')} data-testid="input-banner-cta" /></Field>
    <Field label="Tiêu đề * (xuống dòng bằng Enter)" wide><textarea required rows={2} className="field h-auto py-2.5" value={form.title} onChange={set('title')} data-testid="input-banner-title" /></Field>
    <Field label="Mô tả" wide><textarea rows={2} className="field h-auto py-2.5" value={form.description} onChange={set('description')} data-testid="input-banner-desc" /></Field>
    <Field label="Ảnh nền URL *" wide><input required className="field" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." data-testid="input-banner-image" /></Field>
    <Field label="Liên kết tới"><AppSelect value={form.linkType} onChange={changeType} options={linkTypes} testId="select-banner-link-type" /></Field>
    <Field label={linkTypeLabels[form.linkType]}>{targets.length
      ? <AppSelect value={target} onChange={v => setForm(f => ({ ...f, linkTarget: v }))} options={targets} testId="select-banner-link-target" />
      : <p className="field grid items-center text-muted-foreground">Đang tải...</p>}</Field>
    <Field label="Màu phủ (trái → phải)">
      <div className="flex gap-2"><input type="color" className="field h-11 w-14 shrink-0 p-1" value={form.fromColor} onChange={set('fromColor')} /><input type="color" className="field h-11 w-14 shrink-0 p-1" value={form.toColor} onChange={set('toColor')} /></div>
    </Field>
    <Field label="Thứ tự hiển thị"><input type="number" className="field" value={form.sortOrder} onChange={set('sortOrder')} data-testid="input-banner-order" /></Field>
    <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} data-testid="input-banner-active" />Hiển thị trên trang chủ</label>
    <div className="flex items-end gap-2 sm:col-span-2">
      {(localError || error) && <span className="mr-auto text-sm text-red-700" role="alert">{localError || error}</span>}
      <button type="button" className="btn-outline ml-auto" onClick={onCancel}>Đóng</button>
      <button disabled={pending} className="btn-primary" data-testid="button-save-banner">{pending ? 'Đang lưu...' : submitLabel}</button>
    </div>
  </form>;
}
