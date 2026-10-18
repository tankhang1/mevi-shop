import { px } from '@/shared/lib/pexels';

// Dummy seller shops and product reviews. Frontend-only: there is no backend,
// and generated data is seeded by id so it is stable across reloads.
export interface Shop {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  avatar: string;
  cover: string;
  joined: string;
  followers: number;
  responseRate: number;
  verified: boolean;
  productIds: number[];
}

export const shops: Shop[] = [
  { slug: 'nong-trai-da-lat-xanh', name: 'Nông trại Đà Lạt Xanh', tagline: 'Rau củ sạch hái mỗi sáng', description: 'Hợp tác xã gồm 40 hộ nông dân tại Đà Lạt và Đơn Dương, canh tác nhà màng theo tiêu chuẩn VietGAP. Rau được thu hoạch lúc sáng sớm và đóng gói ngay tại vườn.', location: 'Đà Lạt, Lâm Đồng', avatar: px(1199562, 200), cover: px(2733918, 1600), joined: '2021', followers: 12840, responseRate: 98, verified: true, productIds: [7, 8, 12, 13, 14, 15, 18] },
  { slug: 'ca-phe-tay-nguyen', name: 'Cà phê Tây Nguyên', tagline: 'Rang mộc từ đất đỏ bazan', description: 'Xưởng rang thủ công tại Buôn Ma Thuột, chỉ dùng hạt chín 100% từ các nông hộ quen. Ngoài cà phê, chúng tôi bán thêm bơ sáp đúng vụ từ vườn nhà.', location: 'Buôn Ma Thuột, Đắk Lắk', avatar: '/products/buon-ma-thuot-robusta.jpg', cover: '/products/buon-ma-thuot-robusta.jpg', joined: '2020', followers: 9310, responseRate: 95, verified: true, productIds: [1, 11] },
  { slug: 'dac-san-mien-tay', name: 'Đặc sản Miền Tây', tagline: 'Gạo thơm, trái cây sấy quê nhà', description: 'Mang hương vị đồng bằng sông Cửu Long đến mọi gian bếp: gạo ST25 chính gốc Sóc Trăng và trái cây sấy giòn không đường hóa học.', location: 'Sóc Trăng', avatar: px(4110251, 200), cover: px(4110251, 1600), joined: '2022', followers: 6120, responseRate: 92, verified: false, productIds: [3, 4] },
  { slug: 'vuon-trai-cay-viet', name: 'Vườn Trái Cây Việt', tagline: 'Đặc sản trái cây ba miền', description: 'Kết nối trực tiếp với nhà vườn Ninh Thuận và Ninh Bình, đưa nho, dứa chín cây đến tay khách trong 48 giờ sau thu hoạch.', location: 'Phan Rang, Ninh Thuận', avatar: px(760281, 200), cover: px(1132047, 1600), joined: '2022', followers: 7480, responseRate: 97, verified: true, productIds: [9, 10] },
  { slug: 'tra-gia-vi-viet', name: 'Trà & Gia vị Việt', tagline: 'Hương vị Việt trong từng gói', description: 'Tuyển chọn trà Thái Nguyên, Ô long Bảo Lộc và các loại gia vị đặc sản như tiêu Phú Quốc, ớt Quảng Ngãi.', location: 'Thái Nguyên', avatar: px(1417945, 200), cover: px(461428, 1600), joined: '2021', followers: 5230, responseRate: 94, verified: false, productIds: [2, 6, 16, 17] },
  { slug: 'moc-chau-farm', name: 'Mộc Châu Farm', tagline: 'Sữa tươi từ cao nguyên', description: 'Trang trại bò sữa trên cao nguyên Mộc Châu, sữa được thanh trùng và giao lạnh trong ngày.', location: 'Mộc Châu, Sơn La', avatar: px(5946720, 200), cover: px(5946720, 1600), joined: '2023', followers: 3870, responseRate: 99, verified: true, productIds: [5] },
];

export const shopOfProduct = (productId: number) => shops.find(s => s.productIds.includes(productId)) ?? null;
export const shopBySlug = (slug: string) => shops.find(s => s.slug === slug) ?? null;
