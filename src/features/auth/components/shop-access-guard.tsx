import { useEffect, useState, type ReactNode } from 'react';
import { isBlockedFromShop } from '@/features/auth/api/auth.api';
import { useCurrentUser } from '@/features/auth/api/auth.queries';
import { authStorage } from '@/features/auth/api/auth.storage';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { BlockedAccountScreen } from './blocked-account-screen';

/**
 * Runs on every load/reload: if the persisted user is admin/agency, or `/api/me/profile`
 * for the current token returns admin/agency roles, sign out locally and show the block screen.
 */
export function ShopAccessGuard({ children }: { children: ReactNode }) {
  const storedRole = useAuthStore(s => s.user?.role);
  const setUser = useAuthStore(s => s.setUser);
  const { data: me } = useCurrentUser();
  const [blocked, setBlocked] = useState(false);

  const shouldBlock = storedRole === 'admin' || storedRole === 'agency' || (!!me && isBlockedFromShop(me));

  useEffect(() => {
    if (!shouldBlock) return;
    authStorage.clearToken();
    authStorage.clearRedirectPath();
    setUser(null);
    setBlocked(true); // sticky: stays after user/token are cleared
  }, [shouldBlock, setUser]);

  if (blocked || shouldBlock) return <BlockedAccountScreen />;
  return <>{children}</>;
}
