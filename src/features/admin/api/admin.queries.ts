import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AgencyInput, AgencyUpdate, BannerInput, OrderStatus, ProductInput, ProductModeration } from '@/shared/types';
import { productKeys } from '@/features/products/api/products.queries';
import { adminApi, type OrderStatusFilter, type ProductStatusFilter } from './admin.api';

export const adminKeys = {
  all: ['admin'] as const,
  summary: ['admin', 'summary'] as const,
  products: (status: ProductStatusFilter) => ['admin', 'products', status] as const,
  orders: (status: OrderStatusFilter) => ['admin', 'orders', status] as const,
  agencies: ['admin', 'agencies'] as const,
  agency: (id: number) => ['admin', 'agencies', id] as const,
  banners: ['admin', 'banners'] as const,
  agencyOrders: (id: number, status: OrderStatusFilter) => ['admin', 'agencies', id, 'orders', status] as const,
};

/** Admin writes touch counts, lists and the storefront, so refresh everything admin + public products. */
function useInvalidateAdmin() {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: adminKeys.all }),
    qc.invalidateQueries({ queryKey: productKeys.all }),
    qc.invalidateQueries({ queryKey: ['agencies'] }),
    qc.invalidateQueries({ queryKey: ['agency'] }),
    qc.invalidateQueries({ queryKey: ['banners'] }),
  ]);
}

export const useAdminSummary = () => useQuery({ queryKey: adminKeys.summary, queryFn: adminApi.getSummary });

export const useAdminProducts = (status: ProductStatusFilter = 'all') =>
  useQuery({ queryKey: adminKeys.products(status), queryFn: () => adminApi.listProducts(status) });

export const useAdminOrders = (status: OrderStatusFilter = 'all') =>
  useQuery({ queryKey: adminKeys.orders(status), queryFn: () => adminApi.listOrders(status) });

export const useAdminAgencies = () => useQuery({ queryKey: adminKeys.agencies, queryFn: adminApi.listAgencies });

export const useAdminAgency = (id: number) =>
  useQuery({ queryKey: adminKeys.agency(id), queryFn: () => adminApi.getAgency(id), enabled: !!id });

export const useAdminAgencyOrders = (id: number, status: OrderStatusFilter = 'all') =>
  useQuery({ queryKey: adminKeys.agencyOrders(id, status), queryFn: () => adminApi.listAgencyOrders(id, status), enabled: !!id });

export function useSaveProduct(id: number | null) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (input: ProductInput) => id === null ? adminApi.createProduct(input) : adminApi.updateProduct(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: adminApi.deleteProduct, onSuccess: invalidate });
}

export function useModerateProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductModeration & { id: number }) => adminApi.moderateProduct(id, input),
    onSuccess: invalidate,
  });
}

export function useUpdateOrderStatus() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => adminApi.updateOrderStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useCreateAgency() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: (input: AgencyInput) => adminApi.createAgency(input), onSuccess: invalidate });
}

export function useUpdateAgency() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, ...patch }: AgencyUpdate & { id: number }) => adminApi.updateAgency(id, patch),
    onSuccess: invalidate,
  });
}

export const useAdminBanners = () => useQuery({ queryKey: adminKeys.banners, queryFn: adminApi.listBanners });

export function useSaveBanner() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<BannerInput> & { id: number | null }) =>
      id === null ? adminApi.createBanner(input as BannerInput) : adminApi.updateBanner(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBanner() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: adminApi.deleteBanner, onSuccess: invalidate });
}
