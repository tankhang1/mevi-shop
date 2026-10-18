export const fmt = (amount = 0) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

export const dateFmt = (date?: string) => date ? new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

export const compactNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : String(n);
// Only approved (publicly listed) products count toward a shop's stats.

export function statusLabel(status: string) { const labels: Record<string,string> = { new:'Mới', confirmed:'Đã xác nhận', processing:'Đang xử lý', shipped:'Đang giao', completed:'Hoàn tất', cancelled:'Đã hủy', pending:'Chờ duyệt', approved:'Đã duyệt', rejected:'Từ chối' }; return labels[status] || status; }
