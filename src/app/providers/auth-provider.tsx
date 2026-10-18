import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MockAuthProvider, useUser } from '@/lib/mock-auth';
import { Router } from '@/app/router';

export function ClerkRouteProvider() {
  return <MockAuthProvider><AuthQueryInvalidator /><Router /></MockAuthProvider>;
}

export function AuthQueryInvalidator() {
  const { user } = useUser(); const client = useQueryClient(); const priorUser = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const nextId = user?.id ?? null;
    if (priorUser.current !== undefined && priorUser.current !== nextId) client.clear();
    priorUser.current = nextId;
  }, [user?.id, client]);
  return null;
}
