import { ROUTES } from '@/shared/constants/routes';

const env = import.meta.env;

/** Real backend (auth + /api/*). Separate from the mock-backed `http` client. */
export const API_BASE_URL = (env.VITE_API_BASE_URL ?? env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const AUTH_PROVIDER: string = env.VITE_AUTH_PROVIDER ?? 'farm';
export const AUTH_CALLBACK_PATH: string = env.VITE_AUTH_CALLBACK_PATH ?? ROUTES.auth.callback;
export const AUTH_POST_LOGOUT_REDIRECT_URI: string = env.VITE_AUTH_POST_LOGOUT_REDIRECT_URI ?? `${window.location.origin}/`;
