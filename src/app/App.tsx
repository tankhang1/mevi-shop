import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/query-client';
import { Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AgencyBrandProvider } from '@/app/providers/agency-brand-provider';
import { AppRoutes } from '@/app/providers/auth-provider';
import { basePath } from '@/shared/config';

export function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><AgencyBrandProvider><AppRoutes /></AgencyBrandProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;
