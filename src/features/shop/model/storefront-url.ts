import { paths } from "@/shared/constants/routes";
import type { PublicId } from "../api/shop.types";

export const storefrontPath = (s: { id: PublicId; handle: string }) =>
  paths.shopDetail(s);

/** Parses the `/shops/<handle>-i.<id>` or `/shops/<id>` slug. Returns null when the id part is missing / not numeric. */
export function parseStorefrontSlug(
  slug: string,
): { handle?: string; id: PublicId } | null {
  if (!slug) return null;
  const m = /^(.*)-i\.(\d{1,16})$/.exec(slug);
  if (m) {
    const id = Number(m[2]);
    if (Number.isSafeInteger(id)) return { handle: m[1], id };
  }
  if (/^\d{1,16}$/.test(slug)) {
    const id = Number(slug);
    if (Number.isSafeInteger(id)) return { id };
  }
  return null;
}

/** True when the URL handle is stale (storefront renamed) → FE should redirect to `storefrontPath`. */
export const needsStorefrontRedirect = (
  urlHandle: string | undefined,
  storefront: { handle: string; id: PublicId },
) => urlHandle !== undefined && urlHandle !== storefront.handle;
