import { apiClient } from "@/shared/api/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api-endpoints";
import type { PublicContentBlocksResponse } from "../model/content-blocks.types";

export const contentBlocksApi = {
  getContentBlocks: () =>
    apiClient.get<PublicContentBlocksResponse>(
      API_ENDPOINTS.public.shop.contentBlocks,
      { skipAuth: true, skipWorkspaceHeader: true },
    ),
};

