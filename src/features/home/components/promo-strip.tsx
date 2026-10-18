import { ShieldCheck, Tag, Truck } from 'lucide-react';

export function PromoStrip() {
  const promos = [
    { icon: <Truck />, title: 'Freeship đơn từ 300K', desc: 'Nội thành TP.HCM & Hà Nội', color: '#7fa36b', bg: '#e3ece6' },
    { icon: <Tag />, title: 'Giảm 30K đơn đầu tiên', desc: 'Nhập mã MEVIMOI khi đặt hàng', color: '#bd6e46', bg: '#f6e6dc' },
    { icon: <ShieldCheck />, title: 'Đổi trả trong 24h', desc: 'Nếu sản phẩm không đạt chất lượng', color: '#5f8f6e', bg: '#e8eee3' },
  ];
  return <section className="shell mt-5 grid gap-3 md:grid-cols-3">{promos.map(p => <div key={p.title} className="flex items-center gap-4 rounded-2xl p-4" style={{ background: p.bg }}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white" style={{ color: p.color }}>{p.icon}</span><div><p className="font-extrabold text-[#214c3a]">{p.title}</p><p className="text-xs text-[#5c6c60]">{p.desc}</p></div></div>)}</section>;
}
