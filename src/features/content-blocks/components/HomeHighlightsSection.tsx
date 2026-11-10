import {
  Award,
  BadgeCheck,
  Clock,
  FileCheck,
  Heart,
  Leaf,
  MapPin,
  Package,
  PackageCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
} from "lucide-react";
import type { PublicHighlightBlock } from "../model/content-blocks.types";

interface Props {
  block?: PublicHighlightBlock | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shieldcheck: ShieldCheck,
  package: Package,
  packagecheck: PackageCheck,
  truck: Truck,
  store: Store,
  leaf: Leaf,
  award: Award,
  heart: Heart,
  badgecheck: BadgeCheck,
  mappin: MapPin,
  clock: Clock,
  sparkles: Sparkles,
  users: Users,
  filecheck: FileCheck,
  scale: Scale,
};

function resolveIcon(name?: string) {
  if (!name) return Sparkles;
  const key = name.toLowerCase().replace(/[-_]/g, "");
  return ICON_MAP[key] ?? Sparkles;
}

export function HomeHighlightsSection({ block }: Props) {
  if (!block || !block.items || block.items.length === 0) {
    return null;
  }

  const { eyebrow, title, description, items } = block;

  return (
    <section id="trace" className="shell grid gap-8 py-16 md:grid-cols-[.85fr_1.15fr] md:py-24">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && (
          <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight text-[#214c3a]">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground whitespace-pre-line">
            {description}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, idx) => {
          const Icon = resolveIcon(item.icon);
          const orderNum = String(idx + 1).padStart(2, "0");
          const Wrapper = item.link ? "a" : "div";
          const wrapperProps = item.link
            ? {
                href: item.link,
                target: item.link.startsWith("http") ? "_blank" : undefined,
                rel: item.link.startsWith("http") ? "noopener noreferrer" : undefined,
              }
            : {};

          return (
            <Wrapper
              key={idx}
              {...wrapperProps}
              className={`rounded-2xl border border-[#e5e1d5] bg-[#fbfaf5] p-5 transition-all ${
                item.link ? "hover:border-[#285e45] hover:shadow-sm cursor-pointer block" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#285e45]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-mono text-xs text-[#a6a99b]">{orderNum}</span>
              </div>
              <h3 className="mt-4 font-bold text-base text-[#214c3a]">{item.title}</h3>
              {item.description && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              )}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}

