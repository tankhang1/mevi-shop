import { apiClient, AUTH_PATHS, buildApiUrl } from '@/shared/api/api-client';
import { AUTH_CALLBACK_PATH, AUTH_POST_LOGOUT_REDIRECT_URI, AUTH_PROVIDER } from '@/shared/api/api.env';
import { basePath } from '@/shared/config';
import { authStorage } from './auth.storage';
import { ADMIN_ROLE_CODES, type AuthMeResponse, type AuthProvider, type WorkspaceRole } from './auth.types';

const currentPath = () => window.location.pathname.slice(basePath.length) + window.location.search;

export const authApi = {
  /** Only called from a "Đăng nhập" click. Saves the current page, then redirects to backend SSO. */
  startLogin: (provider: AuthProvider = AUTH_PROVIDER, redirectPath = currentPath()) => {
    authStorage.setRedirectPath(redirectPath);
    const callbackUrl = `${window.location.origin}${basePath}${AUTH_CALLBACK_PATH}`;
    window.location.assign(buildApiUrl(AUTH_PATHS.login(provider), { callback_url: callbackUrl }));
  },

  /** Errors are ignored: token is always cleared and the page always redirects. */
  logout: async () => {
    try {
      await apiClient.post(AUTH_PATHS.logout, undefined, { params: { post_logout_redirect_uri: AUTH_POST_LOGOUT_REDIRECT_URI } });
    } catch { /* ignore */ }
    authStorage.clearToken();
    window.location.replace(AUTH_POST_LOGOUT_REDIRECT_URI);
  },

  getCurrentUser: () => apiClient.get<AuthMeResponse>(AUTH_PATHS.profile),
  getRoles: () => apiClient.get<WorkspaceRole[]>(AUTH_PATHS.roles, { skipWorkspaceHeader: true }),
};

/** UX-only check; backend enforces permissions. */
export const isUserAdmin = (user: Pick<AuthMeResponse, 'roleCodes'> | null | undefined) =>
  (user?.roleCodes ?? []).some(r => (ADMIN_ROLE_CODES as readonly string[]).includes(r) || r.includes('ADMIN'));

/** Post-login target: callback `redirect` → saved page → `/`. Only same-origin paths. */
export function resolvePostLoginPath(callbackRedirect: string | null) {
  const stored = authStorage.getRedirectPath();
  authStorage.clearRedirectPath();
  const target = callbackRedirect || stored || '/';
  return target.startsWith('/') && !target.startsWith('//') ? target : '/';
}
