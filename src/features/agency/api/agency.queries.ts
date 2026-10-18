import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AgencyUpdate } from '@/shared/types';
import { agencyApi } from './agency.api';

export const agencyKeys = {
  public: (slug: string) => ['agencies', slug] as const,
  summary: ['agency', 'summary'] as const,
  settings: ['agency', 'settings'] as const,
};

export const usePublicAgency = (slug: string) =>
  useQuery({ queryKey: agencyKeys.public(slug), queryFn: () => agencyApi.getPublic(slug), enabled: !!slug });

export const useAgencySummary = () =>
  useQuery({ queryKey: agencyKeys.summary, queryFn: agencyApi.getSummary });

export const useAgencySettings = () =>
  useQuery({ queryKey: agencyKeys.settings, queryFn: agencyApi.getSettings });

export const useUpdateAgencySettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: AgencyUpdate) => agencyApi.updateSettings(patch),
    onSuccess: (agency, _patch) => {
      qc.setQueryData(agencyKeys.settings, agency);
      qc.invalidateQueries({ queryKey: ['agencies'] });
    },
  });
};
