import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
import type { ProductFarm, ProductInput, ProductKind, ProductVariant } from '@/shared/types';
import { RichTextEditor } from '@/features/admin/components/rich-text-editor';
import { farmsOf, kindOf, variantsOf } from '@/shared/lib/product-options';
import { AppSelect } from '@/shared/ui/app-select';
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
  const [form, setForm] = useState<ProductInput>({ name: '', sku: '', category: '', description: '', origin: '', packageSize: '', shelfLife: '', storageInstructions: '', imageUrls: [], price: 0, salePrice: null, kind: 'general', descriptionHtml: '', variants: [newVariant()], farms: [] });
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
      kind: kindOf(selectedProduct),
      descriptionHtml: selectedProduct.descriptionHtml ?? '',
      variants: variantsOf(selectedProduct),
      farms: farmsOf(selectedProduct),
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
  const variants = form.variants ?? [];
  const farms = form.farms ?? [];
  const isFarm = form.kind === 'farm';
  const setVariant = (i: number, patch: Partial<ProductVariant>) => setForm(f => ({ ...f, variants: variants.map((v, j) => j === i ? { ...v, ...patch } : v) }));
  const setFarm = (i: number, patch: Partial<ProductFarm>) => setForm(f => ({ ...f, farms: farms.map((x, j) => j === i ? { ...x, ...patch } : x) }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!variants.length || variants.some(v => !v.label.trim())) return setError('Cần ít nhất một quy cách và mỗi quy cách phải có tên.');
    if (isFarm && (!farms.length || farms.some(f => !f.name.trim()))) return setError('Nông sản cần ít nhất một vườn và mỗi vườn phải có tên.');
    // Product-level price/packaging mirror the first quy cách for listings and search.
    const [first] = variants;
    save.mutate({ ...form, farms: isFarm ? farms : [], price: first.price, salePrice: first.salePrice ?? null, packageSize: first.label }, {
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
              <Field label="Loại sản phẩm" required><AppSelect value={form.kind ?? 'general'} onChange={(v: ProductKind) => setForm(f => ({ ...f, kind: v, farms: v === 'farm' && !farms.length ? [newFarm(variants)] : farms }))} options={[{ value: 'general', label: 'Sản phẩm chung' }, { value: 'farm', label: 'Nông sản (có thông tin vườn)' }]} testId="select-product-kind" /></Field>
              <Field label="Mô tả ngắn" wide><textarea className="field min-h-20" value={form.description} onChange={e => put('description', e.target.value)} data-testid="input-product-description" /></Field>
              <div className="grid gap-2 text-sm font-semibold sm:col-span-2">Thông tin sản phẩm (chi tiết)<RichTextEditor value={form.descriptionHtml ?? ''} onChange={html => setForm(f => ({ ...f, descriptionHtml: html }))} /></div>
              <Field label="Nguồn gốc / vùng trồng"><input className="field" value={form.origin} onChange={e => put('origin', e.target.value)} data-testid="input-product-origin" /></Field>
              <Field label="Hạn sử dụng"><input className="field" value={form.shelfLife} onChange={e => put('shelfLife', e.target.value)} data-testid="input-product-shelf-life" /></Field>
              <Field label="Hướng dẫn bảo quản"><input className="field" value={form.storageInstructions} onChange={e => put('storageInstructions', e.target.value)} data-testid="input-product-storage" /></Field>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold">Quy cách / Đơn vị & giá{!isFarm && ' & tồn kho'}</p><button type="button" className="btn-outline h-9 px-3 text-xs" onClick={() => setForm(f => ({ ...f, variants: [...variants, newVariant()] }))} data-testid="button-add-variant"><Plus size={14} /> Thêm quy cách</button></div>
                <div className="mt-2 grid gap-2">{variants.map((v, i) => <div key={v.id} className={`grid items-center gap-2 rounded-xl bg-[#f6f5ee] p-2.5 ${isFarm ? 'grid-cols-[1.4fr_1fr_1fr_auto]' : 'grid-cols-[1.4fr_1fr_1fr_.8fr_auto]'}`}>
                  <input required className="field" placeholder="VD: Túi 500g" value={v.label} onChange={e => setVariant(i, { label: e.target.value })} aria-label="Quy cách" data-testid={`input-variant-label-${i}`} />
                  <input type="number" min="0" required className="field" placeholder="Giá" value={v.price} onChange={e => setVariant(i, { price: Number(e.target.value) })} aria-label="Giá bán" />
                  <input type="number" min="0" className="field" placeholder="Giá KM" value={v.salePrice ?? ''} onChange={e => setVariant(i, { salePrice: e.target.value ? Number(e.target.value) : null })} aria-label="Giá khuyến mãi" />
                  {!isFarm && <input type="number" min="0" className="field" placeholder="Tồn kho" value={v.stock} onChange={e => setVariant(i, { stock: Number(e.target.value) })} aria-label="Tồn kho" data-testid={`input-variant-stock-${i}`} />}
                  <button type="button" disabled={variants.length < 2} className="p-2 text-red-700 disabled:opacity-30" onClick={() => setForm(f => ({ ...f, variants: variants.filter((_, j) => j !== i) }))} aria-label="Xoá quy cách"><Trash2 size={15} /></button>
                </div>)}</div>
                <p className="mt-1.5 text-xs text-muted-foreground">Cột giá: giá bán · giá khuyến mãi (để trống nếu không giảm){!isFarm && ' · tồn kho'}.</p>
              </div>
              {isFarm && <div className="sm:col-span-2">
                <div className="flex items-center justify-between"><p className="text-sm font-semibold">Vườn cung cấp & tồn kho theo quy cách</p><button type="button" className="btn-outline h-9 px-3 text-xs" onClick={() => setForm(f => ({ ...f, farms: [...farms, newFarm(variants)] }))} data-testid="button-add-farm"><Plus size={14} /> Thêm vườn</button></div>
                <div className="mt-2 grid gap-3">{farms.map((f, i) => <div key={f.id} className="rounded-xl bg-[#f6f5ee] p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input required className="field" placeholder="Tên vườn" value={f.name} onChange={e => setFarm(i, { name: e.target.value })} aria-label="Tên vườn" data-testid={`input-farm-name-${i}`} />
                    <input className="field" placeholder="Chủ vườn" value={f.owner} onChange={e => setFarm(i, { owner: e.target.value })} aria-label="Chủ vườn" />
                    <input className="field" placeholder="Địa chỉ vườn" value={f.location} onChange={e => setFarm(i, { location: e.target.value })} aria-label="Địa chỉ vườn" />
                    <input className="field" placeholder="Chứng nhận (VietGAP...)" value={f.certification ?? ''} onChange={e => setFarm(i, { certification: e.target.value })} aria-label="Chứng nhận" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">{variants.map(v => <label key={v.id} className="flex items-center gap-1.5 text-xs font-semibold">{v.label || 'Quy cách'}<input type="number" min="0" className="field h-9 w-20" value={f.stock[v.id] ?? 0} onChange={e => setFarm(i, { stock: { ...f.stock, [v.id]: Number(e.target.value) } })} aria-label={`Tồn kho ${v.label}`} /></label>)}
                    <button type="button" disabled={farms.length < 2} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-red-700 disabled:opacity-30" onClick={() => setForm(x => ({ ...x, farms: farms.filter((_, j) => j !== i) }))}><Trash2 size={14} /> Xoá vườn</button>
                  </div>
                </div>)}</div>
              </div>}
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

const uid = () => Math.random().toString(36).slice(2, 8);
const newVariant = (): ProductVariant => ({ id: uid(), label: '', price: 0, salePrice: null, stock: 0 });
const newFarm = (variants: ProductVariant[]): ProductFarm => ({ id: uid(), name: '', owner: '', location: '', certification: '', stock: Object.fromEntries(variants.map(v => [v.id, 0])) });
