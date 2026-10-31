import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http-client';
import type { Banner } from '@/shared/types';

/** Active storefront banners, already sorted by display order. */
export const useBanners = () => useQuery({ queryKey: ['banners'], queryFn: () => http.get<Banner[]>('/banners') });
