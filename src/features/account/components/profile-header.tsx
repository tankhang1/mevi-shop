import { Link } from 'wouter';
import { UserRound, Sparkles, LogIn, ShieldCheck, Store } from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/auth.store';

export function ProfileHeader() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-[#214c3a] to-[#2c654d] text-white p-5 md:p-6 shadow-[0_8px_24px_rgba(33,76,58,0.15)]">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur text-white/90 shrink-0">
            <UserRound size={26} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold tracking-tight">Chào bạn!</h2>
            <p className="text-xs text-white/80 mt-0.5">
              Đăng nhập để đồng bộ lịch sử đơn hàng và nhận ưu đãi riêng
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between">
          <Link
            href="/sign-in"
            className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#e0a57c] text-[#214c3a] text-xs font-black hover:bg-[#d8976b] active:scale-[0.98] transition shadow"
            data-testid="btn-account-signin"
          >
            <LogIn size={15} /> Đăng nhập tài khoản Mevi
          </Link>
        </div>
      </div>
    );
  }

  const initial = user.fullName.split(' ').slice(-1)[0][0]?.toUpperCase() || 'M';
  const roleLabel =
    user.role === 'admin'
      ? 'Quản trị viên'
      : user.role === 'agency'
      ? 'Đại lý Mevi'
      : 'Khách hàng thân thiết';

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#214c3a] to-[#2a5e48] text-white p-5 md:p-6 shadow-[0_8px_24px_rgba(33,76,58,0.15)]">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e0a57c] text-[#214c3a] text-xl font-black shrink-0 shadow-md">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold tracking-tight truncate">
              {user.fullName}
            </h2>
          </div>
          <p className="text-xs text-white/75 mt-0.5">Mã thành viên: #{user.id}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">
            {user.role === 'admin' ? (
              <ShieldCheck size={13} className="text-[#e0a57c]" />
            ) : user.role === 'agency' ? (
              <Store size={13} className="text-[#e0a57c]" />
            ) : (
              <Sparkles size={13} className="text-[#e0a57c]" />
            )}
            <span>{roleLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
