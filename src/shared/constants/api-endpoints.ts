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
  registrations: {
    create: "/api/registrations",
    phoneAvailability: "/api/registrations/phone-availability",
  },
  shop: {
    customer: {
      orders: "/api/shop/customer/orders",
      orderDetail: (id: number | string) => `/api/shop/customer/orders/${id}`,
      cancelOrder: (id: number | string) =>
        `/api/shop/customer/orders/${id}/cancel`,
    },
  },
  public: {
    traceability: {
      zone: (code: string) =>
        `/api/public/traceability/production-zones/${encodeURIComponent(code)}`,
    },
    shop: {
      categories: "/api/public/shop/product-categories",
      products: "/api/public/shop/products",
      productDetail: (id: number | string) => `/api/public/shop/products/${id}`,
      storefronts: "/api/public/shop/storefronts",
      storefrontDetail: (id: number | string) =>
        `/api/public/shop/storefronts/${id}`,
      storefrontProducts: (id: number | string) =>
        `/api/public/shop/storefronts/${id}/products`,
      /** POST — Gửi biểu mẫu liên hệ hợp tác (CTV / Đại lý) */
      partnerContactRequests: "/api/public/shop/partner-contact-requests",
      /** GET — Lấy 3 khối nội dung trang chủ (banner, highlights, faq) */
      contentBlocks: "/api/public/shop/content-blocks",
    },
  },
} as const;
