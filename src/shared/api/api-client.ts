import { authStorage } from '@/features/auth/api/auth.storage';
import { API_BASE_URL } from './api.env';
import type { ApiErrorResponse } from './api.types';

export const AUTH_PATHS = {
  login: (provider: string) => `/auth/login/${encodeURIComponent(provider)}`,
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  profile: '/api/me/profile',
  roles: '/api/me/roles',
} as const;

export class BackendError extends Error {
  constructor(readonly status: number, readonly body: ApiErrorResponse | null) {
    super(body?.message ?? `HTTP ${status}`);
    this.name = 'BackendError';
  }
  get fieldErrors() { return this.body?.fieldErrors ?? {}; }
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  params?: Query;
  body?: unknown;
  /** Public APIs: no `Authorization` / workspace header, no 401 refresh. */
  skipAuth?: boolean;
  /** Global APIs that must not receive `X-Workspace-Id`. */
  skipWorkspaceHeader?: boolean;
  signal?: AbortSignal;
}

export const buildApiUrl = (path: string, params?: Query) => {
  const qs = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, String(v)); });
  const query = qs.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
};

// One in-flight refresh shared by every request that hit 401.
let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const old = authStorage.getToken();
  if (!old) return null;
  try {
    const res = await fetch(buildApiUrl(AUTH_PATHS.refresh), { method: 'POST', headers: { Authorization: `Bearer ${old}` } });
    if (!res.ok) return null;
    const text = await res.text();
    let token: string | undefined;
    try {
      const data = JSON.parse(text) as string | { access_token?: string; accessToken?: string };
      token = typeof data === 'string' ? data : data.access_token ?? data.accessToken;
    } catch {
      token = text; // plain-text token
    }
    if (!token) return null;
    authStorage.setToken(token);
    return token;
  } catch {
    return null;
  }
}

function send(method: string, path: string, opts: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const isForm = opts.body instanceof FormData;
  if (opts.body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (!opts.skipAuth) {
    if (token) headers.Authorization = `Bearer ${token}`;
    const workspaceId = authStorage.getWorkspaceId();
    if (workspaceId && !opts.skipWorkspaceHeader) headers['X-Workspace-Id'] = workspaceId;
  }
  return fetch(buildApiUrl(path, opts.params), {
    method,
    headers,
    body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    signal: opts.signal,
  });
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const token = opts.skipAuth ? null : authStorage.getToken();
  let res = await send(method, path, opts, token);

  // Refresh only when we actually sent a token. Refresh fail → drop the session (no forced redirect: site is public).
  if (res.status === 401 && token) {
    refreshing ??= refreshToken().finally(() => { refreshing = null; });
    const next = await refreshing;
    if (next) res = await send(method, path, opts, next);
    else authStorage.clearToken();
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!res.ok) throw new BackendError(res.status, (data && typeof data === 'object' ? data : null) as ApiErrorResponse | null);
  return data as T;
}

/** Real-backend client: Bearer token + `X-Workspace-Id` when logged in, 401 → refresh once → retry. */
export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};
