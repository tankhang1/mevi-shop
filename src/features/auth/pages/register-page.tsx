import { useState, type FormEvent } from 'react';
import { Redirect } from 'wouter';
import { Check, LogIn } from 'lucide-react';
import { authApi } from '@/features/auth/api/auth.api';
import { registrationApi, type AudienceType } from '@/features/auth/api/registration.api';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { AUTH_PROVIDER } from '@/shared/api/api.env';
import { BackendError } from '@/shared/api/api-client';
import { ROUTES } from '@/shared/constants/routes';
import { Field } from '@/shared/ui/field';
import { PageFrame } from '@/shared/ui/layout';

const PHONE = /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/;
const audiences: { value: AudienceType; label: string }[] = [
  { value: 'individual', label: 'Cá nhân mua lẻ' },
  { value: 'business', label: 'Doanh nghiệp / nhà máy' },
];
const fieldMessages: Record<string, string> = {
  fullName: 'Họ tên không hợp lệ',
  phoneNumber: 'Số điện thoại không hợp lệ',
  email: 'Email không hợp lệ',
  password: 'Mật khẩu không hợp lệ (tối thiểu 8 ký tự, không trùng mật khẩu mặc định)',
};

function errorMessage(e: unknown) {
  if (e instanceof BackendError) {
    if (e.status === 409) return 'Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.';
    if (e.status === 502) return 'Hệ thống tài khoản đang bận. Vui lòng thử lại sau ít phút.';
    const details = Object.keys(e.fieldErrors).map(f => fieldMessages[f]).filter(Boolean);
    if (details.length) return details.join('. ');
  }
  return 'Chưa thể đăng ký. Vui lòng kiểm tra thông tin và thử lại.';
}

export function RegisterPage() {
  const user = useAuthStore(s => s.user);
  const [values, setValues] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' });
  const [audienceType, setAudienceType] = useState<AudienceType>('individual');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const next = new URLSearchParams(window.location.search).get('next') || ROUTES.home;
  const signIn = () => authApi.startLogin(AUTH_PROVIDER, next);
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues(old => ({ ...old, [key]: e.target.value }));

  if (user && !done) return <Redirect to={ROUTES.account} />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const phoneNumber = values.phone.replace(/\s/g, '');
    if (!PHONE.test(phoneNumber)) return setError('Vui lòng nhập số di động Việt Nam hợp lệ.');
    if (values.password.length < 8) return setError('Mật khẩu cần tối thiểu 8 ký tự.');
    if (values.password !== values.confirm) return setError('Mật khẩu nhập lại chưa khớp.');
    setError('');
    setSubmitting(true);
    try {
      if ((await registrationApi.checkPhone(phoneNumber)).exists) return setError('Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.');
      await registrationApi.register({
        fullName: values.fullName.trim(),
        phoneNumber,
        audienceType,
        email: values.email.trim() || undefined,
        password: values.password,
        registrationTarget: 'customer',
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageFrame>
      <main className="shell grid place-items-center py-8 md:py-14">
        <div className="surface w-full max-w-lg p-6 sm:p-8">
          {done ? (
            <div className="text-center" data-testid="panel-register-success">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e5efe5] text-[#285e45]"><Check size={26} /></span>
              <h1 className="mt-4 text-2xl font-extrabold text-[#214c3a]">Đăng ký thành công</h1>
              <p className="mt-2 text-sm text-muted-foreground">Đăng nhập bằng số điện thoại và mật khẩu vừa tạo để tiếp tục mua hàng.</p>
              <button type="button" className="btn-primary mt-6 w-full" onClick={signIn} data-testid="button-register-login"><LogIn size={16} /> Đăng nhập</button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Tài khoản khách hàng</p>
              <h1 className="mt-1 text-2xl font-extrabold text-[#214c3a]">Đăng ký tài khoản Mevi</h1>
              <form onSubmit={submit} className="mt-6 grid gap-4">
                <Field label="Họ và tên" required><input className="field" required maxLength={255} autoComplete="name" value={values.fullName} onChange={set('fullName')} data-testid="input-register-name" /></Field>
                <Field label="Số điện thoại" required><input className="field" required type="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} data-testid="input-register-phone" /></Field>
                <Field label="Email"><input className="field" type="email" maxLength={255} autoComplete="email" value={values.email} onChange={set('email')} data-testid="input-register-email" /></Field>
                <div className="grid gap-2 text-sm font-semibold">
                  Bạn là
                  <div className="grid grid-cols-2 gap-2">
                    {audiences.map(a => (
                      <button key={a.value} type="button" onClick={() => setAudienceType(a.value)} aria-pressed={audienceType === a.value} data-testid={`option-audience-${a.value}`}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${audienceType === a.value ? 'border-[#285e45] bg-[#eef1e9] text-[#214c3a] ring-1 ring-[#285e45]' : 'border-[#deddd2] bg-white text-[#52645a] hover:border-[#285e45]'}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Mật khẩu" required><input className="field" required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={values.password} onChange={set('password')} data-testid="input-register-password" /></Field>
                <Field label="Nhập lại mật khẩu" required><input className="field" required type="password" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} data-testid="input-register-confirm" /></Field>
                {error && <p className="rounded-xl bg-[#fbecea] p-3 text-xs font-semibold text-[#a7473d]" role="alert" data-testid="text-register-error">{error}</p>}
                <button className="btn-primary w-full" disabled={submitting} data-testid="button-register-submit">{submitting ? 'Đang đăng ký...' : 'Đăng ký'}</button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Đã có tài khoản? <button type="button" className="font-bold text-[#285e45] hover:underline" onClick={signIn}>Đăng nhập</button>
              </p>
            </>
          )}
        </div>
      </main>
    </PageFrame>
  );
}
