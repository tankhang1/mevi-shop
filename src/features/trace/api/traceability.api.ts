import { API_ENDPOINTS } from '@/config/api-endpoints';
import { apiClient } from '@/shared/api/api-client';

export interface TraceabilityZone {
  code: string;
  name: string;
  status: string;
  productionMethod: { name: string } | null;
  rearingMethod: { name: string } | null;
  subjects: { code: string; name: string; imageUrl?: string | null; variants?: { code: string; name: string }[] }[];
  workspace: {
    name: string | null;
    brandName: string | null;
    province: string | null;
    ward: string | null;
    address: string | null;
    metadataJson?: { farmDisplayName?: string };
  } | null;
}

export const traceabilityApi = {
  /** GET /api/public/traceability/production-zones/{code} */
  getZone: (code: string, signal?: AbortSignal) =>
    apiClient.get<TraceabilityZone>(API_ENDPOINTS.public.traceability.zone(code), { skipAuth: true, signal }),
};
