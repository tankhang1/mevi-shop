import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AgencyBrandProvider } from '@/app/providers/agency-brand-provider';
import { ClerkRouteProvider } from '@/app/providers/auth-provider';
import { useBindCart } from '@/features/cart/use-cart';
import { basePath } from '@/shared/config';

export const queryClient = new QueryClient();

export function App() {
  useBindCart();
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><AgencyBrandProvider><ClerkRouteProvider /></AgencyBrandProvider></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;
