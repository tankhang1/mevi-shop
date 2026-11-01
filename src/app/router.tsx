import { AdminDashboard } from "@/features/admin/pages/admin-dashboard";
import { AdminProducts } from "@/features/admin/pages/admin-products";
import { AdminProductEditor } from "@/features/admin/pages/admin-product-editor";
import { AdminApproval } from "@/features/admin/pages/admin-approval";
import { AdminOrders } from "@/features/admin/pages/admin-orders";
import { AdminAgencies } from "@/features/admin/pages/admin-agencies";
import { AdminAgencyDetail } from "@/features/admin/pages/admin-agency-detail";
import { AdminBanners } from "@/features/admin/pages/admin-banners";
import { AgencyStorePage } from "@/features/agency-store/agency-store-page";
import { CategoriesPage } from "@/features/products/pages/categories-page";
import { useEffect } from "react";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import { AgencyDashboard } from "@/features/agency/pages/agency-dashboard";
import { AgencySettings } from "@/features/agency/pages/agency-settings";
import { AuthCallback } from "@/features/auth/auth-callback";
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
import { PORTAL_PREFIXES, ROUTES } from "@/shared/constants/routes";

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

  const isPortalRoute = PORTAL_PREFIXES.some((p) => location.startsWith(p));

  return (
    <ErrorBoundary resetKey={location}>
      {isPortalRoute ? (
        <Switch>
          <Route path={ROUTES.auth.callback} component={AuthCallback} />
          <Route
            path={ROUTES.admin.root}
            component={() => <Redirect to={ROUTES.admin.dashboard} />}
          />
          <Route
            path={ROUTES.admin.dashboard}
            component={() => (
              <Gate role="admin">
                <AdminDashboard />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.products}
            component={() => (
              <Gate role="admin">
                <AdminProducts />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.productNew}
            component={() => (
              <Gate role="admin">
                <AdminProductEditor />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.productApproval}
            component={() => (
              <Gate role="admin">
                <AdminApproval />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.productEdit}
            component={() => (
              <Gate role="admin">
                <AdminProductEditor />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.orders}
            component={() => (
              <Gate role="admin">
                <AdminOrders />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.agencies}
            component={() => (
              <Gate role="admin">
                <AdminAgencies />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.agencyDetail}
            component={() => (
              <Gate role="admin">
                <AdminAgencyDetail />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.admin.banners}
            component={() => (
              <Gate role="admin">
                <AdminBanners />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.agency.dashboard}
            component={() => (
              <Gate role="agency">
                <AgencyDashboard />
              </Gate>
            )}
          />
          <Route
            path={ROUTES.agency.settings}
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
            <Route path={ROUTES.home} component={HomeRoute} />
            <Route path={ROUTES.shop} component={CatalogPage} />
            <Route path={ROUTES.categories} component={CategoriesPage} />
            <Route path={ROUTES.product} component={ProductPage} />
            <Route path={ROUTES.shopProduct} component={ProductPage} />
            <Route path={ROUTES.shops} component={ShopsPage} />
            <Route path={ROUTES.trace} component={TracePage} />
            <Route path={ROUTES.wholesale} component={WholesalePage} />
            <Route path={ROUTES.shopDetail} component={ShopPage} />
            <Route path={ROUTES.agencyStore} component={AgencyStorePage} />
            <Route path={ROUTES.orders} component={CustomerOrdersPage} />
            <Route path={ROUTES.account} component={AccountPage} />
            <Route path={ROUTES.cart} component={CartPage} />
            <Route path={ROUTES.checkoutConfirm} component={CheckoutPage} />
            <Route path={ROUTES.checkoutSuccess} component={SuccessPage} />
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
