import { useQuery } from "@tanstack/react-query";
import { contentBlocksApi } from "./content-blocks.api";

export const useContentBlocks = () =>
  useQuery({
    queryKey: ["public", "content-blocks"],
    queryFn: () => contentBlocksApi.getContentBlocks(),
    staleTime: 5 * 60 * 1000,
  });

