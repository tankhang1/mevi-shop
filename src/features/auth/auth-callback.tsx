import { useEffect, useState } from 'react';
import { authApi, isBlockedFromShop, resolvePostLoginPath } from '@/features/auth/api/auth.api';
import { authStorage } from '@/features/auth/api/auth.storage';
import { BlockedAccountScreen } from '@/features/auth/components/blocked-account-screen';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { basePath } from '@/shared/config';

/**
 * `/auth/callback?token=` — stores the token, loads `/api/me/profile`, then returns to the saved page.
 * Admin / đại lý accounts are rejected: token cleared, message shown.
 */
export function AuthCallback() {
  const setUser = useAuthStore(s => s.setUser);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const token = q.get('token');
    const go = (path: string) => window.location.replace(`${basePath}${path}`); // replace: keep token out of history
    if (!token) return go('/');
    authStorage.setToken(token);
    authApi.getCurrentUser()
      .then(me => {
        if (isBlockedFromShop(me)) {
          authStorage.clearToken();
          authStorage.clearRedirectPath();
          setUser(null);
          window.history.replaceState(null, '', `${basePath}/auth/callback`); // drop token from URL
          setBlocked(true);
          return;
        }
        setUser({ id: String(me.id), fullName: me.fullName ?? 'Khách hàng', role: 'customer' });
        go(resolvePostLoginPath(q.get('redirect') ?? q.get('redirect_url')));
      })
      .catch(() => {
        authStorage.clearToken();
        go(resolvePostLoginPath(q.get('redirect') ?? q.get('redirect_url')));
      });
  }, [setUser]);

  if (blocked) return <BlockedAccountScreen />;

  return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">Đang đăng nhập…</div>;
}
