# Mevi Admin — Chức năng quản trị

> Trang quản trị đã được gỡ khỏi web app khách hàng (trước đây `src/App.tsx`). Tài liệu này mô tả đầy đủ chức năng để dựng lại thành app admin riêng. Hooks admin (orval) đã bị xoá khi chuyển sang API layer viết tay; khôi phục từ git `cc4da8b:src/lib/api/`.

## Phân quyền
- Role `admin` (cần thêm lại vào `src/features/auth/model/auth.store.ts`). Mọi route `/admin/*` bọc trong `<Gate role="admin">`.
- Sau đăng nhập, admin được chuyển tới `/admin/dashboard`.

## Layout (AdminShell)
- Sidebar xanh `#214c3a`: Tổng quan · Sản phẩm · Duyệt sản phẩm · Đơn đặt hàng · Đại lý; link "Về cửa hàng".
- Header sticky hiển thị tiêu đề trang, nút menu trên mobile.

## Routes & chức năng

| Route | Trang | Chức năng |
|---|---|---|
| `/admin/dashboard` | Tổng quan | 4 chỉ số: số sản phẩm, chờ duyệt, số đơn (+ đơn mới), doanh thu (đơn hoàn tất). Bảng đơn hàng gần đây. |
| `/admin/products` | Quản lý sản phẩm | Bảng: ảnh, tên, SKU, danh mục, giá, trạng thái. Sửa / xóa (confirm). Nút thêm sản phẩm. |
| `/admin/products/new` | Thêm sản phẩm | Form tạo mới (xem trường bên dưới). |
| `/admin/products/:id/edit` | Sửa sản phẩm | Nạp dữ liệu sản phẩm, cập nhật. Báo "Không tìm thấy" nếu id không tồn tại. |
| `/admin/products/approval` | Duyệt sản phẩm | Danh sách sản phẩm `pending`: Duyệt, hoặc Từ chối kèm lý do bắt buộc. |
| `/admin/orders` | Đơn đặt hàng | Lọc theo trạng thái: all/new/confirmed/processing/shipped/completed/cancelled. Bảng mã đơn, người nhận, địa chỉ, tổng tiền, trạng thái; đổi trạng thái đơn. |
| `/admin/agencies` | Đại lý | Danh sách đại lý; thêm đại lý mới; bật/tắt hoạt động. |

### Form sản phẩm
- Bắt buộc: Tên, SKU, Danh mục, Giá bán (VND).
- Tuỳ chọn: Mô tả, Nguồn gốc/vùng trồng, Quy cách đóng gói, Hạn sử dụng, Hướng dẫn bảo quản, Giá khuyến mãi.
- Ảnh: JPEG/PNG/WebP ≤ 8 MB, nhiều ảnh, xoá từng ảnh.

### Form đại lý
- Tên gian hàng*, Slug*, Màu thương hiệu, Logo URL, Người liên hệ, Điện thoại, Email.

## API hooks (orval generated)
| Hook | Mục đích |
|---|---|
| `useGetAdminSummary` | Số liệu dashboard + đơn gần đây |
| `useListAdminProducts({ status })` | `all` / `pending` / `approved` |
| `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct` | CRUD sản phẩm |
| `useModerateProduct` | `{ status: approved \| rejected, rejectionReason }` |
| `useListAdminOrders({ status })`, `useUpdateOrderStatus` | Quản lý đơn |
| `useListAgencies`, `useCreateAgency`, `useUpdateAgency` | Quản lý đại lý |

## Luồng trạng thái
- Sản phẩm: `pending` → `approved` (hiện trên cửa hàng) / `rejected`.
- Đơn hàng: `new` → `confirmed` → `processing` → `shipped` → `completed`; có thể `cancelled`.

## Dựng lại
Có thể khôi phục code gốc từ git: `git show cc4da8b:src/App.tsx` (các hàm `AdminShell`, `AdminDashboard`, `AdminProducts`, `ProductEditor`, `ApprovalPage`, `OrdersPage`, `AgenciesPage`).
