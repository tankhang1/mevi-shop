import type { Agency, Order, OrderInput, Product, ProductInput } from './generated/api.schemas';

// In-browser fake backend. All data is dummy and persisted in localStorage.
interface Db { products: Product[]; orders: Order[]; agencies: Agency[]; seq: number }

const STORAGE_KEY = 'mevi-mock-db-v2';
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

const seedProducts: Product[] = [
  { id: 1, name: 'Cà phê Robusta Buôn Ma Thuột', sku: 'CF-BMT-500', category: 'Cà phê', description: 'Hạt Robusta rang mộc, hái chín 100% từ vùng đất đỏ bazan Đắk Lắk. Vị đậm, hậu ngọt.', origin: 'Buôn Ma Thuột, Đắk Lắk', packageSize: 'Túi 500g', shelfLife: '12 tháng', storageInstructions: 'Bảo quản nơi khô ráo, tránh ánh nắng.', imageUrls: ['/products/buon-ma-thuot-robusta.jpg'], price: 189000, salePrice: 165000, status: 'approved', createdAt: daysAgo(20) },
  { id: 2, name: 'Tiêu đen Phú Quốc', sku: 'TI-PQ-200', category: 'Gia vị', description: 'Tiêu đen hạt chắc, cay thơm đặc trưng của đảo ngọc, phơi nắng tự nhiên.', origin: 'Phú Quốc, Kiên Giang', packageSize: 'Hũ 200g', shelfLife: '24 tháng', storageInstructions: 'Đậy kín nắp sau khi dùng.', imageUrls: ['/products/phu-quoc-pepper.jpg'], price: 125000, salePrice: null, status: 'approved', createdAt: daysAgo(15) },
  { id: 3, name: 'Mít sấy giòn', sku: 'MS-DT-250', category: 'Trái cây sấy', description: 'Mít Thái chín cây sấy chân không, giòn tự nhiên, không đường hóa học.', origin: 'Đồng Tháp', packageSize: 'Túi 250g', shelfLife: '9 tháng', storageInstructions: 'Dùng hết trong 7 ngày sau khi mở.', imageUrls: ['/products/dried-jackfruit.jpg'], price: 89000, salePrice: 79000, status: 'approved', createdAt: daysAgo(10) },
  { id: 4, name: 'Gạo ST25 Sóc Trăng', sku: 'GA-ST25-5', category: 'Gạo', description: 'Gạo ST25 hạt dài, dẻo thơm, canh tác theo hướng hữu cơ.', origin: 'Sóc Trăng', packageSize: 'Túi 5kg', shelfLife: '12 tháng', storageInstructions: 'Để nơi thoáng mát.', imageUrls: ['https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 210000, salePrice: 189000, status: 'approved', createdAt: daysAgo(8) },
  { id: 5, name: 'Sữa tươi thanh trùng Mộc Châu', sku: 'SU-MC-1L', category: 'Sữa', description: 'Sữa bò tươi nguyên chất từ cao nguyên Mộc Châu, thanh trùng giữ trọn vị béo.', origin: 'Mộc Châu, Sơn La', packageSize: 'Chai 1L', shelfLife: '10 ngày', storageInstructions: 'Bảo quản lạnh 2–6°C.', imageUrls: ['https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 42000, salePrice: null, status: 'approved', createdAt: daysAgo(3) },
  { id: 6, name: 'Trà Ô long Bảo Lộc', sku: 'TR-OL-100', category: 'Trà', description: 'Trà Ô long cao nguyên, hương hoa nhẹ, nước vàng sáng.', origin: 'Bảo Lộc, Lâm Đồng', packageSize: 'Hộp 100g', shelfLife: '18 tháng', storageInstructions: 'Đậy kín, tránh ẩm.', imageUrls: ['https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 145000, salePrice: null, status: 'approved', createdAt: daysAgo(12) },
  { id: 7, name: 'Việt quất Lâm Đồng', sku: 'TC-VQ-125', category: 'Trái cây tươi', description: 'Việt quất trồng nhà kính tại Đà Lạt, quả mọng, chua ngọt cân bằng.', origin: 'Đà Lạt, Lâm Đồng', packageSize: 'Hộp 125g', shelfLife: '7 ngày', storageInstructions: 'Bảo quản ngăn mát.', imageUrls: ['https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 95000, salePrice: null, status: 'pending', createdAt: daysAgo(1) },
  { id: 8, name: 'Chuối Laba Đà Lạt', sku: 'TC-CL-1K', category: 'Trái cây tươi', description: 'Giống chuối đặc sản Lâm Đồng, thịt dẻo, thơm ngọt, chín tự nhiên.', origin: 'Đức Trọng, Lâm Đồng', packageSize: 'Nải ~1kg', shelfLife: '5 ngày', storageInstructions: 'Để nơi thoáng mát, tránh dập.', imageUrls: ['https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 45000, salePrice: 39000, status: 'approved', createdAt: daysAgo(2) },
  { id: 9, name: 'Dứa Đồng Giao', sku: 'TC-DG-1Q', category: 'Trái cây tươi', description: 'Dứa Queen mắt nông, ngọt đậm, thơm lừng — đặc sản Ninh Bình.', origin: 'Tam Điệp, Ninh Bình', packageSize: '1 quả ~1.2kg', shelfLife: '7 ngày', storageInstructions: 'Để nơi thoáng mát.', imageUrls: ['https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 35000, salePrice: null, status: 'approved', createdAt: daysAgo(4) },
  { id: 10, name: 'Nho đen Ninh Thuận', sku: 'TC-NT-1K', category: 'Trái cây tươi', description: 'Nho đen hái tại vườn, vỏ mỏng, vị ngọt thanh, ít hạt.', origin: 'Phan Rang, Ninh Thuận', packageSize: 'Hộp 1kg', shelfLife: '10 ngày', storageInstructions: 'Bảo quản ngăn mát, không rửa trước.', imageUrls: ['https://images.pexels.com/photos/760281/pexels-photo-760281.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 120000, salePrice: 99000, status: 'approved', createdAt: daysAgo(6) },
  { id: 11, name: 'Bơ sáp Đắk Lắk', sku: 'TC-BS-1K', category: 'Trái cây tươi', description: 'Bơ sáp 034 cơm vàng, dẻo béo, hạt nhỏ — thu hoạch đúng vụ.', origin: 'Krông Pắc, Đắk Lắk', packageSize: 'Túi 1kg', shelfLife: '5 ngày', storageInstructions: 'Để chín tự nhiên ở nhiệt độ phòng.', imageUrls: ['https://images.pexels.com/photos/6157049/pexels-photo-6157049.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 69000, salePrice: 55000, status: 'approved', createdAt: daysAgo(1) },
  { id: 12, name: 'Xà lách thủy canh Đà Lạt', sku: 'RC-XL-500', category: 'Rau củ', description: 'Xà lách trồng thủy canh trong nhà màng, không thuốc trừ sâu.', origin: 'Đà Lạt, Lâm Đồng', packageSize: 'Túi 500g', shelfLife: '5 ngày', storageInstructions: 'Bảo quản ngăn mát, bọc kín.', imageUrls: ['https://images.pexels.com/photos/1199562/pexels-photo-1199562.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 32000, salePrice: null, status: 'approved', createdAt: daysAgo(2) },
  { id: 13, name: 'Khoai tây Đà Lạt', sku: 'RC-KT-1K', category: 'Rau củ', description: 'Khoai tây ruột vàng, bở thơm, thích hợp chiên, nấu canh.', origin: 'Đơn Dương, Lâm Đồng', packageSize: 'Túi 1kg', shelfLife: '30 ngày', storageInstructions: 'Để nơi khô thoáng, tránh ánh sáng.', imageUrls: ['https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 38000, salePrice: null, status: 'approved', createdAt: daysAgo(9) },
  { id: 14, name: 'Súp lơ trắng hữu cơ', sku: 'RC-SL-1B', category: 'Rau củ', description: 'Súp lơ hoa chắc, trắng ngà, canh tác theo tiêu chuẩn hữu cơ.', origin: 'Đà Lạt, Lâm Đồng', packageSize: '1 bông ~600g', shelfLife: '7 ngày', storageInstructions: 'Bảo quản ngăn mát.', imageUrls: ['https://images.pexels.com/photos/6316515/pexels-photo-6316515.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 45000, salePrice: 40000, status: 'approved', createdAt: daysAgo(3) },
  { id: 15, name: 'Combo rau củ gia đình', sku: 'RC-CB-3K', category: 'Rau củ', description: 'Hộp rau củ theo mùa đủ dùng 3–4 bữa: cải, cà rốt, bông cải, cà chua…', origin: 'Nhiều vùng trồng', packageSize: 'Hộp ~3kg', shelfLife: '5 ngày', storageInstructions: 'Bảo quản ngăn mát.', imageUrls: ['https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 199000, salePrice: 159000, status: 'approved', createdAt: daysAgo(0) },
  { id: 16, name: 'Ớt chỉ thiên Quảng Ngãi', sku: 'GV-OT-200', category: 'Gia vị', description: 'Ớt chỉ thiên cay nồng, màu đỏ tươi, hái trong ngày.', origin: 'Quảng Ngãi', packageSize: 'Túi 200g', shelfLife: '10 ngày', storageInstructions: 'Bảo quản ngăn mát.', imageUrls: ['https://images.pexels.com/photos/4033324/pexels-photo-4033324.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 25000, salePrice: null, status: 'approved', createdAt: daysAgo(5) },
  { id: 17, name: 'Bột trà xanh Thái Nguyên', sku: 'TR-MT-100', category: 'Trà', description: 'Bột trà xanh xay mịn từ búp non Thái Nguyên, dùng pha uống hoặc làm bánh.', origin: 'Thái Nguyên', packageSize: 'Túi 100g', shelfLife: '12 tháng', storageInstructions: 'Đậy kín, tránh ẩm và ánh sáng.', imageUrls: ['https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 135000, salePrice: 115000, status: 'approved', createdAt: daysAgo(7) },
  { id: 18, name: 'Rau mùi hữu cơ', sku: 'RC-RM-100', category: 'Rau củ', description: 'Rau mùi thơm, lá xanh mướt, thu hoạch sáng sớm.', origin: 'Hà Nội', packageSize: 'Bó 100g', shelfLife: '4 ngày', storageInstructions: 'Cắm gốc vào nước hoặc bọc giấy ẩm.', imageUrls: ['https://images.pexels.com/photos/7456525/pexels-photo-7456525.jpeg?auto=compress&cs=tinysrgb&w=900'], price: 12000, salePrice: null, status: 'pending', createdAt: daysAgo(0) },
];

const seedAgencies: Agency[] = [
  { id: 1, slug: 'dalat-xanh', displayName: 'Đà Lạt Xanh', logoUrl: null, primaryColor: '#2f6b4f', contactName: 'Nguyễn Thị Lan', contactPhone: '0901234567', contactEmail: 'lan@dalatxanh.vn', active: true },
  { id: 2, slug: 'mekong-farm', displayName: 'Mekong Farm', logoUrl: null, primaryColor: '#a5582f', contactName: 'Trần Văn Minh', contactPhone: '0912345678', contactEmail: 'minh@mekongfarm.vn', active: true },
];

function makeOrder(id: number, customerName: string, status: Order['status'], items: [number, number][], agencySlug: string | null, d: number): Order {
  const lines = items.map(([productId, quantity], i) => {
    const p = seedProducts.find(x => x.id === productId)!;
    const unitPrice = p.salePrice ?? p.price;
    return { id: id * 10 + i, productId, productName: p.name, quantity, unitPrice, lineTotal: unitPrice * quantity };
  });
  return { id, code: `MV${String(1000 + id)}`, customerName, phone: '0987654321', address: '12 Lê Lợi', province: 'TP. Hồ Chí Minh', district: 'Quận 1', note: null, total: lines.reduce((s, l) => s + l.lineTotal, 0), status, agencySlug, items: lines, createdAt: daysAgo(d) };
}

const seedOrders: Order[] = [
  makeOrder(1, 'Lê Minh Anh', 'completed', [[1, 2], [3, 1]], 'dalat-xanh', 9),
  makeOrder(2, 'Phạm Quốc Huy', 'shipped', [[2, 3]], null, 4),
  makeOrder(3, 'Võ Thu Trang', 'confirmed', [[4, 1], [5, 1]], 'mekong-farm', 2),
  makeOrder(4, 'Đặng Hoàng Nam', 'new', [[1, 1]], 'dalat-xanh', 0),
];

function load(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to seed */ }
  return { products: seedProducts, orders: seedOrders, agencies: seedAgencies, seq: 100 };
}
let db = load();
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch { /* storage unavailable */ } };

export class MockHttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
const notFound = () => { throw new MockHttpError(404, 'Not found'); };
const isOpen = (o: Order) => !['completed', 'cancelled'].includes(o.status);
const revenue = (orders: Order[]) => orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
const recent = (orders: Order[]) => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
// The demo agency account always manages the first agency.
const myAgency = () => db.agencies[0] ?? notFound();

export function mockRequest(method: string, url: string, body: unknown): unknown {
  const { pathname, searchParams: q } = new URL(url, 'http://mock');
  const path = pathname.replace(/^.*?\/api/, '');
  const seg = path.split('/').filter(Boolean);
  const id = Number(seg[seg.length - 1]);
  const route = `${method} ${path.replace(/\/\d+(?=\/|$)/g, '/:id')}`;

  if (method === 'GET' && seg[0] === 'agencies' && seg.length === 2) {
    const a = db.agencies.find(x => x.slug === seg[1]) ?? notFound();
    return { id: a.id, slug: a.slug, displayName: a.displayName, logoUrl: a.logoUrl, primaryColor: a.primaryColor, active: a.active };
  }

  switch (route) {
    case 'GET /healthz': return { status: 'ok' };

    case 'GET /products': {
      const term = q.get('q')?.toLowerCase(); const category = q.get('category'); const sort = q.get('sort');
      const minPrice = Number(q.get('minPrice') ?? 0); const maxPrice = Number(q.get('maxPrice') ?? Infinity);
      const price = (p: Product) => p.salePrice ?? p.price;
      const list = db.products.filter(p => p.status === 'approved'
        && (!term || `${p.name} ${p.description} ${p.origin}`.toLowerCase().includes(term))
        && (!category || p.category === category) && price(p) >= minPrice && price(p) <= maxPrice);
      if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      else if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
      else if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
      return list;
    }
    case 'GET /products/:id': return db.products.find(p => p.id === id && p.status === 'approved') ?? notFound();

    case 'POST /orders': {
      const input = body as OrderInput;
      const order = makeOrderFromInput(input);
      db.orders.push(order); save();
      return order;
    }

    case 'GET /admin/summary': return {
      productCount: db.products.length, pendingProducts: db.products.filter(p => p.status === 'pending').length,
      orderCount: db.orders.length, newOrders: db.orders.filter(o => o.status === 'new').length,
      totalRevenue: revenue(db.orders), recentOrders: recent(db.orders),
    };
    case 'GET /admin/products': {
      const status = q.get('status') ?? 'all';
      return [...db.products].filter(p => status === 'all' || p.status === status).sort((a, b) => b.id - a.id);
    }
    case 'POST /admin/products': {
      const product: Product = { ...(body as ProductInput), id: ++db.seq, status: 'pending', rejectionReason: null, createdAt: new Date().toISOString() };
      db.products.push(product); save();
      return product;
    }
    case 'PATCH /admin/products/:id': return updateIn(db.products, id, body as Partial<Product>);
    case 'DELETE /admin/products/:id': {
      db.products = db.products.filter(p => p.id !== id); save();
      return null;
    }
    case 'POST /admin/products/:id/approval': {
      const pid = Number(seg[2]);
      const { status, rejectionReason } = body as { status: 'approved' | 'rejected'; rejectionReason?: string | null };
      return updateIn(db.products, pid, { status, rejectionReason: status === 'rejected' ? rejectionReason ?? null : null });
    }

    case 'GET /admin/orders': {
      const status = q.get('status') ?? 'all';
      return [...db.orders].filter(o => status === 'all' || o.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    case 'PATCH /admin/orders/:id': return updateIn(db.orders, id, { status: (body as { status: Order['status'] }).status });

    case 'GET /admin/agencies': return db.agencies;
    case 'POST /admin/agencies': {
      const agency: Agency = { ...(body as Omit<Agency, 'id' | 'active'>), logoUrl: (body as Agency).logoUrl ?? null, id: ++db.seq, active: true };
      db.agencies.push(agency); save();
      return agency;
    }
    case 'PATCH /admin/agencies/:id': return updateIn(db.agencies, id, body as Partial<Agency>);

    case 'GET /agency/summary': {
      const orders = db.orders.filter(o => o.agencySlug === myAgency().slug);
      return { orderCount: orders.length, openOrders: orders.filter(isOpen).length, totalRevenue: revenue(orders), recentOrders: recent(orders) };
    }
    case 'GET /agency/settings': return myAgency();
    case 'PATCH /agency/settings': return updateIn(db.agencies, myAgency().id, body as Partial<Agency>);

    case 'POST /storage/uploads/request-url': return { uploadURL: 'mock-upload://', objectPath: '' };
  }
  throw new MockHttpError(404, `No mock for ${method} ${path}`);
}

function updateIn<T extends { id: number }>(list: T[], id: number, patch: Partial<T>): T {
  const item = list.find(x => x.id === id) ?? notFound();
  Object.assign(item, patch); save();
  return item;
}

function makeOrderFromInput(input: OrderInput): Order {
  if (!input.items?.length) throw new MockHttpError(400, 'Order has no items');
  const orderId = ++db.seq;
  const items = input.items.map((it, i) => {
    const p = db.products.find(x => x.id === it.productId) ?? notFound();
    const unitPrice = p.salePrice ?? p.price;
    return { id: orderId * 10 + i, productId: p.id, productName: p.name, quantity: it.quantity, unitPrice, lineTotal: unitPrice * it.quantity };
  });
  return {
    id: orderId, code: `MV${1000 + orderId}`, customerName: input.customerName, phone: input.phone, address: input.address,
    province: input.province, district: input.district, note: input.note ?? null, agencySlug: input.agencySlug ?? null,
    total: items.reduce((s, l) => s + l.lineTotal, 0), status: 'new', items, createdAt: new Date().toISOString(),
  };
}
