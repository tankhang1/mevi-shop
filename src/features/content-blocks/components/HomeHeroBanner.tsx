import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, PhoneCall } from "lucide-react";
import type {
  PublicBannerBlock,
  PublicBannerCta,
  PublicBannerSlide,
} from "../model/content-blocks.types";

interface Props {
  block?: PublicBannerBlock | null;
  isLoading?: boolean;
}

function getSlideColors(slide: PublicBannerSlide) {
  if (slide.fromColor && slide.toColor) {
    return { from: slide.fromColor, to: slide.toColor };
  }

  const text =
    `${slide.badge ?? ""} ${slide.title} ${slide.description ?? ""}`.toLowerCase();

  // Nhóm trái cây, cam, hoa quả, sale
  if (
    text.includes("trái cây") ||
    text.includes("hoa quả") ||
    text.includes("nho") ||
    text.includes("cam") ||
    text.includes("chuối") ||
    text.includes("bơ") ||
    text.includes("sale")
  ) {
    return { from: "#8a4a2c", to: "#bd6e46" };
  }

  // Nhóm cà phê, cafe, hạt
  if (
    text.includes("cà phê") ||
    text.includes("cafe") ||
    text.includes("hạt") ||
    text.includes("socola")
  ) {
    return { from: "#3d2314", to: "#6d4128" };
  }

  // Nhóm đại lý, Đà Lạt Xanh
  if (
    text.includes("đà lạt") ||
    text.includes("đại lý") ||
    text.includes("gian hàng")
  ) {
    return { from: "#285e45", to: "#7fa36b" };
  }

  // Mặc định màu xanh thương hiệu Mevi
  return { from: "#214c3a", to: "#5f8f6e" };
}

function BannerCtaButton({ cta }: { cta: PublicBannerCta }) {
  const className =
    "mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#214c3a] shadow-lg transition hover:scale-105";

  if (!cta.label) return null;

  if (cta.linkType === "EXTERNAL_LINK") {
    return (
      <a
        href={cta.target || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {cta.label} <ArrowRight size={17} />
      </a>
    );
  }

  if (cta.linkType === "CONTACT") {
    const href =
      cta.target.startsWith("tel:") || cta.target.startsWith("mailto:")
        ? cta.target
        : `tel:${cta.target}`;
    return (
      <a href={href} className={className}>
        <PhoneCall size={16} /> {cta.label}
      </a>
    );
  }

  if (cta.linkType === "NONE") {
    return <span className={className}>{cta.label}</span>;
  }

  // INTERNAL_LINK or default
  return (
    <Link href={cta.target || "/shop"} className={className}>
      {cta.label} <ArrowRight size={17} />
    </Link>
  );
}

export function HomeHeroBanner({ block, isLoading }: Props) {
  const [index, setIndex] = useState(0);
  const items = block?.items ?? [];
  const total = items.length;
  const autoplay = block?.autoplay ?? false;
  const intervalSeconds = block?.intervalSeconds ?? 5;

  useEffect(() => {
    if (!autoplay || total < 2) return;
    const intervalMs = Math.max(1, intervalSeconds) * 1000;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoplay, intervalSeconds, total]);

  if (isLoading && total === 0) {
    return (
      <section>
        <div className="relative h-[460px] animate-pulse bg-[#214c3a]/30 md:h-[540px]" />
      </section>
    );
  }

  if (!total) return null;

  const currentIndex = index % total;

  return (
    <section>
      <div className="relative h-[460px] overflow-hidden bg-[#214c3a] md:h-[540px]">
        {items.map((slide, k) => {
          const isActive = k === currentIndex;
          const colors = getSlideColors(slide);
          return (
            <div
              key={k}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(100deg, ${colors.from}f2 0%, ${colors.from}cc 38%, ${colors.to}33 75%, transparent 100%)`,
                }}
              />
              <div className="shell absolute inset-0 flex flex-col justify-center text-white md:px-14">
                {slide.badge && (
                  <span className="w-fit rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.14em] backdrop-blur border border-white/20">
                    {slide.badge}
                  </span>
                )}
                <h1 className="mt-4 max-w-xl whitespace-pre-line text-[38px] font-extrabold leading-[1.05] tracking-tight md:text-[58px]">
                  {slide.title}
                </h1>
                {slide.description && (
                  <p className="mt-4 max-w-md text-[15px] leading-7 text-white/90">
                    {slide.description}
                  </p>
                )}
                {slide.cta && <BannerCtaButton cta={slide.cta} />}
              </div>
            </div>
          );
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              className="absolute left-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid hover:bg-white transition"
              onClick={() => setIndex((currentIndex + total - 1) % total)}
              aria-label="Slide trước"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              className="absolute right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-[#214c3a] md:grid hover:bg-white transition"
              onClick={() => setIndex((currentIndex + total + 1) % total)}
              aria-label="Slide sau"
            >
              <ArrowRight size={18} />
            </button>
            <div className="shell absolute inset-x-0 bottom-6 flex gap-2 md:px-14">
              {items.map((_, k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setIndex(k)}
                  className={`h-2 rounded-full transition-all ${
                    k === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Slide ${k + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
