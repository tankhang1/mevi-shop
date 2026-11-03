/**
 * Centralized API endpoints for mevi-shop
 * Quản lý tập trung mọi endpoint giao tiếp Backend (tương tự mevi-shop-admin)
 */
export const API_ENDPOINTS = {
  auth: {
    login: (provider: string) => `/auth/login/${encodeURIComponent(provider)}`,
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    profile: "/api/me/profile",
    roles: "/api/me/roles",
  },
  public: {
    shop: {
      categories: "/api/public/shop/product-categories",
      products: "/api/public/shop/products",
      productDetail: (id: number | string) => `/api/public/shop/products/${id}`,
      storefrontDetail: (id: number | string) =>
        `/api/public/shop/storefronts/${id}`,
      storefrontProducts: (id: number | string) =>
        `/api/public/shop/storefronts/${id}/products`,
      /** POST — Gửi biểu mẫu liên hệ hợp tác (CTV / Đại lý) */
      partnerContactRequests: "/api/public/shop/partner-contact-requests",
    },
  },
} as const;
