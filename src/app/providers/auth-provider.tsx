import { useAuthStore } from '@/features/auth/model/auth.store';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Router } from '@/app/router';

export function AppRoutes() {
  return <><AuthQueryInvalidator /><Router /></>;
}

export function AuthQueryInvalidator() {
  const user = useAuthStore(s => s.user); const client = useQueryClient(); const priorUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const nextId = user?.id ?? null;
    if (priorUser.current !== undefined && priorUser.current !== nextId) client.clear();
    priorUser.current = nextId;
  }, [user?.id, client]);
  return null;
}
