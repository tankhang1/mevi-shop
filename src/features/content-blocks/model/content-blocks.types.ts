export interface PublicBannerCta {
  label: string;
  linkType: string;
  target: string;
}

export interface PublicBannerSlide {
  imageUrl: string;
  badge?: string | null;
  title: string;
  description?: string | null;
  cta?: PublicBannerCta | null;
  fromColor?: string | null;
  toColor?: string | null;
}

export interface PublicBannerBlock {
  autoplay: boolean;
  intervalSeconds: number;
  items: PublicBannerSlide[];
}

export interface PublicHighlightCard {
  icon: string;
  title: string;
  description?: string | null;
  link?: string | null;
}

export interface PublicHighlightBlock {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  items: PublicHighlightCard[];
}

export interface PublicFaqQuestion {
  question: string;
  answer: string;
}

export interface PublicFaqBlock {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  items: PublicFaqQuestion[];
}

export interface PublicContentBlocksResponse {
  banner: PublicBannerBlock | null;
  highlights: PublicHighlightBlock | null;
  faq: PublicFaqBlock | null;
}
