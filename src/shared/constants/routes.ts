/** Single source of truth for app paths. `ROUTES` = wouter patterns, `paths` = URL builders. */
export const ROUTES = {
  home: "/",
  shop: "/shop",
  categories: "/categories",
  product: "/product/:id",
  /** Public shop product: `/products/<handle>-i.<id>` */
  shopProduct: "/products/:slug",
  shops: "/shops",
  shopDetail: "/shops/:slug",
  agencyStore: "/dai-ly/:slug",
  trace: "/trace",
  wholesale: "/wholesale",
  cart: "/cart",
  checkoutConfirm: "/checkout/confirm",
  checkoutSuccess: "/checkout/success",
  orders: "/orders",
  account: "/account",
  register: "/register",

  auth: {
    callback: "/auth/callback",
  },

  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    products: "/admin/products",
    productNew: "/admin/products/new",
    productEdit: "/admin/products/:id/edit",
    productApproval: "/admin/products/approval",
    orders: "/admin/orders",
    agencies: "/admin/agencies",
    agencyDetail: "/admin/agencies/:id",
    banners: "/admin/banners",
  },

  agency: {
    root: "/agency",
    dashboard: "/agency/dashboard",
    settings: "/agency/settings",
  },
} as const;

/** Route prefixes rendered without the customer shell. */
export const PORTAL_PREFIXES = [
  ROUTES.admin.root,
  ROUTES.agency.root,
  ROUTES.auth.callback,
] as const;

export const paths = {
  product: (id: number | string) => `/product/${id}`,
  shopProduct: (p: { id: number; handle: string }) =>
    `/products/${p.handle}-i.${p.id}`,
  shopDetail: (p: { id: number | string; handle?: string } | string) =>
    typeof p === "string"
      ? `/shops/${p}`
      : `/shops/${p.handle || "gian-hang"}-i.${p.id}`,
  agencyStore: (slug: string) => `/dai-ly/${slug}`,
  adminProductEdit: (id: number | string) => `/admin/products/${id}/edit`,
  adminAgencyDetail: (id: number | string) => `/admin/agencies/${id}`,
};
