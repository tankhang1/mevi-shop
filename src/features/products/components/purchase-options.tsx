import { useState } from "react";
import { BadgeCheck, MapPin, Minus, Plus, Sprout, UserRound } from "lucide-react";
import type { Product } from "@/shared/types";
import { farmsOf, kindOf, stockOf, variantOf, variantPrice, variantsOf } from "@/shared/lib/product-options";
import { fmt } from "@/shared/lib/format";

export interface PurchaseSelection { variantId: string; farmId: string | null; quantity: number }

/** Selection state with sensible defaults: first in-stock variant, first farm that has it. */
export function usePurchaseSelection(product: Product) {
  const variants = variantsOf(product);
  const farms = farmsOf(product);
  const firstVariant = variants.find(v => stockOf(product, v.id) > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstVariant.id);
  const [farmId, setFarmId] = useState<string | null>(farms.find(f => (f.stock[firstVariant.id] ?? 0) > 0)?.id ?? farms[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const isFarm = kindOf(product) === "farm";
  const stock = stockOf(product, variantId, isFarm ? farmId : undefined);
  const variant = variantOf(product, variantId);
  const selectVariant = (id: string) => {
    setVariantId(id);
    // Keep the chosen farm if it has this variant, otherwise jump to one that does.
    if (isFarm && !(farms.find(f => f.id === farmId)?.stock[id] ?? 0)) setFarmId(farms.find(f => (f.stock[id] ?? 0) > 0)?.id ?? farmId);
    setQuantity(1);
  };
  const selectFarm = (id: string) => { setFarmId(id); setQuantity(1); };
  return {
    selection: { variantId, farmId: isFarm ? farmId : null, quantity } as PurchaseSelection,
    variant, stock, isFarm, unitPrice: variantPrice(variant),
    canBuy: stock > 0 && quantity <= stock && (!isFarm || !!farmId),
    selectVariant, selectFarm, setQuantity: (q: number) => setQuantity(Math.max(1, Math.min(q, Math.max(stock, 1)))),
  };
}

export type PurchaseState = ReturnType<typeof usePurchaseSelection>;

export function PurchaseOptions({ product, state, compact }: { product: Product; state: PurchaseState; compact?: boolean }) {
  const { selection, stock, isFarm } = state;
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-[#214c3a]">Quy cách / Đơn vị</p>
        <div className="mt-2 flex flex-wrap gap-2">{variantsOf(product).map(v => {
          const left = stockOf(product, v.id);
          const on = v.id === selection.variantId;
          return <button key={v.id} type="button" disabled={!left} onClick={() => state.selectVariant(v.id)} data-testid={`option-variant-${v.id}`}
            className={`rounded-xl border px-3.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-[#285e45] bg-[#eef1e9] ring-1 ring-[#285e45]" : "border-[#deddd2] bg-white hover:border-[#285e45]"}`}>
            <span className="block font-bold text-[#214c3a]">{v.label}</span>
            <span className="block text-xs text-[#bd6e46] font-bold">{fmt(variantPrice(v))}{!left && <span className="ml-1 font-semibold text-muted-foreground">· Hết hàng</span>}</span>
          </button>;
        })}</div>
      </div>

      {isFarm && <div>
        <p className="text-sm font-bold text-[#214c3a]">Chọn vườn</p>
        <div className={`mt-2 grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>{farmsOf(product).map(f => {
          const left = f.stock[selection.variantId] ?? 0;
          const on = f.id === selection.farmId;
          return <button key={f.id} type="button" disabled={!left} onClick={() => state.selectFarm(f.id)} data-testid={`option-farm-${f.id}`}
            className={`rounded-xl border p-3 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-45 ${on ? "border-[#285e45] bg-[#eef1e9] ring-1 ring-[#285e45]" : "border-[#deddd2] bg-white hover:border-[#285e45]"}`}>
            <span className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-sm font-bold text-[#214c3a]"><Sprout size={14} className="text-[#285e45]" />{f.name}</span>{f.certification && <span className="inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#285e45]"><BadgeCheck size={11} />{f.certification}</span>}</span>
            <span className="mt-1 flex items-center gap-1.5 text-[#52645a]"><UserRound size={12} />{f.owner}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[#52645a]"><MapPin size={12} />{f.location}</span>
            <span className={`mt-1.5 block font-bold ${left ? "text-[#285e45]" : "text-[#a7473d]"}`}>{left ? `Còn ${left} sản phẩm` : "Hết hàng quy cách này"}</span>
          </button>;
        })}</div>
      </div>}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#214c3a]">Số lượng</p>
          <p className={`mt-0.5 text-xs ${stock ? "text-muted-foreground" : "font-bold text-[#a7473d]"}`} data-testid="text-stock">{stock ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}</p>
        </div>
        <div className="flex items-center rounded-xl border border-[#deddd2] bg-[#faf9f4] p-1">
          <button type="button" onClick={() => state.setQuantity(selection.quantity - 1)} disabled={selection.quantity <= 1} aria-label="Giảm số lượng" className="grid h-8 w-8 place-items-center rounded-lg text-[#52645a] hover:bg-white disabled:opacity-35" data-testid="btn-qty-minus"><Minus size={15} /></button>
          <span className="min-w-10 text-center text-sm font-bold text-[#214c3a]" data-testid="text-qty">{selection.quantity}</span>
          <button type="button" onClick={() => state.setQuantity(selection.quantity + 1)} disabled={selection.quantity >= stock} aria-label="Tăng số lượng" className="grid h-8 w-8 place-items-center rounded-lg text-[#52645a] hover:bg-white disabled:opacity-35" data-testid="btn-qty-plus"><Plus size={15} /></button>
        </div>
      </div>
    </div>
  );
}
