import { useState } from 'react';
import { Link } from 'wouter';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Product } from '@/shared/types';
import { useAdminProducts, useDeleteProduct } from '@/features/admin/api/admin.queries';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { ConfirmDialog } from '@/features/admin/components/confirm-dialog';
import { StatusPill } from '@/features/agency/components/order-table';
import { priceOf } from '@/features/products/product-utils';
import { toast } from '@/hooks/use-toast';
import { imageFallback } from '@/shared/config';
import { fmt } from '@/shared/lib/format';
import { Empty, ErrorState, Loading } from '@/shared/ui/feedback';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminProducts() {
  const q = useAdminProducts('all');
  const del = useDeleteProduct();
  const [target, setTarget] = useState<Product | null>(null);
  const remove = () => target && del.mutate(target.id, {
    onSuccess: () => toast({ title: `Đã xoá “${target.name}”` }),
    onError: () => toast({ title: 'Không thể xoá sản phẩm', variant: 'destructive' }),
    onSettled: () => setTarget(null),
  });
  const addButton = <Link className="btn-primary" href="/admin/products/new"><Plus size={17} /> Thêm sản phẩm</Link>;
  return <AdminShell title="Sản phẩm">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <SectionTitle eyebrow="Danh mục" title="Quản lý sản phẩm" desc="Tạo mới, rà soát và cập nhật danh mục nông sản Mevi." />
      {addButton}
    </div>
    {q.isLoading ? <Loading /> : q.isError ? <ErrorState retry={() => q.refetch()} />
      : !q.data?.length ? <Empty title="Danh mục đang trống" detail="Thêm sản phẩm đầu tiên để bắt đầu xây dựng cửa hàng." action={addButton} />
      : <div className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-[#f3f1e8] text-xs text-muted-foreground"><tr>{['Sản phẩm', 'Mã SKU', 'Danh mục', 'Giá bán', 'Trạng thái', 'Thao tác'].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#ece8de]">{q.data.map(p => <tr key={p.id} data-testid={`row-product-${p.id}`}>
          <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.imageUrls?.[0] || imageFallback} className="h-11 w-12 rounded-lg object-cover" alt="" /><span className="font-semibold">{p.name}</span></div></td>
          <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
          <td className="px-4 py-3">{p.category}</td>
          <td className="px-4 py-3 font-semibold">{fmt(priceOf(p))}</td>
          <td className="px-4 py-3"><StatusPill status={p.status} /></td>
          <td className="px-4 py-3"><div className="flex gap-1">
            <Link className="rounded-lg p-2 text-[#285e45] hover:bg-[#eef1e9]" href={`/admin/products/${p.id}/edit`} aria-label="Chỉnh sửa sản phẩm" data-testid={`button-edit-product-${p.id}`}><Pencil size={16} /></Link>
            <button className="rounded-lg p-2 text-[#a7473d] hover:bg-[#f7e8e4]" onClick={() => setTarget(p)} aria-label="Xóa sản phẩm" data-testid={`button-delete-product-${p.id}`}><Trash2 size={16} /></button>
          </div></td>
        </tr>)}</tbody>
      </table></div></div>}
    <ConfirmDialog open={!!target} danger pending={del.isPending} title={`Xoá sản phẩm “${target?.name ?? ''}”?`}
      description="Sản phẩm sẽ bị gỡ khỏi danh mục và cửa hàng. Không thể hoàn tác." confirmLabel="Xoá" onCancel={() => setTarget(null)} onConfirm={remove} />
  </AdminShell>;
}
