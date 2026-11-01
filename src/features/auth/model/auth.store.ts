import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/features/auth/api/auth.api';
import { authStorage } from '@/features/auth/api/auth.storage';

export type Role = 'admin' | 'agency' | 'customer';
export interface AuthUser { id: string; fullName: string; role: Role }

export const demoUsers: Record<Role, AuthUser> = {
  admin: { id: 'user_admin', fullName: 'Quản trị Mevi', role: 'admin' },
  agency: { id: 'user_agency', fullName: 'Đại lý Đà Lạt Xanh', role: 'agency' },
  customer: { id: 'user_customer', fullName: 'Khách hàng', role: 'customer' },
};

interface AuthState {
  user: AuthUser | null;
  /** Demo role switcher only (mock data). */
  signIn: (role: Role, name?: string) => void;
  /** Set after SSO callback from `/api/me/profile`. */
  setUser: (user: AuthUser | null) => void;
  signOut: (opts?: { redirectUrl?: string }) => void;
}

export const useAuthStore = create<AuthState>()(persist(set => ({
  user: null,
  signIn: (role, name) => set({ user: name ? { ...demoUsers[role], fullName: name } : demoUsers[role] }),
  setUser: user => set({ user }),
  signOut: opts => {
    set({ user: null });
    // Real SSO session → backend logout (redirects). Demo session → local only.
    if (authStorage.getToken()) void authApi.logout();
    else if (opts?.redirectUrl) window.location.assign(opts.redirectUrl);
  },
}), { name: 'mevi-auth' }));

/** Starts SSO. Use as the onClick of every "Đăng nhập" button. */
export const login = () => authApi.startLogin();
