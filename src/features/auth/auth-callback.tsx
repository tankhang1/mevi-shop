import { useEffect } from 'react';
import { authApi, isUserAdmin, resolvePostLoginPath } from '@/features/auth/api/auth.api';
import { authStorage } from '@/features/auth/api/auth.storage';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { basePath } from '@/shared/config';

/** `/auth/callback?token=` — stores the token, loads the profile, then returns to the saved page. */
export function AuthCallback() {
  const setUser = useAuthStore(s => s.setUser);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const token = q.get('token');
    const go = (path: string) => window.location.replace(`${basePath}${path}`); // replace: keep token out of history
    if (!token) return go('/');
    authStorage.setToken(token);
    authApi.getCurrentUser()
      .then(me => setUser({ id: String(me.id), fullName: me.fullName ?? 'Khách hàng', role: isUserAdmin(me) ? 'admin' : 'customer' }))
      .catch(() => authStorage.clearToken())
      .finally(() => go(resolvePostLoginPath(q.get('redirect') ?? q.get('redirect_url'))));
  }, [setUser]);
  return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">Đang đăng nhập…</div>;
}
