import { http } from '@/shared/api/http-client';
import type {
  AdminSummary, Agency, AgencyInput, AgencyUpdate, Order, OrderStatus, Product, ProductInput, ProductModeration,
} from '@/shared/types';

export type ProductStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
export type OrderStatusFilter = 'all' | OrderStatus;

export const adminApi = {
  getSummary: () => http.get<AdminSummary>('/admin/summary'),

  listProducts: (status: ProductStatusFilter) => http.get<Product[]>('/admin/products', { status }),
  createProduct: (input: ProductInput) => http.post<Product>('/admin/products', input),
  updateProduct: (id: number, input: Partial<ProductInput>) => http.patch<Product>(`/admin/products/${id}`, input),
  deleteProduct: (id: number) => http.delete<null>(`/admin/products/${id}`),
  moderateProduct: (id: number, input: ProductModeration) => http.post<Product>(`/admin/products/${id}/approval`, input),

  listOrders: (status: OrderStatusFilter) => http.get<Order[]>('/admin/orders', { status }),
  updateOrderStatus: (id: number, status: OrderStatus) => http.patch<Order>(`/admin/orders/${id}`, { status }),

  listAgencies: () => http.get<Agency[]>('/admin/agencies'),
  getAgency: (id: number) => http.get<Agency>(`/admin/agencies/${id}`),
  listAgencyOrders: (id: number, status: OrderStatusFilter) => http.get<Order[]>(`/admin/agencies/${id}/orders`, { status }),
  createAgency: (input: AgencyInput) => http.post<Agency>('/admin/agencies', input),
  updateAgency: (id: number, patch: AgencyUpdate) => http.patch<Agency>(`/admin/agencies/${id}`, patch),
};
