import { API_ENDPOINTS } from '@/config/api-endpoints';
import { apiClient } from '@/shared/api/api-client';

export type AudienceType = 'individual' | 'cooperative' | 'business' | 'other';

export interface CustomerRegistrationRequest {
  fullName: string;
  phoneNumber: string;
  audienceType: AudienceType;
  email?: string;
  password: string;
  /** Grants MEVI_CUSTOMER immediately; no workspace is created. */
  registrationTarget: 'customer';
}

export interface PublicRegistrationResponse {
  status: string;
  fullName: string;
  phoneNumber: string;
  audienceType: AudienceType;
  email: string | null;
  submittedAt: string;
}

export interface PhoneAvailabilityResponse {
  phoneNumber: string;
  exists: boolean;
}

const PUBLIC = { skipAuth: true } as const;

export const registrationApi = {
  /** POST /api/registrations — 400 validation, 409 already registered, 502 identity provider failure. */
  register: (body: CustomerRegistrationRequest) =>
    apiClient.post<PublicRegistrationResponse>(API_ENDPOINTS.registrations.create, body, PUBLIC),
  /** POST /api/registrations/phone-availability — `exists: false` means submit won't hit a 409. */
  checkPhone: (phoneNumber: string) =>
    apiClient.post<PhoneAvailabilityResponse>(API_ENDPOINTS.registrations.phoneAvailability, { phoneNumber }, PUBLIC),
};
