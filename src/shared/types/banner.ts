/** Where a banner's CTA takes the shopper. */
export type BannerLinkType = 'category' | 'product' | 'agency' | 'shop';

export interface Banner {
  id: number;
  tag: string;
  title: string;
  description: string;
  ctaLabel: string;
  imageUrl: string;
  /** Gradient overlay colors (#RRGGBB). */
  fromColor: string;
  toColor: string;
  linkType: BannerLinkType;
  /** Category name, product id, agency slug or farm-shop slug, depending on linkType. */
  linkTarget: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
}

export type BannerInput = Omit<Banner, 'id' | 'createdAt'>;

export function bannerHref({ linkType, linkTarget }: Pick<Banner, 'linkType' | 'linkTarget'>) {
  if (linkType === 'product') return `/product/${linkTarget}`;
  if (linkType === 'agency') return agencyStoreHref(linkTarget);
  if (linkType === 'shop') return `/shops/${linkTarget}`;
  return `/shop?category=${encodeURIComponent(linkTarget)}`;
}

/** Public storefront of an agency/CTV; visiting it attributes later orders to that agency. */
export const defaultAgencyCover = 'https://images.pexels.com/photos/2733918/pexels-photo-2733918.jpeg?auto=compress&cs=tinysrgb&w=1600';

export const agencyStoreHref = (slug: string) => `/dai-ly/${slug}`;
