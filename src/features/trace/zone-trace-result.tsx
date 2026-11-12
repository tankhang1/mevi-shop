import { MapPin, Sprout, Store } from "lucide-react";
import { Detail } from "@/shared/ui/field";
import type { TraceabilityZone } from "./api/traceability.api";

/** Real traceability record of a production zone (garden). */
export function ZoneTraceResult({ zone }: { zone: TraceabilityZone }) {
  const w = zone.workspace;
  const owner = w?.metadataJson?.farmDisplayName || w?.brandName || w?.name;
  const place = [w?.address, w?.ward, w?.province].filter(Boolean).join(", ");
  const crops = zone.subjects
    .map((s) => [s.name, ...(s.variants ?? []).map((v) => v.name)].join(" · "))
    .join("; ");
  return (
    <section
      className="surface rise mt-8 p-5 md:p-7"
      data-testid="trace-zone-result"
    >
      <p className="eyebrow">Thông tin vườn</p>
      <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-[#214c3a]">
        <Sprout className="text-[#285e45]" />
        {zone.name}
      </h2>
      <dl className="mt-5 grid gap-4 border-t border-[#ece8de] pt-4 text-sm sm:grid-cols-2">
        {crops && <Detail label="Cây trồng / giống" value={crops} />}
        {zone.productionMethod && (
          <Detail
            label="Phương pháp sản xuất"
            value={zone.productionMethod.name}
          />
        )}
        {zone.rearingMethod && (
          <Detail
            label="Phương pháp canh tác"
            value={zone.rearingMethod.name}
          />
        )}
      </dl>
      {(owner || place) && (
        <div className="mt-5 space-y-1.5 rounded-xl bg-[#eef1e9] p-4 text-sm text-[#3d5045]">
          {owner && (
            <p className="flex items-center gap-2 font-bold">
              <Store size={15} />
              {owner}
            </p>
          )}
          {place && (
            <p className="flex items-center gap-2">
              <MapPin size={15} />
              {place}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
