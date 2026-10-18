import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowLeft, Upload, X } from 'lucide-react';
import type { ProductInput } from '@/shared/types';
import { useAdminProducts, useSaveProduct } from '@/features/admin/api/admin.queries';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { toast } from '@/hooks/use-toast';
import { readAsDataUrl } from '@/shared/lib/file';
import { ErrorState, Empty, Loading } from '@/shared/ui/feedback';
import { Field } from '@/shared/ui/field';
import { SectionTitle } from '@/shared/ui/section-title';

export function AdminProductEditor() {
  const [editMatch, editParams] = useRoute('/admin/products/:id/edit');
  const productId = editMatch ? Number(editParams?.id) : null;
  const productQuery = useAdminProducts('all');
  const save = useSaveProduct(productId);
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<ProductInput>({ name: '', sku: '', category: '', description: '', origin: '', packageSize: '', shelfLife: '', storageInstructions: '', imageUrls: [], price: 0, salePrice: null });
  const [loadedEdit, setLoadedEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const editing = productId !== null;
  const selectedProduct = productQuery.data?.find(product => product.id === productId);

  useEffect(() => {
    if (!editing || !productQuery.data || loadedEdit) return;
    if (!selectedProduct) {
      setError('Không tìm thấy sản phẩm cần chỉnh sửa.');
      setLoadedEdit(true);
      return;
    }
    setForm({
      name: selectedProduct.name,
      sku: selectedProduct.sku,
      category: selectedProduct.category,
      description: selectedProduct.description,
      origin: selectedProduct.origin,
      packageSize: selectedProduct.packageSize,
      shelfLife: selectedProduct.shelfLife,
      storageInstructions: selectedProduct.storageInstructions,
      imageUrls: selectedProduct.imageUrls,
      price: selectedProduct.price,
      salePrice: selectedProduct.salePrice ?? null,
    });
    setLoadedEdit(true);
  }, [editing, productQuery.data, loadedEdit, selectedProduct]);

  const put = (key: keyof ProductInput, value: string | number | null) =>
    setForm(old => ({ ...old, [key]: value }));
  const imageUpload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Chọn ảnh JPEG, PNG hoặc WebP nhỏ hơn 8 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const dataUrl = await readAsDataUrl(file);
      setForm(old => ({ ...old, imageUrls: [...old.imageUrls, dataUrl] }));
    } catch {
      setError('Không thể tải ảnh lên. Vui lòng thử ảnh JPEG, PNG hoặc WebP.');
    } finally {
      setUploading(false);
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    save.mutate(form, {
      onSuccess: () => { toast({ title: editing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm', description: editing ? undefined : 'Sản phẩm mới ở trạng thái chờ duyệt.' }); setLocation('/admin/products'); },
      onError: () => setError(editing ? 'Không thể cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.' : 'Không thể lưu sản phẩm. Vui lòng kiểm tra lại thông tin.'),
    });
  };
  const saving = save.isPending;
  const ready = !editing || (productQuery.isSuccess && loadedEdit);
  return <AdminShell title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
    {editing && productQuery.isError ? <ErrorState retry={() => productQuery.refetch()} /> :
      editing && productQuery.isSuccess && loadedEdit && !selectedProduct
        ? <Empty title="Không tìm thấy sản phẩm" detail="Sản phẩm có thể đã bị xóa khỏi danh mục." action={<Link href="/admin/products" className="btn-primary">Về danh mục</Link>} />
        : !ready ? <Loading label="Đang tải sản phẩm" /> : <>
          <Link href="/admin/products" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={15} /> Danh mục</Link>
          <SectionTitle eyebrow={`Danh mục / ${editing ? 'Chỉnh sửa' : 'Thêm mới'}`} title={editing ? 'Cập nhật thông tin sản phẩm' : 'Thông tin sản phẩm'} desc="Thông tin này sẽ được dùng trên trang sản phẩm và mục truy xuất nguồn gốc." />
          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="surface grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
              <Field label="Tên sản phẩm" required wide><input required className="field" value={form.name} onChange={e => put('name', e.target.value)} data-testid="input-product-name" /></Field>
              <Field label="Mã SKU" required><input required className="field" value={form.sku} onChange={e => put('sku', e.target.value)} data-testid="input-product-sku" /></Field>
              <Field label="Danh mục" required><input required className="field" value={form.category} onChange={e => put('category', e.target.value)} data-testid="input-product-category" /></Field>
              <Field label="Mô tả" wide><textarea className="field min-h-24" value={form.description} onChange={e => put('description', e.target.value)} data-testid="input-product-description" /></Field>
              <Field label="Nguồn gốc / vùng trồng"><input className="field" value={form.origin} onChange={e => put('origin', e.target.value)} data-testid="input-product-origin" /></Field>
              <Field label="Quy cách đóng gói"><input className="field" value={form.packageSize} onChange={e => put('packageSize', e.target.value)} data-testid="input-product-package" /></Field>
              <Field label="Hạn sử dụng"><input className="field" value={form.shelfLife} onChange={e => put('shelfLife', e.target.value)} data-testid="input-product-shelf-life" /></Field>
              <Field label="Hướng dẫn bảo quản"><input className="field" value={form.storageInstructions} onChange={e => put('storageInstructions', e.target.value)} data-testid="input-product-storage" /></Field>
              <Field label="Giá bán (VND)" required><input type="number" min="0" required className="field" value={form.price} onChange={e => put('price', Number(e.target.value))} data-testid="input-product-price" /></Field>
              <Field label="Giá khuyến mãi (VND)"><input type="number" min="0" className="field" value={form.salePrice ?? ''} onChange={e => put('salePrice', e.target.value ? Number(e.target.value) : null)} data-testid="input-product-sale-price" /></Field>
              <div className="sm:col-span-2">
                {error && <p className="mb-3 text-sm text-red-700" role="alert">{error}</p>}
                <button className="btn-primary" disabled={saving || uploading} data-testid="button-save-product">{saving ? 'Đang lưu...' : editing ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}</button>
              </div>
            </div>
            <aside className="surface h-fit p-5">
              <h2 className="font-bold">Hình ảnh sản phẩm</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Tải ảnh JPEG, PNG hoặc WebP. Hình ảnh hiển thị trên cửa hàng Mevi.</p>
              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-[#c9cbbd] bg-[#f6f5ee] px-4 py-7 text-center text-sm font-semibold text-[#52645a] hover:border-[#285e45]">
                <Upload className="mb-2 text-[#285e45]" size={20} />{uploading ? 'Đang tải ảnh...' : 'Chọn ảnh để tải lên'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={e => void imageUpload(e.target.files?.[0])} data-testid="input-product-image" />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2">{form.imageUrls.map((url, i) => <div key={`${url}-${i}`} className="relative">
                <img src={url} alt={`Ảnh sản phẩm ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                <button type="button" className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-red-700" onClick={() => setForm(old => ({ ...old, imageUrls: old.imageUrls.filter((_, j) => j !== i) }))} aria-label="Xóa ảnh" data-testid={`button-remove-image-${i}`}><X size={14} /></button>
              </div>)}</div>
            </aside>
          </form>
        </>}
  </AdminShell>;
}
