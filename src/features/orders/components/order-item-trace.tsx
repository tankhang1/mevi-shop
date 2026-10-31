import { QRCodeSVG } from "qrcode.react";
import { Link } from "wouter";
import { ExternalLink, MapPin, Sprout } from "lucide-react";
import type { OrderItem, Product } from "@/shared/types";
import { traceOf } from "@/features/trace/model/trace";
import { shopOfProduct } from "@/features/shops/model/shops";
import { basePath } from "@/shared/config";
import { dateFmt, fmt } from "@/shared/lib/format";

/** Line item of a completed order with its farm origin and a scannable traceability QR. */
export function OrderItemTrace({ item, product }: { item: OrderItem; product?: Product }) {
  if (!product) return <BasicLine item={item} />;
  const trace = traceOf(product);
  const shop = shopOfProduct(product.id);
  const tracePath = `/trace?code=${encodeURIComponent(trace.batch)}`;
  return (
    <div className="p-3.5" data-testid={`order-item-trace-${item.id}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 font-bold text-[#214c3a] text-xs">{item.productName}</p>
        <strong className="text-xs font-bold text-[#285e45]">{fmt(item.lineTotal)}</strong>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-[#faf9f4] p-2.5 text-[11px]">
        <div><dt className="text-muted-foreground">Số lượng</dt><dd className="mt-0.5 font-bold text-[#214c3a]">{item.quantity}</dd></div>
        <div><dt className="text-muted-foreground">Quy cách/Đơn vị</dt><dd className="mt-0.5 font-bold text-[#214c3a]">{item.variantLabel ?? product.packageSize}</dd></div>
        <div><dt className="text-muted-foreground">Đơn giá</dt><dd className="mt-0.5 font-bold text-[#214c3a]">{fmt(item.unitPrice)}</dd></div>
      </dl>
      <div className="mt-2 flex gap-3 rounded-xl border border-dashed border-[#cfdccf] bg-[#f3f7f1] p-2.5">
        <Link href={tracePath} className="shrink-0 rounded-lg bg-white p-1.5" aria-label="Mở trang truy xuất nguồn gốc">
          <QRCodeSVG value={`${window.location.origin}${basePath}${tracePath}`} size={72} fgColor="#214c3a" />
        </Link>
        <div className="min-w-0 flex-1 space-y-1 text-[11px] text-[#3d5045]">
          <p className="flex items-center gap-1.5 font-bold text-[#285e45]"><Sprout size={13} />{item.farmName ?? shop?.name ?? "Nông hộ đối tác Mevi"}</p>
          <p className="flex items-center gap-1.5"><MapPin size={12} className="shrink-0 text-[#285e45]" />{product.origin}</p>
          <p>Lô <span className="font-mono font-bold">{trace.batch}</span> · Thu hoạch {dateFmt(trace.harvested)}</p>
          <Link href={tracePath} className="inline-flex items-center gap-1 font-bold text-[#285e45]">Xem truy xuất nguồn gốc <ExternalLink size={11} /></Link>
        </div>
      </div>
    </div>
  );
}

export function BasicLine({ item, packageSize }: { item: OrderItem; packageSize?: string }) {
  return (
    <div className="p-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[#214c3a] text-xs truncate">{item.productName}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{fmt(item.unitPrice)} × {item.quantity}{packageSize ? ` · ${packageSize}` : ""}</p>
      </div>
      <strong className="text-xs font-bold text-[#285e45]">{fmt(item.lineTotal)}</strong>
    </div>
  );
}
