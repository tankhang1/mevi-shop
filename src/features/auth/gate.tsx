import { type ReactNode } from 'react';
import { useUser } from '@/lib/mock-auth';
import { Link } from 'wouter';
import { CircleAlert } from 'lucide-react';
import { Brand } from '@/shared/ui/brand';
import { Loading } from '@/shared/ui/feedback';

export function Gate({ role, children }: { role: string; children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) return <Loading label="Đang kiểm tra tài khoản" />;
  if (!isSignedIn) return <div className="grid min-h-[100dvh] place-items-center p-6"><div className="surface max-w-md p-8 text-center"><Brand /><h1 className="mt-6 text-2xl font-bold">Vui lòng đăng nhập</h1><p className="mt-2 text-muted-foreground">Khu vực này dành cho tài khoản nhân sự Mevi.</p><Link className="btn-primary mt-6" href="/sign-in">Đăng nhập</Link></div></div>;
  if ((user.publicMetadata as { role?: string }).role !== role) return <div className="grid min-h-[100dvh] place-items-center"><div className="surface p-8 text-center"><CircleAlert className="mx-auto text-[#bd6e46]" /><h2 className="mt-3 text-xl font-bold">Bạn chưa được cấp quyền</h2><Link className="btn-outline mt-5" href="/">Về trang chủ</Link></div></div>;
  return <>{children}</>;
}
