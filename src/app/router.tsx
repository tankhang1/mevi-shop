import { AdminDashboard } from "@/features/admin/pages/admin-dashboard";
import { AdminProducts } from "@/features/admin/pages/admin-products";
import { AdminProductEditor } from "@/features/admin/pages/admin-product-editor";
import { AdminApproval } from "@/features/admin/pages/admin-approval";
import { AdminOrders } from "@/features/admin/pages/admin-orders";
import { AdminAgencies } from "@/features/admin/pages/admin-agencies";
import { AdminAgencyDetail } from "@/features/admin/pages/admin-agency-detail";
import { useEffect } from "react";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import { AgencyDashboard } from "@/features/agency/pages/agency-dashboard";
import { AgencySettings } from "@/features/agency/pages/agency-settings";
import { SignInPage, SignUpPage } from "@/features/auth/auth-page";
import { Gate } from "@/features/auth/gate";
import { CartPage } from "@/features/checkout/pages/cart-page";
import { CheckoutPage } from "@/features/checkout/pages/checkout-page";
import { SuccessPage } from "@/features/checkout/pages/success-page";
import { HomePage } from "@/features/home/home-page";
import { CatalogPage } from "@/features/products/pages/catalog-page";
import { ProductPage } from "@/features/products/pages/product-page";
import { ShopPage } from "@/features/shops/pages/shop-page";
import { ShopsPage } from "@/features/shops/pages/shops-page";
import { TracePage } from "@/features/trace/trace-page";
import { WholesalePage } from "@/features/wholesale/wholesale-page";
import { CustomerOrdersPage } from "@/features/orders/pages/customer-orders-page";
import { AccountPage } from "@/features/account/pages/account-page";

import { CustomerShell } from "@/shared/ui/layout";

export function Router() {
  const [location] = useLocation();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("mevi-agency-ref", ref);

    // Auto scroll to top on page navigation
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location]);

  const isPortalRoute =
    location.startsWith("/admin") ||
    location.startsWith("/agency") ||
    location.startsWith("/sign-in") ||
    location.startsWith("/sign-up");

  return (
    <ErrorBoundary resetKey={location}>
      {isPortalRoute ? (
        <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route
            path="/admin"
            component={() => <Redirect to="/admin/dashboard" />}
          />
          <Route
            path="/admin/dashboard"
            component={() => (
              <Gate role="admin">
                <AdminDashboard />
              </Gate>
            )}
          />
          <Route
            path="/admin/products"
            component={() => (
              <Gate role="admin">
                <AdminProducts />
              </Gate>
            )}
          />
          <Route
            path="/admin/products/new"
            component={() => (
              <Gate role="admin">
                <AdminProductEditor />
              </Gate>
            )}
          />
          <Route
            path="/admin/products/approval"
            component={() => (
              <Gate role="admin">
                <AdminApproval />
              </Gate>
            )}
          />
          <Route
            path="/admin/products/:id/edit"
            component={() => (
              <Gate role="admin">
                <AdminProductEditor />
              </Gate>
            )}
          />
          <Route
            path="/admin/orders"
            component={() => (
              <Gate role="admin">
                <AdminOrders />
              </Gate>
            )}
          />
          <Route
            path="/admin/agencies"
            component={() => (
              <Gate role="admin">
                <AdminAgencies />
              </Gate>
            )}
          />
          <Route
            path="/admin/agencies/:id"
            component={() => (
              <Gate role="admin">
                <AdminAgencyDetail />
              </Gate>
            )}
          />
          <Route
            path="/agency/dashboard"
            component={() => (
              <Gate role="agency">
                <AgencyDashboard />
              </Gate>
            )}
          />
          <Route
            path="/agency/settings"
            component={() => (
              <Gate role="agency">
                <AgencySettings />
              </Gate>
            )}
          />
          <Route component={NotFound} />
        </Switch>
      ) : (
        <CustomerShell>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/shop" component={CatalogPage} />
            <Route path="/product/:id" component={ProductPage} />
            <Route path="/shops" component={ShopsPage} />
            <Route path="/trace" component={TracePage} />
            <Route path="/wholesale" component={WholesalePage} />
            <Route path="/shops/:slug" component={ShopPage} />
            <Route path="/orders" component={CustomerOrdersPage} />
            <Route path="/account" component={AccountPage} />
            <Route path="/cart" component={CartPage} />
            <Route path="/checkout/confirm" component={CheckoutPage} />
            <Route path="/checkout/success" component={SuccessPage} />
            <Route component={NotFound} />
          </Switch>
        </CustomerShell>
      )}
    </ErrorBoundary>
  );
}

export function HomeRoute() {
  return <HomePage />;
}
