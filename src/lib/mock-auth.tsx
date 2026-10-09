import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// Local stand-in for Clerk: the signed-in demo user lives in localStorage.
export type MockRole = 'admin' | 'agency' | 'customer';
export interface MockUser { id: string; fullName: string; publicMetadata: { role?: MockRole } }

export const demoUsers: Record<MockRole, MockUser> = {
  admin: { id: 'user_admin', fullName: 'Quản trị Mevi', publicMetadata: { role: 'admin' } },
  agency: { id: 'user_agency', fullName: 'Đại lý Đà Lạt Xanh', publicMetadata: { role: 'agency' } },
  customer: { id: 'user_customer', fullName: 'Khách hàng', publicMetadata: { role: 'customer' } },
};

const STORAGE_KEY = 'mevi-mock-user';
type Ctx = { user: MockUser | null; signIn: (role: MockRole, name?: string) => void; signOut: (opts?: { redirectUrl?: string }) => void };
const authContext = createContext<Ctx | null>(null);

// Stored as "role" or "role|display name" (a customer signing in with their own name).
function toUser(stored: string | null): MockUser | null {
  if (!stored) return null;
  const [role, name] = stored.split('|') as [MockRole, string | undefined];
  if (!demoUsers[role]) return null;
  return name ? { ...demoUsers[role], fullName: name } : demoUsers[role];
}
function readUser(): MockUser | null {
  try { return toUser(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(readUser);
  const signIn = useCallback((role: MockRole, name?: string) => {
    const stored = name ? `${role}|${name}` : role;
    try { localStorage.setItem(STORAGE_KEY, stored); } catch { /* storage unavailable */ }
    setUser(toUser(stored));
  }, []);
  const signOut = useCallback((opts?: { redirectUrl?: string }) => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    if (opts?.redirectUrl) window.location.assign(opts.redirectUrl);
  }, []);
  return <authContext.Provider value={{ user, signIn, signOut }}>{children}</authContext.Provider>;
}

function useAuth() {
  const ctx = useContext(authContext);
  if (!ctx) throw new Error('MockAuthProvider is missing');
  return ctx;
}

export function useUser() {
  const { user } = useAuth();
  return user ? { isLoaded: true as const, isSignedIn: true as const, user } : { isLoaded: true as const, isSignedIn: false as const, user: null };
}

export function useClerk() {
  const { signIn, signOut } = useAuth();
  return { signIn, signOut };
}
