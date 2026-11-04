export const volumeTiers = [
  { name: 'Khởi đầu', range: '5 – 20 triệu ₫/tháng', discount: 5, perks: ['Giá sỉ cho mọi sản phẩm', 'Thanh toán COD hoặc chuyển khoản', 'Hỗ trợ qua hotline'] },
  { name: 'Phát triển', range: '20 – 50 triệu ₫/tháng', discount: 10, perks: ['Mọi quyền lợi gói Khởi đầu', 'Công nợ 7 ngày', 'Ưu tiên hàng mùa vụ', 'Quản lý tài khoản riêng'], featured: true },
  { name: 'Chiến lược', range: 'Trên 50 triệu ₫/tháng', discount: 15, perks: ['Mọi quyền lợi gói Phát triển', 'Công nợ 30 ngày', 'Đóng gói theo thương hiệu riêng', 'Tham quan vùng trồng'] },
];

export const businessTypes = [
  { value: 'agency', label: 'Đại lý / cửa hàng bán lẻ' }, { value: 'restaurant', label: 'Nhà hàng / quán ăn' },
  { value: 'cafe', label: 'Quán cà phê / trà' }, { value: 'company', label: 'Bếp ăn công ty / trường học' }, { value: 'other', label: 'Khác' },
] as const;

export const volumeOptions = [
  { value: 'lt20', label: 'Dưới 20 triệu ₫/tháng' }, { value: '20-50', label: '20 – 50 triệu ₫/tháng' }, { value: 'gt50', label: 'Trên 50 triệu ₫/tháng' },
] as const;

export type BusinessType = typeof businessTypes[number]['value'];

export type VolumeKey = typeof volumeOptions[number]['value'];

export const faqs = [
  { q: 'Đơn hàng sỉ tối thiểu là bao nhiêu?', a: 'Đơn sỉ tối thiểu là 3 triệu ₫ mỗi lần đặt. Chiết khấu được tính theo tổng giá trị mua trong tháng: gói Khởi đầu (5 – 20 triệu ₫/tháng) giảm 5%, gói Phát triển (20 – 50 triệu ₫/tháng) giảm 10% và gói Chiến lược (trên 50 triệu ₫/tháng) giảm 15%. Giá sỉ theo từng mức chiết khấu chưa gồm phí vận chuyển.' },
  { q: 'Đại lý có được gian hàng riêng không?', a: 'Có. Mỗi đại lý được cấp đường dẫn gian hàng mang logo và màu thương hiệu riêng để chia sẻ với khách. Đơn đặt qua đường dẫn này được ghi nhận cho đại lý và theo dõi trên bảng điều khiển, còn Mevi lo phần kho và giao hàng. Đại lý nhận hoa hồng trên mỗi đơn.' },
  { q: 'Mevi giao hàng sỉ đến đâu?', a: 'Mevi giao toàn quốc qua kho TP. Hồ Chí Minh và Hà Nội. Hàng tươi được vận chuyển bằng xe bảo ôn trong 24–48 giờ để giữ chất lượng. Với nhà hàng, quán ăn và bếp tập thể, Mevi có thể giao tận bếp theo lịch cố định hằng tuần. Đơn đầu tiên sau khi ký hợp đồng được giao trong 48 giờ.' },
  { q: 'Thanh toán như thế nào?', a: 'Đối tác có thể thanh toán COD hoặc chuyển khoản. Gói Phát triển được hưởng công nợ 7 ngày và gói Chiến lược được hưởng công nợ 30 ngày. Khách sỉ được cung cấp hóa đơn VAT đầy đủ.' },
  { q: 'Nếu hàng không đạt chất lượng thì sao?', a: 'Mevi đổi hoặc hoàn tiền trong 24 giờ kể từ khi nhận hàng. Bạn chỉ cần gửi kèm hình ảnh sản phẩm lỗi qua hotline 1900 6868 hoặc email sale@mevi.vn. Mỗi lô hàng đều có tem QR để truy xuất nguồn gốc, giúp Mevi xác định đúng lô cần xử lý.' },
];

export const WHOLESALE_LEADS_KEY = 'mevi-wholesale-leads';
