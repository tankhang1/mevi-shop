import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderInput } from '@/shared/types';
import { agencyKeys } from '@/features/agency/api/agency.queries';
import { myOrdersKey } from '@/features/orders/api/my-orders.queries';
import { ordersApi } from './orders.api';

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrderInput) => ordersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agencyKeys.summary });
      qc.invalidateQueries({ queryKey: myOrdersKey });
    },
  });
};
