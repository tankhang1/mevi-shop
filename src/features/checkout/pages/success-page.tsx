import { Link } from 'wouter';
import type { Order } from '@/lib/api';
import { Check } from 'lucide-react';
import { fmt, statusLabel } from '@/shared/lib/format';
import { PageFrame } from '@/shared/ui/layout';

export function SuccessPage() {
  let order: Order | null = null; try { order = JSON.parse(localStorage.getItem('mevi-last-order') || 'null'); } catch { order = null; }
  return <PageFrame><main className="shell grid min-h-[68vh] place-items-center py-12"><div className="surface w-full max-w-2xl p-6 text-center sm:p-10"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e5efe5] text-[#285e45]"><Check size={30} /></span><p className="eyebrow mt-5">Mevi đã nhận được thông tin</p><h1 className="mt-2 text-3xl font-bold">Đơn đặt hàng đã được ghi nhận</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Đội ngũ Mevi sẽ liên hệ để xác nhận đơn hàng và hướng dẫn nhận hàng, thanh toán.</p>{order && <div className="mt-7 rounded-2xl bg-[#f3f1e8] p-5 text-left" data-testid="panel-order-recap"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0ddd2] pb-4"><div><p className="text-xs text-muted-foreground">Mã đơn đặt hàng</p><p className="mt-1 font-mono text-lg font-bold" data-testid="text-order-code">{order.code}</p></div><span className="rounded-full bg-[#e3eee2] px-3 py-1 text-xs font-bold text-[#285e45]">{statusLabel(order.status)}</span></div><div className="mt-4 flex justify-between text-sm"><span>{order.items?.length || 0} mặt hàng</span><strong>{fmt(order.total)}</strong></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Thanh toán COD hoặc chuyển khoản trực tiếp sau khi nhân viên xác nhận. Không có thanh toán online.</p></div>}<div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/shop" className="btn-primary">Tiếp tục mua sắm</Link><Link href="/" className="btn-outline">Về trang chủ</Link></div></div></main></PageFrame>;
}
