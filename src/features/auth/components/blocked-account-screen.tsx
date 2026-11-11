import { ShieldAlert } from 'lucide-react';
import { basePath } from '@/shared/config';

/** Full-screen notice for admin / đại lý accounts, which cannot use the shop storefront. */
export function BlockedAccountScreen() {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="text-base font-semibold">Tài khoản không được phép đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tài khoản quản trị viên hoặc đại lý không thể đăng nhập vào cửa hàng. Vui lòng dùng tài khoản khách hàng.
        </p>
        <button
          type="button"
          onClick={() => window.location.replace(`${basePath}/`)}
          className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
