import { http } from '@/shared/api/http-client';
import type { Agency, AgencySummary, AgencyUpdate, PublicAgency } from '@/shared/types';

export const agencyApi = {
  getPublic: (slug: string) => http.get<PublicAgency>(`/agencies/${slug}`),
  getSummary: () => http.get<AgencySummary>('/agency/summary'),
  getSettings: () => http.get<Agency>('/agency/settings'),
  updateSettings: (patch: AgencyUpdate) => http.patch<Agency>('/agency/settings', patch),
};
