import { mockRequest } from '@/mocks/server';

// Set VITE_USE_MOCK=false and VITE_API_URL to talk to a real backend.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type Params = Record<string, string | number | undefined | null>;

function buildUrl(path: string, params?: Params) {
  const qs = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.append(k, String(v)); });
  const query = qs.toString();
  return `${BASE_URL}/api${path}${query ? `?${query}` : ''}`;
}

async function request<T>(method: Method, path: string, { params, body }: { params?: Params; body?: unknown } = {}): Promise<T> {
  const url = buildUrl(path, params);
  if (USE_MOCK) {
    try {
      return structuredClone(mockRequest(method, url, body)) as T;
    } catch (e) {
      const status = (e as { status?: number }).status ?? 500;
      throw new ApiError(status, (e as Error).message);
    }
  }
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data?.message ?? res.statusText, data);
  return data as T;
}

export const http = {
  get: <T>(path: string, params?: Params) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
