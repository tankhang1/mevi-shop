import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useGetPublicAgency, getGetPublicAgencyQueryKey } from '@/lib/api';
import type { PublicAgency } from '@/lib/api';

export const shopRef = () => new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('mevi-agency-ref') || '';

export const agencyBrandContext = createContext<PublicAgency | null>(null);

export function AgencyBrandProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const ref = useMemo(() => shopRef(), [location]);
  const query = useGetPublicAgency(ref, { query: { enabled: !!ref, queryKey: getGetPublicAgencyQueryKey(ref) } });
  const agency = query.data?.active ? query.data : null;
  useEffect(() => {
    document.documentElement.style.setProperty('--agency-accent', agency?.primaryColor ?? '#285e45');
  }, [agency?.primaryColor]);
  return <agencyBrandContext.Provider value={agency}>{children}</agencyBrandContext.Provider>;
}
