import { businessTypes, volumeOptions } from '@/features/wholesale/data';
import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check } from 'lucide-react';
import { BusinessType, VolumeKey, WHOLESALE_LEADS_KEY } from '@/features/wholesale/data';
import { AppSelect } from '@/shared/ui/app-select';
import { Field } from '@/shared/ui/field';

export function WholesaleForm() {
  const [values, setValues] = useState({ name: '', business: '', phone: '', email: '', province: '', note: '' });
  const [type, setType] = useState<BusinessType>('agency');
  const [volume, setVolume] = useState<VolumeKey>('lt20');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues(v => ({ ...v, [k]: e.target.value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !values.business.trim() || !values.province.trim()) return setError('Vui lòng điền đủ các trường bắt buộc.');
    if (!/^0\d{9}$/.test(values.phone.replace(/\s/g, ''))) return setError('Số điện thoại cần gồm 10 chữ số, bắt đầu bằng 0.');
    // No backend: keep the lead locally so the demo flow completes.
    try { localStorage.setItem(WHOLESALE_LEADS_KEY, JSON.stringify([{ ...values, type, volume, createdAt: new Date().toISOString() }, ...JSON.parse(localStorage.getItem(WHOLESALE_LEADS_KEY) || '[]')])); } catch { /* storage unavailable */ }
    setError(''); setSent(true);
  };
  if (sent) return <div className="surface grid justify-items-center p-10 text-center" data-testid="wholesale-success"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#eef1e9] text-[#285e45]"><Check size={30} /></span><h3 className="mt-4 text-2xl font-extrabold text-[#214c3a]">Đã nhận thông tin của bạn!</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Chuyên viên Mevi sẽ liên hệ {values.name} qua số {values.phone} trong vòng 24 giờ làm việc để gửi báo giá chi tiết.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><Link href="/shop" className="btn-primary">Xem sản phẩm</Link><button className="btn-outline" onClick={() => { setSent(false); setValues({ name: '', business: '', phone: '', email: '', province: '', note: '' }); }}>Gửi đăng ký khác</button></div></div>;
  return <form onSubmit={submit} className="surface p-6 md:p-8" data-testid="form-wholesale"><h3 className="text-2xl font-extrabold text-[#214c3a]">Đăng ký hợp tác</h3><p className="mt-1 text-sm text-muted-foreground">Nhận báo giá sỉ và tư vấn trong 24 giờ.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Họ và tên" required><input className="field" value={values.name} onChange={set('name')} placeholder="Nguyễn Văn A" data-testid="input-lead-name" /></Field><Field label="Tên cửa hàng / doanh nghiệp" required><input className="field" value={values.business} onChange={set('business')} placeholder="Cửa hàng Xanh" data-testid="input-lead-business" /></Field><Field label="Số điện thoại" required><input className="field" value={values.phone} onChange={set('phone')} inputMode="tel" placeholder="0901 234 567" data-testid="input-lead-phone" /></Field><Field label="Email"><input className="field" type="email" value={values.email} onChange={set('email')} placeholder="ban@email.com" /></Field><Field label="Loại hình kinh doanh" required><AppSelect<BusinessType> value={type} onChange={setType} options={[...businessTypes]} testId="select-lead-type" /></Field><Field label="Tỉnh / thành phố" required><input className="field" value={values.province} onChange={set('province')} placeholder="TP. Hồ Chí Minh" data-testid="input-lead-province" /></Field><Field label="Sản lượng dự kiến" required wide><AppSelect<VolumeKey> value={volume} onChange={setVolume} options={[...volumeOptions]} testId="select-lead-volume" /></Field><Field label="Nhu cầu sản phẩm" wide><textarea className="field min-h-24 resize-y" value={values.note} onChange={set('note')} placeholder="VD: cần 50kg rau củ Đà Lạt mỗi tuần, cà phê rang cho quán..." /></Field></div>{error && <p className="mt-4 text-sm font-semibold text-[#a7473d]">{error}</p>}<button className="btn-primary mt-6 w-full" data-testid="button-submit-lead">Gửi đăng ký <ArrowRight size={16} /></button><p className="mt-3 text-center text-xs text-muted-foreground">Hoặc gọi hotline <b className="text-[#214c3a]">1900 6868</b> (8:00 – 20:00)</p></form>;
}
