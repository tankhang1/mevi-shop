import { useQuery } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { authStorage } from './auth.storage';

export const authCurrentUserKeys = {
  all: ['auth', 'current-user'] as const,
  detail: (token: string | null, workspaceId: string | null) => [...authCurrentUserKeys.all, token, workspaceId] as const,
};

/** `/api/me/profile`, cached 5 min per token + workspace. Disabled when not logged in. */
export function useCurrentUser() {
  const token = authStorage.getToken();
  const workspaceId = authStorage.getWorkspaceId();
  return useQuery({
    queryKey: authCurrentUserKeys.detail(token, workspaceId),
    queryFn: authApi.getCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
