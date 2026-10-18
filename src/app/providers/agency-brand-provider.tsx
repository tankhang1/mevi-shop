import { usePublicAgency } from '@/features/agency/api/agency.queries';
import type { PublicAgency } from '@/shared/types';
import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation } from 'wouter';

export const shopRef = () => new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('mevi-agency-ref') || '';

export const agencyBrandContext = createContext<PublicAgency | null>(null);

export function AgencyBrandProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const ref = useMemo(() => shopRef(), [location]);
  const query = usePublicAgency(ref);
  const agency = query.data?.active ? query.data : null;
  useEffect(() => {
    document.documentElement.style.setProperty('--agency-accent', agency?.primaryColor ?? '#285e45');
  }, [agency?.primaryColor]);
  return <agencyBrandContext.Provider value={agency}>{children}</agencyBrandContext.Provider>;
}
