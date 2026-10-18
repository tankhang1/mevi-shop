import { useCreateOrder } from '@/features/checkout/api/orders.queries';
import { useCart } from '@/features/cart/model/cart.store';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Banknote } from 'lucide-react';
import { shopRef } from '@/app/providers/agency-brand-provider';
import { priceOf } from '@/features/products/product-utils';
import { fmt } from '@/shared/lib/format';
import { Empty } from '@/shared/ui/feedback';
import { Field } from '@/shared/ui/field';
import { PageFrame } from '@/shared/ui/layout';
import { SectionTitle } from '@/shared/ui/section-title';

export function CheckoutPage() {
  const cart = useCart(); const [, setLocation] = useLocation(); const createOrder = useCreateOrder();
  const [values, setValues] = useState({ customerName: '', phone: '', province: '', district: '', address: '', note: '' });
  const [message, setMessage] = useState('');
  const set = (key: keyof typeof values, value: string) => setValues(old => ({ ...old, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!cart.items.length) { setMessage('Giỏ hàng đang trống.'); return; }
    createOrder.mutate({ ...values, note: values.note || null, agencySlug: shopRef() || null, items: cart.items.map(item => ({ productId: item.productId, quantity: item.quantity })) }, {
      onSuccess: order => { localStorage.setItem('mevi-last-order', JSON.stringify(order)); cart.clear(); setLocation('/checkout/success'); },
      onError: () => setMessage('Chưa thể ghi nhận đơn. Vui lòng kiểm tra thông tin và thử lại.'),
    });
  };
  if (!cart.items.length) return <PageFrame><main className="shell py-12"><Empty title="Chưa có sản phẩm để đặt" detail="Thêm nông sản vào giỏ trước khi xác nhận đơn." action={<Link href="/shop" className="btn-primary">Về cửa hàng</Link>} /></main></PageFrame>;
  return <PageFrame><main className="shell py-9 md:py-12"><Link href="/cart" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={16} /> Giỏ hàng</Link><SectionTitle eyebrow="Bước cuối" title="Xác nhận đơn đặt hàng" desc="Nhân viên Mevi sẽ liên hệ để xác nhận giao hàng và phương thức thanh toán." /><form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[1fr_370px]"><section className="surface p-5 sm:p-7"><h2 className="text-lg font-bold">Thông tin người nhận</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Họ và tên" required><input className="field" required value={values.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Nguyễn Văn An" data-testid="input-customer-name" /></Field><Field label="Số điện thoại" required><input className="field" required minLength={6} value={values.phone} onChange={e => set('phone', e.target.value)} placeholder="090 123 4567" data-testid="input-customer-phone" /></Field><Field label="Tỉnh / thành phố" required><input className="field" required value={values.province} onChange={e => set('province', e.target.value)} placeholder="Tỉnh hoặc thành phố" data-testid="input-province" /></Field><Field label="Quận / huyện" required><input className="field" required value={values.district} onChange={e => set('district', e.target.value)} placeholder="Quận hoặc huyện" data-testid="input-district" /></Field><Field label="Địa chỉ nhận hàng" required wide><input className="field" required value={values.address} onChange={e => set('address', e.target.value)} placeholder="Số nhà, tên đường, phường / xã" data-testid="input-address" /></Field><Field label="Ghi chú cho đơn hàng" wide><textarea className="field min-h-24 resize-y" value={values.note} onChange={e => set('note', e.target.value)} placeholder="Khung giờ nhận, lưu ý giao hàng..." data-testid="input-order-note" /></Field></div></section><aside className="surface p-5 sm:p-6"><h2 className="font-bold">Đơn hàng của bạn</h2><div className="mt-4 space-y-3">{cart.items.map(item => <div key={item.productId} className="flex justify-between gap-3 text-sm"><span className="min-w-0">{item.product.name} <span className="text-muted-foreground">× {item.quantity}</span></span><strong className="shrink-0">{fmt(priceOf(item.product) * item.quantity)}</strong></div>)}</div><div className="mt-4 border-t border-[#e9e5db] pt-4"><div className="flex justify-between font-bold"><span>Tổng cộng</span><span className="text-[#285e45]">{fmt(cart.total)}</span></div></div><div className="mt-5 rounded-xl border border-[#e6d9c8] bg-[#f6f0e4] p-4" data-testid="notice-payment"><p className="flex items-center gap-2 font-bold text-[#805a35]"><Banknote size={17} /> Thanh toán ngoài hệ thống</p><p className="mt-2 text-xs leading-5 text-[#6f6658]">Không thanh toán trực tuyến. Bạn thanh toán khi nhận hàng (COD) hoặc chuyển khoản trực tiếp sau khi nhân viên Mevi xác nhận đơn.</p></div>{message && <p className="mt-4 text-sm text-[#a43e36]" role="alert" data-testid="status-order-error">{message}</p>}<button className="btn-primary mt-5 w-full" disabled={createOrder.isPending} data-testid="button-place-order">{createOrder.isPending ? 'Đang gửi đơn...' : 'Đặt hàng'}</button><p className="mt-3 text-center text-[11px] text-muted-foreground">Đặt hàng không đồng nghĩa với thanh toán</p></aside></form></main></PageFrame>;
}
