import { shopOfProduct } from '@/features/shops/model/shops';

// Dummy traceability record for a product's current batch, derived from its id.
export interface TraceStep { key: string; title: string; place: string; date: string; detail: string; image: string }
export interface TraceRecord { batch: string; harvested: string; packed: string; certifications: string[]; temperature: string; inspector: string; steps: TraceStep[] }
export function traceOf(product: { id: number; sku: string; name: string; origin: string; storageInstructions: string; imageUrls?: string[] }): TraceRecord {
  const shop = shopOfProduct(product.id);
  const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const offset = product.id % 4;
  const batch = `${product.sku}-L${String(240 + product.id * 7).padStart(4, '0')}`;
  const certs = ['VietGAP', ...(product.id % 3 === 0 ? ['OCOP 4 sao'] : []), ...(shop?.verified ? ['Mevi xác minh'] : []), ...(product.id % 2 === 0 ? ['Hữu cơ'] : [])];
  const img = (n: number) => product.imageUrls?.[n] || product.imageUrls?.[0] || '';
  return {
    batch, harvested: day(8 + offset), packed: day(6 + offset), certifications: certs,
    temperature: /lạnh|2–6/.test(product.storageInstructions) ? '2–6°C (chuỗi lạnh)' : 'Nhiệt độ phòng, khô ráo',
    inspector: 'Trung tâm Kiểm nghiệm Mevi',
    steps: [
      { key: 'farm', title: 'Vùng trồng', place: product.origin, date: day(40 + offset), detail: `Canh tác tại ${shop?.name ?? 'nông hộ đối tác'}, nhật ký đồng ruộng được ghi chép đầy đủ.`, image: img(3) },
      { key: 'harvest', title: 'Thu hoạch', place: product.origin, date: day(8 + offset), detail: 'Thu hoạch đúng độ chín, phân loại ngay tại vườn.', image: img(2) },
      { key: 'pack', title: 'Sơ chế & đóng gói', place: shop?.location ?? product.origin, date: day(6 + offset), detail: `Đóng gói theo lô ${batch}, dán tem truy xuất QR.`, image: img(1) },
      { key: 'qc', title: 'Kiểm định chất lượng', place: 'Trung tâm Kiểm nghiệm Mevi', date: day(5 + offset), detail: 'Đạt chỉ tiêu dư lượng thuốc BVTV và vi sinh theo QCVN.', image: img(0) },
      { key: 'ship', title: 'Vận chuyển', place: 'Kho Mevi TP. Hồ Chí Minh', date: day(3 + offset), detail: 'Vận chuyển trong xe bảo ôn, giám sát nhiệt độ liên tục.', image: img(1) },
      { key: 'home', title: 'Sẵn sàng giao đến bạn', place: 'Toàn quốc', date: day(1), detail: 'Hàng được giao trong 1–2 ngày sau khi đặt.', image: img(0) },
    ],
  };
}
