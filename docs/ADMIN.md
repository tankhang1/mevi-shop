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
| `/admin/orders` | Đơn đặt hàng | Lọc theo trạng thái: all/new/confirmed/processing/shipped/completed/cancelled. Bảng mã đơn, người nhận, địa chỉ, tổng tiền, trạng thái; đổi trạng thái đơn **(bắt buộc hộp thoại xác nhận, xem bên dưới)**. |
| `/admin/agencies` | Đại lý | Danh sách đại lý (tìm theo tên/slug/SĐT, lọc Hoạt động/Tạm dừng); thêm đại lý mới; bật/tắt hoạt động (có xác nhận). Click dòng → trang chi tiết. |
| `/admin/agencies/:id` | Chi tiết đại lý | Xem/sửa toàn bộ thông tin, thống kê và đơn hàng của đại lý (xem bên dưới). |

### Form sản phẩm
- Bắt buộc: Tên, SKU, Danh mục, Giá bán (VND).
- Tuỳ chọn: Mô tả, Nguồn gốc/vùng trồng, Quy cách đóng gói, Hạn sử dụng, Hướng dẫn bảo quản, Giá khuyến mãi.
- Ảnh: JPEG/PNG/WebP ≤ 8 MB, nhiều ảnh, xoá từng ảnh.

### Xác nhận đổi trạng thái đơn hàng
- Chọn trạng thái mới **không** cập nhật ngay; mở `AlertDialog` (`@/components/ui/alert-dialog`):
  - Tiêu đề: "Đổi trạng thái đơn {code}?"
  - Nội dung: "{Trạng thái hiện tại} → {Trạng thái mới}", tên + SĐT người nhận.
  - Nút "Huỷ" (giữ nguyên select) / "Xác nhận" (gọi `useUpdateOrderStatus`, disable khi đang gửi).
- Chuyển sang `cancelled` hoặc `completed`: nút xác nhận màu đỏ/nhấn mạnh, ghi chú "Không thể hoàn tác".
- Thành công: toast "Đã cập nhật đơn {code}"; lỗi: toast lỗi, trạng thái giữ nguyên.

### Form đại lý
- Tên gian hàng*, Slug*, Màu thương hiệu, Logo URL, Người liên hệ, Điện thoại, Email.

### Chi tiết đại lý (`/admin/agencies/:id`)
- **Header**: logo + tên gian hàng (màu thương hiệu), slug, badge Hoạt động/Tạm dừng, nút "Bật/Tắt" (có xác nhận), nút "Sửa thông tin", link gian hàng công khai `/?ref={slug}` (copy link).
- **Thông tin**: người liên hệ, điện thoại (`tel:`), email (`mailto:`), màu thương hiệu (swatch + mã hex), logo, ngày tham gia.
- **Thống kê**: tổng đơn, đơn đang xử lý, doanh thu (đơn hoàn tất), giá trị đơn trung bình.
- **Đơn hàng của đại lý**: bảng đơn có `agencySlug = slug` (mã, khách, ngày, tổng tiền, trạng thái), lọc theo trạng thái, click → chi tiết đơn.
- **Sửa thông tin**: dùng lại form đại lý, validate slug duy nhất + màu `#RRGGBB`; đổi slug cảnh báo "link giới thiệu cũ sẽ không còn hiệu lực".
- Trạng thái: loading skeleton, "Không tìm thấy đại lý" nếu id sai, lỗi có nút thử lại.
- API cần thêm: `GET /admin/agencies/:id` (`useGetAgency`), `GET /admin/agencies/:id/orders` (`useListAgencyOrders`), dùng lại `PATCH /admin/agencies/:id` (`useUpdateAgency`).

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
