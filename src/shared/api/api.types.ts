/** Spring-style page wrapper used by every paginated backend endpoint. */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  /** 0-based */
  page?: number;
  /** 1–100, default 20 */
  size?: number;
}

/** Backend error body. `fieldErrors` values are reason keys, e.g. `api.message.validation.required`. */
export interface ApiErrorResponse {
  message?: string;
  messageKey?: string;
  fieldErrors?: Record<string, string>;
}
