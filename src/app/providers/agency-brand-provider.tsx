import { usePublicAgency } from '@/features/agency/api/agency.queries';
import type { PublicAgency } from '@/shared/types';
import { createContext, useMemo, type ReactNode } from 'react';
import { useLocation } from 'wouter';

export const shopRef = () => new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('mevi-agency-ref') || '';

export const agencyBrandContext = createContext<PublicAgency | null>(null);

export function AgencyBrandProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const ref = useMemo(() => shopRef(), [location]);
  const query = usePublicAgency(ref);
  const agency = query.data?.active ? query.data : null;
  return <agencyBrandContext.Provider value={agency}>{children}</agencyBrandContext.Provider>;
}
