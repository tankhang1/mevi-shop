import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { shops } from '@/lib/shops';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { AgencyDashboard } from '@/features/agency/pages/agency-dashboard';
import { AgencySettings } from '@/features/agency/pages/agency-settings';
import { SignInPage, SignUpPage } from '@/features/auth/auth-page';
import { Gate } from '@/features/auth/gate';
import { CartPage } from '@/features/checkout/pages/cart-page';
import { CheckoutPage } from '@/features/checkout/pages/checkout-page';
import { SuccessPage } from '@/features/checkout/pages/success-page';
import { HomePage } from '@/features/home/home-page';
import { CatalogPage } from '@/features/products/pages/catalog-page';
import { ProductPage } from '@/features/products/pages/product-page';
import { ShopPage } from '@/features/shops/pages/shop-page';
import { ShopsPage } from '@/features/shops/pages/shops-page';
import { TracePage } from '@/features/trace/trace-page';
import { WholesalePage } from '@/features/wholesale/wholesale-page';

export function Router() {
  const [location] = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('mevi-agency-ref', ref);
  }, [location]);
  return <ErrorBoundary resetKey={location}><Switch>
    <Route path="/" component={HomeRoute} /><Route path="/shop" component={CatalogPage} /><Route path="/product/:id" component={ProductPage} /><Route path="/shops" component={ShopsPage} /><Route path="/trace" component={TracePage} /><Route path="/wholesale" component={WholesalePage} /><Route path="/shops/:slug" component={ShopPage} />
    <Route path="/cart" component={CartPage} /><Route path="/checkout/confirm" component={CheckoutPage} /><Route path="/checkout/success" component={SuccessPage} />
    <Route path="/sign-in/*?" component={SignInPage} /><Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/agency/dashboard" component={() => <Gate role="agency"><AgencyDashboard /></Gate>} />
    <Route path="/agency/settings" component={() => <Gate role="agency"><AgencySettings /></Gate>} />
    <Route component={NotFound} />
  </Switch></ErrorBoundary>;
}

export function HomeRoute() { return <HomePage />; }
