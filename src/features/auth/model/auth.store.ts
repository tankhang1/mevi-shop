import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Local stand-in for a real auth provider: the signed-in demo user is persisted in localStorage.
export type Role = 'agency' | 'customer';
export interface AuthUser { id: string; fullName: string; role: Role }

export const demoUsers: Record<Role, AuthUser> = {
  agency: { id: 'user_agency', fullName: 'Đại lý Đà Lạt Xanh', role: 'agency' },
  customer: { id: 'user_customer', fullName: 'Khách hàng', role: 'customer' },
};

interface AuthState {
  user: AuthUser | null;
  signIn: (role: Role, name?: string) => void;
  signOut: (opts?: { redirectUrl?: string }) => void;
}

export const useAuthStore = create<AuthState>()(persist(set => ({
  user: null,
  signIn: (role, name) => set({ user: name ? { ...demoUsers[role], fullName: name } : demoUsers[role] }),
  signOut: opts => {
    set({ user: null });
    if (opts?.redirectUrl) window.location.assign(opts.redirectUrl);
  },
}), { name: 'mevi-auth' }));
